import { Nav } from "@/components/Nav";
import { fetchHistory } from "@/lib/db";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  posted: "Gepost",
  rejected: "Afgewezen",
  publish_blocked: "Geblokkeerd door guard",
  publish_failed: "Publish gefaald",
};

const ACTION_TONE: Record<string, string> = {
  posted: "border-emerald-500/40 bg-emerald-500/5",
  rejected: "border-red-500/30 bg-red-500/5",
  publish_blocked: "border-yellow-500/40 bg-yellow-500/5",
  publish_failed: "border-yellow-500/40 bg-yellow-500/5",
};

export default async function HistoryPage() {
  const entries = await fetchHistory(30);
  const counts = entries.reduce(
    (a, e) => {
      a[e.action] = (a[e.action] || 0) + 1;
      return a;
    },
    {} as Record<string, number>,
  );
  return (
    <>
      <Nav active="history" />
      <main className="max-w-4xl mx-auto px-5 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">History</h1>
          <p className="text-sm text-[color:var(--color-mute)] mt-0.5">
            Beslissingen van de afgelopen 30 dagen.{" "}
            <span className="serif-italic">Wat ging de wereld in.</span>
          </p>
        </div>

        <div className="glass rounded-xl px-5 py-3 flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <span className="brand-eyebrow">Samenvatting</span>
          {(["posted", "rejected", "publish_blocked"] as const).map((a) => (
            <div key={a} className="flex items-center gap-2">
              <span className="text-[color:var(--color-mute)]">{ACTION_LABEL[a] || a}</span>
              <span className="font-bold tabular-nums">{counts[a] || 0}</span>
            </div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="glass-card p-10 text-center text-sm text-[color:var(--color-mute)]">
            Nog geen beslissingen.
          </div>
        )}

        {entries.map((e) => (
          <article key={e.decision_id} className={`glass-card p-4 ${ACTION_TONE[e.action] || ""}`}>
            <div className="flex justify-between items-baseline gap-2 flex-wrap">
              <span className="brand-eyebrow">
                {ACTION_LABEL[e.action] || e.action} ·{" "}
                <span className="text-[color:var(--color-mute)] tracking-normal normal-case font-normal">
                  {new Date(e.decided_at).toLocaleString("nl-BE")}
                  {e.decided_by && ` · ${e.decided_by}`}
                </span>
              </span>
              {e.composite_score != null && (
                <span className="text-xs text-[color:var(--color-mute)] tabular-nums">
                  score {e.composite_score.toFixed(2)}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm">{e.edited_text || e.text}</p>
            <p className="mt-2 text-xs text-[color:var(--color-mute)] line-clamp-2">
              <span className="brand-eyebrow text-[10px] mr-2">Op tweet</span>
              {e.tweet_text}
            </p>
            {e.posted_tweet_id && (
              <a
                href={`https://x.com/DiscoursDialoog/status/${e.posted_tweet_id}`}
                target="_blank"
                rel="noopener"
                className="x-link text-xs mt-2 inline-block"
              >
                Open op X →
              </a>
            )}
          </article>
        ))}
      </main>
    </>
  );
}
