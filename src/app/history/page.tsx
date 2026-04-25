import { Nav } from "@/components/Nav";
import { fetchHistory } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const entries = await fetchHistory(30);
  return (
    <>
      <Nav active="history" />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-3">
        <h1 className="text-lg font-semibold">History (laatste 30 dagen)</h1>
        {entries.length === 0 && (
          <div className="glass-card p-8 text-center text-[color:var(--color-mute)]">
            Nog geen beslissingen.
          </div>
        )}
        {entries.map((e) => {
          const tone =
            e.action === "posted" ? "border-emerald-500/40 bg-emerald-500/5"
              : e.action === "rejected" ? "border-red-500/40 bg-red-500/5"
              : "border-yellow-500/40 bg-yellow-500/5";
          return (
            <article key={e.decision_id} className={`glass-card p-4 border ${tone}`}>
              <div className="flex justify-between items-baseline gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider text-[color:var(--color-mute)]">
                  {e.action} · {new Date(e.decided_at).toLocaleString("nl-BE")}
                  {e.decided_by && ` · ${e.decided_by}`}
                </span>
                {e.composite_score != null && (
                  <span className="text-xs text-[color:var(--color-mute)]">
                    score {e.composite_score.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm">{e.edited_text || e.text}</p>
              <p className="mt-2 text-xs text-[color:var(--color-mute)] line-clamp-2">
                Op: {e.tweet_text}
              </p>
              {e.posted_tweet_id && (
                <a
                  href={`https://x.com/DiscoursDialoog/status/${e.posted_tweet_id}`}
                  target="_blank"
                  rel="noopener"
                  className="text-xs text-[color:var(--color-mute)] hover:text-white"
                >
                  Open verzonden tweet
                </a>
              )}
            </article>
          );
        })}
      </main>
    </>
  );
}
