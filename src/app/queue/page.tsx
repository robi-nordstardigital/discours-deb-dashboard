import { Nav } from "@/components/Nav";
import { TweetCard } from "@/components/Tweet";
import { VariantCard } from "@/components/VariantCard";
import { fetchQueue, fetchSettings, type QueueItem } from "@/lib/db";
import { rejectCandidate } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function CandidateRow({ item }: { item: QueueItem }) {
  const top = Math.max(0, ...item.responses.map((v) => v.composite_score ?? 0));
  return (
    <article className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] gap-4 items-start">
        <TweetCard item={item} />
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="brand-eyebrow flex items-center gap-2">
              <span>5 voorgestelde reacties</span>
              <span className="text-[color:var(--color-mute)] normal-case font-normal tracking-normal">
                top {top.toFixed(2)}
              </span>
            </div>
            <form action={rejectCandidate}>
              <input type="hidden" name="candidate_id" value={item.candidate_id} />
              <button className="btn-secondary text-[11px] text-[color:var(--color-mute)] hover:text-red-300 px-2 py-1 rounded">
                Sla deze tweet over
              </button>
            </form>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {item.responses.map((v) => (
              <VariantCard key={v.id} v={v} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function StatusFooter({ counts }: { counts: any }) {
  const items: { label: string; value: number | string }[] = [
    { label: "Active accts", value: counts.active_accounts },
    { label: "Tweets seen", value: counts.seen },
    { label: "Candidates", value: counts.new_candidates },
    { label: "High quality", value: counts.high_quality },
    { label: "Posted 24h", value: counts.posted_24h },
  ];
  return (
    <div className="glass rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs">
      <span className="brand-eyebrow">Pipeline status</span>
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        {items.map((i) => (
          <div key={i.label} className="flex items-center gap-2">
            <span className="text-[color:var(--color-mute)]">{i.label}</span>
            <span className="font-bold tabular-nums">{i.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function QueuePage() {
  const [items, settings] = await Promise.all([fetchQueue(20), fetchSettings()]);
  return (
    <>
      <Nav active="queue" />
      <main className="max-w-7xl mx-auto px-5 py-6 space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Queue</h1>
            <p className="text-sm text-[color:var(--color-mute)] mt-0.5">
              {items.length} tweet{items.length === 1 ? "" : "s"} met scoring ≥ 5
              wachten op review.{" "}
              <span className="serif-italic">Degelijkheid &amp; dialoog.</span>
            </p>
          </div>
        </div>
        <StatusFooter counts={settings.counts} />
        {items.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <div className="brand-eyebrow mb-2">Wachtrij leeg</div>
            <p className="text-[color:var(--color-mute)] text-sm">
              Wacht op de volgende watcher run, of trigger handmatig{" "}
              <code className="px-1.5 py-0.5 rounded bg-black/40 text-xs">scripts/deb_watcher.py</code>.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {items.map((item) => (
              <CandidateRow key={item.candidate_id} item={item} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
