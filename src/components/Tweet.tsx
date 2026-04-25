import type { QueueItem } from "@/lib/db";

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("nl-BE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TweetCard({ item }: { item: QueueItem }) {
  const date = formatDate(item.tweet_created_at);
  return (
    <div className="tweet-card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
            style={{ background: "var(--color-burgundy-soft)" }}
          >
            {(item.tweet_author_name || item.tweet_author || "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold truncate">
              {item.tweet_author_name || item.tweet_author}
            </div>
            <div className="text-xs text-[color:var(--color-mute)] flex items-center gap-1.5 flex-wrap">
              <span>@{item.tweet_author}</span>
              {item.tweet_author_followers != null && (
                <>
                  <span>·</span>
                  <span>{item.tweet_author_followers.toLocaleString("nl-BE")} followers</span>
                </>
              )}
              {date && (
                <>
                  <span>·</span>
                  <span>{date}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <a
          href={item.tweet_url}
          target="_blank"
          rel="noopener"
          className="btn-secondary text-xs font-medium px-3 py-1.5 rounded-md whitespace-nowrap"
        >
          Open op X →
        </a>
      </div>

      <div className="brand-eyebrow mb-2">Originele tweet</div>
      <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-white/95">
        {item.tweet_text}
      </p>

      {item.top_episodes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="brand-eyebrow mb-2">BM25 match</div>
          <ul className="space-y-1 text-xs">
            {item.top_episodes.map((ep) => (
              <li key={ep.episode_nr} className="flex items-center gap-2">
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                  style={{
                    background: "rgba(217,78,106,0.15)",
                    color: "var(--color-rose)",
                  }}
                >
                  EP {ep.episode_nr}
                </span>
                <span className="text-[color:var(--color-mute)] truncate">{ep.title}</span>
                <span className="text-[10px] tabular-nums text-[color:var(--color-mute)] ml-auto shrink-0">
                  {ep.rank.toFixed(3)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
