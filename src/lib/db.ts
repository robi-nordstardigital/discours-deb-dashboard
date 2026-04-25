import { Pool, type PoolClient } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __debPool: Pool | undefined;
}

export function pool(): Pool {
  if (!global.__debPool) {
    const url = process.env.DEB_DATABASE_URL;
    if (!url) throw new Error("DEB_DATABASE_URL not set");
    global.__debPool = new Pool({ connectionString: url, max: 8 });
  }
  return global.__debPool;
}

export async function withClient<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await pool().connect();
  try {
    return await fn(c);
  } finally {
    c.release();
  }
}

export type QueueItem = {
  candidate_id: number;
  tweet_id: string;
  tweet_text: string;
  tweet_author: string;
  tweet_author_name: string | null;
  tweet_author_followers: number | null;
  tweet_lang: string | null;
  bm25_top_score: number;
  top_episode_titles: string[];
  responses: ResponseVariant[];
};

export type ResponseVariant = {
  id: number;
  variant_idx: number;
  variant_label: string | null;
  text: string;
  episode_nr: number | null;
  quote_timestamp: string | null;
  youtube_url: string | null;
  composite_score: number | null;
  scores: Record<string, { score: number; why: string }> | null;
};

export async function fetchQueue(limit = 30): Promise<QueueItem[]> {
  return withClient(async (c) => {
    const { rows } = await c.query<{
      candidate_id: number;
      tweet_id: string;
      tweet_json: any;
      bm25_top_score: number;
      top_episodes: any;
      responses: any;
    }>(
      `
      SELECT c.id AS candidate_id,
             c.tweet_id,
             t.tweet_json,
             c.bm25_top_score,
             c.top_episodes,
             COALESCE(json_agg(json_build_object(
               'id', r.id,
               'variant_idx', r.variant_idx,
               'variant_label', r.variant_label,
               'text', r.text,
               'episode_nr', r.episode_nr,
               'quote_timestamp', r.quote_timestamp,
               'youtube_url', r.youtube_url,
               'composite_score', r.composite_score,
               'scores', r.scores
             ) ORDER BY r.composite_score DESC NULLS LAST) FILTER (WHERE r.id IS NOT NULL), '[]'::json) AS responses
      FROM candidates c
      JOIN seen_tweets t ON t.tweet_id = c.tweet_id
      LEFT JOIN responses r ON r.candidate_id = c.id
      WHERE c.status IN ('responded', 'new')
        AND NOT EXISTS (SELECT 1 FROM decisions d WHERE d.response_id = r.id AND d.action IN ('posted','rejected'))
      GROUP BY c.id, c.tweet_id, t.tweet_json, c.bm25_top_score, c.top_episodes
      HAVING COUNT(r.id) FILTER (WHERE r.composite_score IS NOT NULL AND r.composite_score >= 5) > 0
      ORDER BY MAX(r.composite_score) DESC NULLS LAST
      LIMIT $1
      `,
      [limit],
    );
    return rows.map((r) => {
      const tw = r.tweet_json || {};
      const eps = (r.top_episodes as any[]) || [];
      return {
        candidate_id: r.candidate_id,
        tweet_id: r.tweet_id,
        tweet_text: tw.text || "",
        tweet_author: tw.author_username || tw.author_id || "",
        tweet_author_name: tw.author_name || null,
        tweet_author_followers: tw.author_followers ?? null,
        tweet_lang: tw.lang ?? null,
        bm25_top_score: Number(r.bm25_top_score),
        top_episode_titles: eps.slice(0, 3).map((e) => `${e.episode_nr}: ${e.title}`),
        responses: (r.responses as ResponseVariant[]).filter((v) => v.composite_score !== null),
      };
    });
  });
}

export type HistoryEntry = {
  decision_id: number;
  action: string;
  decided_at: string;
  decided_by: string | null;
  text: string;
  edited_text: string | null;
  composite_score: number | null;
  candidate_id: number;
  tweet_text: string;
  posted_tweet_id: string | null;
};

export async function fetchHistory(days = 30): Promise<HistoryEntry[]> {
  return withClient(async (c) => {
    const { rows } = await c.query<HistoryEntry & { tweet_json: any }>(
      `
      SELECT d.id AS decision_id,
             d.action,
             d.decided_at,
             d.decided_by,
             d.edited_text,
             d.posted_tweet_id,
             r.text,
             r.composite_score,
             r.candidate_id,
             t.tweet_json
      FROM decisions d
      JOIN responses r ON r.id = d.response_id
      JOIN candidates c ON c.id = r.candidate_id
      JOIN seen_tweets t ON t.tweet_id = c.tweet_id
      WHERE d.decided_at >= NOW() - ($1 || ' days')::interval
      ORDER BY d.decided_at DESC
      `,
      [String(days)],
    );
    return rows.map((r) => ({ ...r, tweet_text: r.tweet_json?.text || "" }));
  });
}

export async function fetchSettings() {
  return withClient(async (c) => {
    const accounts = await c.query(
      `SELECT author_id, username, display_name, last_synced_at, active
       FROM watched_accounts
       ORDER BY active DESC, username ASC`,
    );
    const counts = await c.query(
      `SELECT
         (SELECT COUNT(*) FROM watched_accounts WHERE active) AS active_accounts,
         (SELECT COUNT(*) FROM seen_tweets) AS seen,
         (SELECT COUNT(*) FROM candidates WHERE status='new') AS new_candidates,
         (SELECT COUNT(*) FROM responses WHERE composite_score IS NULL) AS unscored,
         (SELECT COUNT(*) FROM responses WHERE composite_score >= 7) AS high_quality,
         (SELECT COUNT(*) FROM decisions WHERE decided_at > NOW() - interval '24 hours' AND action='posted') AS posted_24h`,
    );
    return {
      accounts: accounts.rows,
      counts: counts.rows[0],
    };
  });
}
