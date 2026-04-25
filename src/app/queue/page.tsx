import { Nav } from "@/components/Nav";
import { fetchQueue, type QueueItem, type ResponseVariant } from "@/lib/db";
import { publishResponse, rejectCandidate, rejectResponse } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function ScoreBadge({ value, label }: { value: number; label: string }) {
  const color =
    value >= 8 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      : value >= 6 ? "bg-yellow-500/15 text-yellow-200 border-yellow-500/30"
      : "bg-red-500/15 text-red-300 border-red-500/30";
  return (
    <span
      title={label}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded score-pill border ${color}`}
    >
      <span className="opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

function VariantCard({ v }: { v: ResponseVariant }) {
  const composite = v.composite_score ?? 0;
  const labelMap: Record<string, string> = {
    beamend_kern: "Beamend",
    beamend_andere_invalshoek: "Beamend +",
    beamend_guest_perspective: "Guest",
    nuancerend: "Nuancerend",
    ludiek: "Ludiek",
    ludiek_luchtig: "Ludiek",
  };
  const label = labelMap[v.variant_label || ""] || v.variant_label || `Variant ${v.variant_idx}`;
  const compositeClass =
    composite >= 8 ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      : composite >= 6 ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-200"
      : "border-red-500/40 bg-red-500/10 text-red-200";
  return (
    <form action={publishResponse} className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-[color:var(--color-mute)]">
            {label}
          </span>
          {v.episode_nr && (
            <span className="text-xs text-[color:var(--color-mute)]">EP {v.episode_nr}</span>
          )}
        </div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full border score-pill ${compositeClass}`}
        >
          {composite.toFixed(2)}
        </span>
      </div>

      <textarea
        name="edited_text"
        rows={4}
        defaultValue={v.text}
        maxLength={280}
        className="bg-black/30 border border-[color:var(--color-line)] rounded-lg p-3 text-sm leading-relaxed outline-none focus:border-white/40 resize-none"
      />

      <div className="flex flex-wrap gap-1.5">
        {v.scores &&
          (["relevance", "appropriateness", "authenticity", "added_value", "diversity"] as const).map(
            (k) =>
              v.scores?.[k] ? (
                <ScoreBadge key={k} value={v.scores[k].score} label={k.slice(0, 3).toUpperCase()} />
              ) : null,
          )}
      </div>

      {v.youtube_url && (
        <a
          href={v.youtube_url}
          target="_blank"
          rel="noopener"
          className="text-xs text-[color:var(--color-mute)] hover:text-white truncate"
        >
          {v.youtube_url}
        </a>
      )}

      <input type="hidden" name="response_id" value={v.id} />
      <div className="flex gap-2">
        <button
          formAction={publishResponse}
          className="flex-1 btn-publish text-white font-medium rounded-lg py-2 text-sm"
        >
          Publish
        </button>
        <button
          formAction={rejectResponse}
          className="btn-reject text-white font-medium rounded-lg px-3 py-2 text-sm"
        >
          Reject
        </button>
      </div>
    </form>
  );
}

function CandidateRow({ item }: { item: QueueItem }) {
  return (
    <article className="space-y-3">
      <header className="glass rounded-2xl p-4">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <div className="text-sm font-medium">
              @{item.tweet_author}{" "}
              {item.tweet_author_name && (
                <span className="text-[color:var(--color-mute)] font-normal">
                  ({item.tweet_author_name})
                </span>
              )}
            </div>
            <div className="text-xs text-[color:var(--color-mute)]">
              BM25 {item.bm25_top_score.toFixed(3)} · {item.responses.length} varianten ·
              {item.tweet_author_followers != null && ` ${item.tweet_author_followers} followers ·`}{" "}
              <a
                className="hover:text-white underline-offset-2 hover:underline"
                href={`https://x.com/${item.tweet_author}/status/${item.tweet_id}`}
                target="_blank"
                rel="noopener"
              >
                Open op X
              </a>
            </div>
          </div>
          <form action={rejectCandidate}>
            <input type="hidden" name="candidate_id" value={item.candidate_id} />
            <button className="text-xs text-[color:var(--color-mute)] hover:text-red-300 px-2 py-1">
              Sla deze kandidaat over
            </button>
          </form>
        </div>
        <p className="mt-2 text-base leading-relaxed">{item.tweet_text}</p>
        {item.top_episode_titles.length > 0 && (
          <p className="mt-2 text-xs text-[color:var(--color-mute)]">
            Best gematched: {item.top_episode_titles.join(" · ")}
          </p>
        )}
      </header>
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {item.responses.map((v) => (
          <VariantCard key={v.id} v={v} />
        ))}
      </div>
    </article>
  );
}

export default async function QueuePage() {
  const items = await fetchQueue(20);
  return (
    <>
      <Nav active="queue" />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Queue</h1>
            <p className="text-sm text-[color:var(--color-mute)]">
              {items.length} kandidaten met scoring ≥ 5 wachten op review
            </p>
          </div>
        </div>
        {items.length === 0 && (
          <div className="glass-card p-8 text-center text-[color:var(--color-mute)]">
            Geen kandidaten in de wachtrij. Wacht op de volgende watcher run, of trigger
            handmatig <code>scripts/deb_watcher.py</code>.
          </div>
        )}
        {items.map((item) => (
          <CandidateRow key={item.candidate_id} item={item} />
        ))}
      </main>
    </>
  );
}
