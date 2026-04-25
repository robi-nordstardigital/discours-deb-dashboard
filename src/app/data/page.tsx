import { Nav } from "@/components/Nav";
import { fetchPipelineStats } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TOTAL_KNOWN_EPISODES = 247; // ep 0..246

export default async function DataPage() {
  const s = await fetchPipelineStats();

  const presentSet = new Set(s.episode_nrs_present);
  const missingNrs: number[] = [];
  for (let n = 0; n <= 246; n++) {
    if (!presentSet.has(n)) missingNrs.push(n);
  }

  const fundeel: FunnelStage[] = [
    {
      label: "Watched accounts",
      n: s.watched_active,
      sub: `${s.watched_inactive} inactive bewaard`,
      tone: "rose",
    },
    {
      label: "Tweets gefetched",
      n: s.tweets_seen_total,
      sub: `${s.tweets_seen_24h} laatste 24u`,
      tone: "cream",
    },
    {
      label: "BM25 candidates",
      n: s.candidates_total,
      sub: `${s.candidates_new} wachten op response gen`,
      tone: "cream",
    },
    {
      label: "Responses gegenereerd",
      n: s.responses_total,
      sub: `${s.responses_unscored} ongesc.`,
      tone: "cream",
    },
    {
      label: "Doorgekomen",
      n: s.responses_high + s.responses_mid,
      sub: `${s.responses_high} ≥ 7, ${s.responses_mid} ≥ 5`,
      tone: "rose",
    },
    {
      label: "Gepost",
      n: s.posted_total,
      sub: `${s.rejected_total} rejected, ${s.responses_autoreject} auto-rej.`,
      tone: "green",
    },
  ];

  const corpus: CorpusStat[] = [
    {
      label: "Episodes geïndexeerd",
      n: s.episodes_indexed,
      max: TOTAL_KNOWN_EPISODES,
      hint: `${TOTAL_KNOWN_EPISODES - s.episodes_indexed} ontbreken in 0–246 reeks`,
    },
    {
      label: "Volledige transcripts",
      n: s.episodes_with_transcript,
      max: s.episodes_indexed,
      hint: `${s.episodes_without_transcript} zonder transcript ${
        s.episodes_indexed
      }, ${s.transcript_mb.toFixed(1)} MB totaal`,
    },
    {
      label: "Longreads (Humo-stijl)",
      n: s.episodes_with_longread,
      max: s.episodes_indexed,
      hint: `${s.episodes_indexed - s.episodes_with_longread} episodes nog zonder artikel`,
    },
  ];

  const gaps: GapItem[] = [
    {
      severity: missingNrs.length > 0 ? "warn" : "ok",
      title: "Episodes ontbreken in DB",
      n: missingNrs.length,
      detail:
        missingNrs.length === 0
          ? "Alle 0–246 episodes zitten erin."
          : `Episode-nummers: ${missingNrs.slice(0, 60).join(", ")}${
              missingNrs.length > 60 ? `, … (+${missingNrs.length - 60})` : ""
            }`,
      action:
        missingNrs.length > 0
          ? "Run python scripts/pipeline.py <youtube_id> per ontbrekende episode (yt-dlp moet kanaal-feed nog vinden)."
          : null,
    },
    {
      severity: s.episodes_without_transcript > 0 ? "warn" : "ok",
      title: "Episodes zonder volledig transcript",
      n: s.episodes_without_transcript,
      detail: `${s.episodes_with_transcript} van ${s.episodes_indexed} hebben transcript_text.`,
      action:
        s.episodes_without_transcript > 0
          ? "Run python scripts/deb_backfill_transcripts.py --limit 250 om verder uit te breiden naar oudere episodes."
          : null,
    },
    {
      severity: "warn",
      title: "Episodes zonder Humo longread",
      n: s.episodes_indexed - s.episodes_with_longread,
      detail: `Slechts ${s.episodes_with_longread} van ${s.episodes_indexed} hebben een volledig artikel.`,
      action:
        "Volgende ronde: site rebuild via scripts/site_backfill_longreads.py (te bouwen, kost ~€40-60 Claude tokens).",
    },
    {
      severity: s.candidates_new > 50 ? "warn" : "info",
      title: "Candidates wachten op response generation",
      n: s.candidates_new,
      detail:
        s.candidates_new > 50
          ? "n8n cron `discours-deb-respond-score` draait elke 2 uur en pakt 5 per run; backlog groeit."
          : "Backlog binnen normale range.",
      action:
        s.candidates_new > 50
          ? "Verhoog --limit in n8n workflow of trigger handmatig: python scripts/deb_generate_responses.py --limit 50."
          : null,
    },
    {
      severity: s.posted_total === 0 ? "info" : "ok",
      title: "Nog niets gepost",
      n: s.posted_total,
      detail:
        s.posted_total === 0
          ? "Bot is dry: dashboard approval nodig en X_CONSUMER_SECRET ontbreekt nog in Linux .env."
          : `${s.posted_total} replies live op @DiscoursDialoog.`,
      action:
        s.posted_total === 0
          ? "1) Vul X_CONSUMER_SECRET aan in /home/robi/Projects/Discours/.env. 2) Activeer n8n workflows in UI. 3) Approve een variant in /queue."
          : null,
    },
  ];

  return (
    <>
      <Nav active="data" />
      <main className="max-w-7xl mx-auto px-5 py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Data &amp; flow</h1>
          <p className="text-sm text-[color:var(--color-mute)] mt-0.5">
            Hoe de pipeline draait en waar er tekorten zitten.{" "}
            <span className="serif-italic">Wat er in zit en wat er nog ontbreekt.</span>
          </p>
        </div>

        <Section title="Pipeline funnel" eyebrow="van X tot post">
          <Funnel stages={fundeel} />
        </Section>

        <Section title="Content corpus" eyebrow="wat de bot kent">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {corpus.map((c) => (
              <CorpusCard key={c.label} {...c} />
            ))}
          </div>
        </Section>

        <Section title="Architectuur" eyebrow="systeem flow">
          <FlowDiagram />
        </Section>

        <Section title="Tekorten &amp; backlog" eyebrow="wat er nog moet gebeuren">
          <div className="space-y-2">
            {gaps.map((g) => (
              <GapCard key={g.title} {...g} />
            ))}
          </div>
        </Section>

        <Section title="Anti-spam state" eyebrow="cooldowns">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat label="Auteurs in 30d cooldown" value={s.authors_cooldown} />
            <Stat label="Topic-clusters in 24u cooldown" value={s.topic_cooldowns} />
            <Stat label="Decisions log totaal" value={s.decisions_total} />
          </div>
        </Section>
      </main>
    </>
  );
}

type FunnelStage = {
  label: string;
  n: number;
  sub?: string;
  tone?: "rose" | "cream" | "green";
};

function Funnel({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(1, ...stages.map((s) => s.n));
  return (
    <div className="space-y-2">
      {stages.map((s, i) => {
        const pct = Math.max(8, (s.n / max) * 100);
        const fill =
          s.tone === "green"
            ? "linear-gradient(90deg, rgba(22,163,74,0.45), rgba(34,197,94,0.65))"
            : s.tone === "rose"
              ? "linear-gradient(90deg, rgba(122,36,48,0.55), rgba(217,78,106,0.75))"
              : "linear-gradient(90deg, rgba(245,239,230,0.10), rgba(245,239,230,0.18))";
        return (
          <div key={s.label} className="flex items-center gap-3">
            <span className="w-6 text-xs text-[color:var(--color-mute)] tabular-nums">
              {i + 1}
            </span>
            <div className="flex-1 relative">
              <div
                className="h-12 rounded-lg border border-[color:var(--color-line)] flex items-center px-4"
                style={{ width: `${pct}%`, background: fill, transition: "width .25s" }}
              >
                <span className="font-bold text-white text-sm">{s.label}</span>
                <span className="ml-auto font-black tabular-nums text-base">
                  {s.n.toLocaleString("nl-BE")}
                </span>
              </div>
              {s.sub && (
                <span className="text-[10px] text-[color:var(--color-mute)] absolute left-0 top-full mt-0.5">
                  {s.sub}
                </span>
              )}
            </div>
          </div>
        );
      })}
      <div className="h-4" />
    </div>
  );
}

type CorpusStat = { label: string; n: number; max: number; hint: string };

function CorpusCard({ label, n, max, hint }: CorpusStat) {
  const pct = Math.round((n / Math.max(1, max)) * 100);
  return (
    <div className="glass-card p-4">
      <div className="brand-eyebrow">{label}</div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-3xl font-black tabular-nums">{n}</span>
        <span className="text-sm text-[color:var(--color-mute)]">/ {max}</span>
        <span className="ml-auto text-xs text-[color:var(--color-rose)] font-bold tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="score-bar mt-2">
        <div className="score-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-[color:var(--color-mute)] mt-2 leading-snug">
        {hint}
      </p>
    </div>
  );
}

type GapItem = {
  severity: "ok" | "info" | "warn";
  title: string;
  n: number;
  detail: string;
  action: string | null;
};

function GapCard({ severity, title, n, detail, action }: GapItem) {
  const tone =
    severity === "warn"
      ? "border-yellow-500/30 bg-yellow-500/5"
      : severity === "info"
        ? "border-[color:var(--color-line)]"
        : "border-emerald-500/30 bg-emerald-500/5";
  const dot =
    severity === "warn"
      ? "bg-yellow-400"
      : severity === "info"
        ? "bg-[color:var(--color-rose)]"
        : "bg-emerald-400";
  return (
    <div className={`glass-card p-4 border ${tone}`}>
      <div className="flex items-baseline gap-2">
        <span className={`w-2 h-2 rounded-full ${dot} mt-1 shrink-0`} />
        <span className="font-bold text-sm">{title}</span>
        <span className="ml-auto text-lg font-black tabular-nums">{n}</span>
      </div>
      <p className="text-xs text-[color:var(--color-mute)] mt-1.5 leading-snug">
        {detail}
      </p>
      {action && (
        <p className="text-[11px] mt-2 leading-snug">
          <span className="brand-eyebrow mr-1">Actie</span>
          <span className="text-white/85">{action}</span>
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card p-4">
      <div className="brand-eyebrow truncate">{label}</div>
      <div className="text-2xl font-black mt-1 tabular-nums">
        {value.toLocaleString("nl-BE")}
      </div>
    </div>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className="font-bold tracking-tight">{title}</h2>
        {eyebrow && <span className="brand-eyebrow">{eyebrow}</span>}
      </div>
      {children}
    </section>
  );
}

function FlowDiagram() {
  const nodes = [
    { id: "yt", label: "YouTube", sub: "kanaal feed", row: 0 },
    { id: "tx", label: "Transcripts", sub: "youtube-transcript-api", row: 0 },
    { id: "ep", label: "data/episodes/*.json", sub: "199 episodes", row: 0 },
    { id: "pg", label: "Postgres deb", sub: "9 tabellen, BM25", row: 1, accent: true },
    { id: "gx", label: "GetXAPI", sub: "polls 132 accounts", row: 0 },
    { id: "wt", label: "Watcher", sub: "n8n elke 4u + 30min", row: 1 },
    { id: "rg", label: "Response Engine", sub: "Claude Sonnet, 5 varianten", row: 1 },
    { id: "sc", label: "Scoring", sub: "5 agents, weight composite", row: 1 },
    { id: "db", label: "Dashboard", sub: "approval queue", row: 2, accent: true },
    { id: "gd", label: "Publish guard", sub: "anti-spam + originality", row: 2 },
    { id: "x", label: "X API write", sub: "@DiscoursDialoog", row: 2 },
  ];

  const groups = [
    {
      title: "Bron",
      items: ["YouTube → Transcripts → data/episodes JSON → episodes_search index"],
    },
    {
      title: "Verzamelen",
      items: ["GetXAPI → Watcher script → seen_tweets → BM25 → candidates"],
    },
    {
      title: "AI verwerken",
      items: ["Generator → 5 response varianten → Scoring (4 Haiku + 1 Sonnet) → composite"],
    },
    {
      title: "Mens in de loop",
      items: ["Dashboard /queue → approve/reject/edit → /deb-publish webhook"],
    },
    {
      title: "Posten",
      items: ["Publish guard (similarity 7d, follower min, daily cap) → Tweepy → reply op X"],
    },
  ];

  return (
    <div className="glass-card p-5">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {groups.map((g, i) => (
          <div key={g.title} className="relative">
            <div
              className="rounded-lg p-3 border border-[color:var(--color-line)] h-full"
              style={{ background: "rgba(245,239,230,0.03)" }}
            >
              <div className="brand-eyebrow mb-1">{`${i + 1}. ${g.title}`}</div>
              <p className="text-xs leading-relaxed text-white/85">{g.items[0]}</p>
            </div>
            {i < groups.length - 1 && (
              <div
                className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-[color:var(--color-rose)] text-xl"
                aria-hidden
              >
                →
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-[color:var(--color-mute)] mt-4">
        Postgres <code className="text-white/80">deb</code> staat tussen elke fase als
        single source of truth: <span className="x-link">watched_accounts</span>,{" "}
        <span className="x-link">seen_tweets</span>,{" "}
        <span className="x-link">episodes_search</span> (incl.{" "}
        <span className="x-link">transcript_text</span> + tsvector),{" "}
        <span className="x-link">candidates</span>, <span className="x-link">responses</span>,{" "}
        <span className="x-link">decisions</span>, plus cooldown tabellen.
      </p>
    </div>
  );
}
