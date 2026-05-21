import { Nav } from "@/components/Nav";
import { SCRIPTS, RULES } from "./info";

type Status = "live" | "idle" | "manual";

const STATUS_LABEL: Record<Status, string> = {
  live: "Live",
  idle: "Geïmporteerd, inactief",
  manual: "Handmatig / on demand",
};

const STATUS_COLOR: Record<Status, string> = {
  live: "text-emerald-300 bg-emerald-500/10 border-emerald-400/30",
  idle: "text-amber-300 bg-amber-500/10 border-amber-400/30",
  manual: "text-sky-300 bg-sky-500/10 border-sky-400/30",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-[0.18em] font-bold bg-[color:var(--color-rose)]/15 text-[color:var(--color-rose)] border border-[color:var(--color-rose)]/30">
      {children}
    </span>
  );
}

function StatusBadge({ s }: { s: Status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-[0.16em] font-bold border ${STATUS_COLOR[s]}`}>
      {STATUS_LABEL[s]}
    </span>
  );
}

function Card({
  title,
  schedule,
  status,
  description,
  scripts,
  rules,
  workflow,
  apis,
}: {
  title: string;
  schedule: string;
  status: Status;
  description: string;
  scripts?: string[];
  rules?: string[];
  workflow?: string;
  apis?: string[];
}) {
  return (
    <article className="glass-card p-5 rounded-2xl flex flex-col gap-3">
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold tracking-tight leading-tight">{title}</h3>
        <StatusBadge s={status} />
      </header>
      <p className="text-[13px] text-[color:var(--color-mute)] leading-relaxed">{description}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[12px]">
        <dt className="text-[color:var(--color-mute)]">Schedule</dt>
        <dd className="font-mono text-[color:var(--color-cream)]">{schedule}</dd>
        {workflow && (
          <>
            <dt className="text-[color:var(--color-mute)]">n8n</dt>
            <dd className="font-mono text-[color:var(--color-cream)]">{workflow}</dd>
          </>
        )}
        {scripts && scripts.length > 0 && (
          <>
            <dt className="text-[color:var(--color-mute)]">Scripts</dt>
            <dd className="font-mono text-[color:var(--color-cream)] flex flex-wrap gap-1">
              {scripts.map((s) => (
                <code key={s} className="bg-black/40 px-1.5 py-0.5 rounded text-[11px] border border-[color:var(--color-line)]">{s}</code>
              ))}
            </dd>
          </>
        )}
        {rules && rules.length > 0 && (
          <>
            <dt className="text-[color:var(--color-mute)]">Regels</dt>
            <dd className="font-mono text-[color:var(--color-cream)] flex flex-wrap gap-1">
              {rules.map((r) => (
                <code key={r} className="bg-black/40 px-1.5 py-0.5 rounded text-[11px] border border-[color:var(--color-line)]">{r}</code>
              ))}
            </dd>
          </>
        )}
        {apis && apis.length > 0 && (
          <>
            <dt className="text-[color:var(--color-mute)]">API</dt>
            <dd className="flex flex-wrap gap-1">
              {apis.map((a) => (
                <Pill key={a}>{a}</Pill>
              ))}
            </dd>
          </>
        )}
      </dl>

      {/* More info — uitklap met script + rule samenvattingen */}
      {((scripts && scripts.some((s) => SCRIPTS[s])) ||
        (rules && rules.some((r) => RULES[r]))) && (
        <details className="group mt-1 border-t border-[color:var(--color-line)] pt-3">
          <summary className="cursor-pointer text-[11px] uppercase tracking-[0.16em] font-bold text-[color:var(--color-rose)] hover:text-white transition-colors select-none flex items-center gap-2">
            <span className="group-open:rotate-90 transition-transform inline-block">▸</span>
            More info
          </summary>
          <div className="mt-3 space-y-3 text-[12px] leading-relaxed">
            {scripts && scripts.filter((s) => SCRIPTS[s]).length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-[color:var(--color-mute)]">
                  Scripts
                </div>
                {scripts
                  .filter((s) => SCRIPTS[s])
                  .map((s) => (
                    <div key={s} className="border-l-2 border-[color:var(--color-rose)]/40 pl-3">
                      <code className="text-[11px] text-[color:var(--color-cream)] font-mono">{s}</code>
                      <p className="text-[color:var(--color-mute)] mt-1">{SCRIPTS[s].what}</p>
                    </div>
                  ))}
              </div>
            )}
            {rules && rules.filter((r) => RULES[r]).length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-[color:var(--color-mute)]">
                  Regels (instructie-MDs)
                </div>
                {rules
                  .filter((r) => RULES[r])
                  .map((r) => (
                    <div key={r} className="border-l-2 border-amber-400/40 pl-3">
                      <code className="text-[11px] text-[color:var(--color-cream)] font-mono">{r}</code>
                      <p className="text-[color:var(--color-mute)] mt-1">{RULES[r].what}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </details>
      )}
    </article>
  );
}

function Flowchart() {
  // Hand-rolled SVG flowchart. Layout grid:
  //   Row 1 — Input (YouTube)
  //   Row 2 — Pipeline (woe 19:00)
  //   Row 3 — Four outputs (Website, Opus rendering, DEB, Nieuwsbrief)
  //   Row 4 — Daily publish (do-wo 12:00)
  //   Row 5 — Social platforms
  return (
    <svg
      viewBox="0 0 1200 900"
      role="img"
      aria-label="Discours Media Engine flowchart"
      className="w-full h-auto"
      style={{ maxHeight: "1000px" }}
    >
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#D94E6A" />
        </marker>
        <linearGradient id="pipe" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#5A1820" />
          <stop offset="100%" stopColor="#2E0A11" />
        </linearGradient>
        <linearGradient id="opus" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7A2430" />
          <stop offset="100%" stopColor="#3a0f17" />
        </linearGradient>
      </defs>

      <style>{`
        .node rect { fill: rgba(245,239,230,0.04); stroke: rgba(245,239,230,0.18); stroke-width: 1; }
        .node-pipeline rect { fill: url(#pipe); stroke: rgba(217,78,106,0.4); stroke-width: 1.4; }
        .node-publish rect { fill: url(#opus); stroke: rgba(217,78,106,0.35); stroke-width: 1.2; }
        .node-platform rect { fill: rgba(245,239,230,0.06); stroke: rgba(217,78,106,0.25); stroke-width: 1; }
        text { fill: #f5efe6; font-family: 'Lato', sans-serif; font-weight: 700; }
        .label-sm { font-size: 11px; fill: #b6a8a0; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; }
        .label-md { font-size: 14px; fill: #f5efe6; font-weight: 700; }
        .label-step { font-size: 12px; fill: #f5efe6; font-weight: 400; }
        .label-tiny { font-size: 10px; fill: #b6a8a0; font-weight: 400; letter-spacing: 0.06em; }
        .stroke-flow { stroke: #D94E6A; stroke-width: 2; fill: none; opacity: 0.55; }
      `}</style>

      {/* INPUT */}
      <g className="node">
        <rect x="500" y="20" width="200" height="60" rx="14" />
        <text x="600" y="48" textAnchor="middle" className="label-sm">INPUT</text>
        <text x="600" y="66" textAnchor="middle" className="label-md">YouTube · @discours</text>
      </g>

      {/* Pijl naar pipeline */}
      <line x1="600" y1="80" x2="600" y2="135" className="stroke-flow" markerEnd="url(#arrow)" />
      <text x="618" y="115" className="label-tiny">WO 19:00</text>

      {/* PIPELINE */}
      <g className="node-pipeline">
        <rect x="220" y="140" width="760" height="170" rx="18" />
        <text x="250" y="170" className="label-sm">PIPELINE  ·  n8n discours-auto-process</text>
        <text x="250" y="195" className="label-step">1.  detect_new — nieuwe YT-video gevonden?</text>
        <text x="250" y="215" className="label-step">2.  fetch_youtube + fetch_transcript — metadata + auto-captions</text>
        <text x="250" y="235" className="label-step">3.  analyze_episode — 4 Claude agents (parse / quotes / longread / profile)</text>
        <text x="250" y="255" className="label-step">4.  sanity_check — auto-fix bij hallucinaties of foute namen</text>
        <text x="250" y="275" className="label-step">5.  opus_clip_episode — submit master Opus clip-project (queue ~40 clips)</text>
        <text x="250" y="295" className="label-step">6.  build_site + deploy — Railway auto-deploy naar discours.be</text>
      </g>

      {/* 4 outputs uit pipeline */}
      <line x1="350" y1="310" x2="180" y2="380" className="stroke-flow" markerEnd="url(#arrow)" />
      <line x1="540" y1="310" x2="490" y2="380" className="stroke-flow" markerEnd="url(#arrow)" />
      <line x1="700" y1="310" x2="800" y2="380" className="stroke-flow" markerEnd="url(#arrow)" />
      <line x1="900" y1="310" x2="1090" y2="380" className="stroke-flow" markerEnd="url(#arrow)" />

      {/* Output: Website */}
      <g className="node">
        <rect x="80" y="385" width="200" height="80" rx="14" />
        <text x="180" y="411" textAnchor="middle" className="label-sm">OUTPUT</text>
        <text x="180" y="431" textAnchor="middle" className="label-md">discours.be</text>
        <text x="180" y="449" textAnchor="middle" className="label-tiny">longread + homepage</text>
      </g>

      {/* Output: Opus rendering */}
      <g className="node">
        <rect x="390" y="385" width="200" height="80" rx="14" />
        <text x="490" y="411" textAnchor="middle" className="label-sm">OUTPUT</text>
        <text x="490" y="431" textAnchor="middle" className="label-md">~40 shorts ready</text>
        <text x="490" y="449" textAnchor="middle" className="label-tiny">Opus render ~15 min</text>
      </g>

      {/* Output: DEB X reply engine */}
      <g className="node">
        <rect x="700" y="385" width="200" height="80" rx="14" />
        <text x="800" y="411" textAnchor="middle" className="label-sm">PARALLEL</text>
        <text x="800" y="431" textAnchor="middle" className="label-md">DEB X-bot</text>
        <text x="800" y="449" textAnchor="middle" className="label-tiny">elke 4u + 30min</text>
      </g>

      {/* Output: Nieuwsbrief */}
      <g className="node">
        <rect x="990" y="385" width="200" height="80" rx="14" />
        <text x="1090" y="411" textAnchor="middle" className="label-sm">PARALLEL</text>
        <text x="1090" y="431" textAnchor="middle" className="label-md">Nieuwsbrief</text>
        <text x="1090" y="449" textAnchor="middle" className="label-tiny">Resend wekelijks/maand</text>
      </g>

      {/* Naar shorts publish */}
      <line x1="490" y1="465" x2="490" y2="525" className="stroke-flow" markerEnd="url(#arrow)" />
      <text x="510" y="500" className="label-tiny">DO–WO 12:00</text>

      {/* Daily Publish */}
      <g className="node-publish">
        <rect x="220" y="530" width="540" height="100" rx="18" />
        <text x="490" y="558" textAnchor="middle" className="label-sm">DAILY PUBLISH  ·  n8n discours-shorts-publish</text>
        <text x="490" y="582" textAnchor="middle" className="label-step">opus_publish_episode --next-batch 3 --confirm</text>
        <text x="490" y="602" textAnchor="middle" className="label-step">Claude rewrite per clip: topic-zin + hook-zin</text>
        <text x="490" y="620" textAnchor="middle" className="label-tiny">3 clips/dag × 4 platforms × 7 dagen = 21 clips ≈ 84 posts/ep</text>
      </g>

      {/* Pijlen naar 4 platforms */}
      <line x1="270" y1="630" x2="160" y2="700" className="stroke-flow" markerEnd="url(#arrow)" />
      <line x1="400" y1="630" x2="385" y2="700" className="stroke-flow" markerEnd="url(#arrow)" />
      <line x1="580" y1="630" x2="610" y2="700" className="stroke-flow" markerEnd="url(#arrow)" />
      <line x1="710" y1="630" x2="835" y2="700" className="stroke-flow" markerEnd="url(#arrow)" />

      {/* Platforms */}
      <g className="node-platform">
        <rect x="60" y="705" width="200" height="60" rx="12" />
        <text x="160" y="731" textAnchor="middle" className="label-md">X / Twitter</text>
        <text x="160" y="748" textAnchor="middle" className="label-tiny">@DiscoursDialoog</text>
      </g>
      <g className="node-platform">
        <rect x="285" y="705" width="200" height="60" rx="12" />
        <text x="385" y="731" textAnchor="middle" className="label-md">Instagram Reels</text>
        <text x="385" y="748" textAnchor="middle" className="label-tiny">@DiscoursDialoog</text>
      </g>
      <g className="node-platform">
        <rect x="510" y="705" width="200" height="60" rx="12" />
        <text x="610" y="731" textAnchor="middle" className="label-md">TikTok</text>
        <text x="610" y="748" textAnchor="middle" className="label-tiny">@discours_podcast</text>
      </g>
      <g className="node-platform">
        <rect x="735" y="705" width="200" height="60" rx="12" />
        <text x="835" y="731" textAnchor="middle" className="label-md">YouTube Shorts</text>
        <text x="835" y="748" textAnchor="middle" className="label-tiny">Discours Met De Boys</text>
      </g>

      {/* DEB X-bot follow-up box (rechts) */}
      <line x1="800" y1="465" x2="800" y2="525" className="stroke-flow" markerEnd="url(#arrow)" />
      <g className="node-publish">
        <rect x="660" y="530" width="280" height="100" rx="18" />
        <text x="800" y="558" textAnchor="middle" className="label-sm">DEB ENGINE  ·  X reply queue</text>
        <text x="800" y="582" textAnchor="middle" className="label-step">GetXAPI watch → BM25 match</text>
        <text x="800" y="602" textAnchor="middle" className="label-step">Claude 5 varianten → 5 scorers</text>
        <text x="800" y="620" textAnchor="middle" className="label-tiny">jij keurt goed via /queue → Tweepy post</text>
      </g>
      <line x1="940" y1="580" x2="1090" y2="640" className="stroke-flow" markerEnd="url(#arrow)" />
      <g className="node-platform">
        <rect x="985" y="645" width="210" height="60" rx="12" />
        <text x="1090" y="671" textAnchor="middle" className="label-md">X reply (3/dag max)</text>
        <text x="1090" y="688" textAnchor="middle" className="label-tiny">auteur-cooldown 30d</text>
      </g>

      {/* Nieuwsbrief afsluiter */}
      <line x1="1090" y1="465" x2="1090" y2="610" className="stroke-flow" markerEnd="url(#arrow)" />
      <g className="node-platform">
        <rect x="985" y="610" width="210" height="38" rx="12" />
        <text x="1090" y="635" textAnchor="middle" className="label-tiny">Resend  ·  Discours abonnees</text>
      </g>
    </svg>
  );
}

export default function EnginePage() {
  return (
    <>
      <Nav active="engine" />
      <main className="max-w-7xl mx-auto px-5 py-10 space-y-12">
        {/* HERO */}
        <header className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Pill>Discours</Pill>
            <Pill>Engine</Pill>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-mute)]">overzicht productie-pipeline</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            De spil van Discours.<br />
            <span className="text-[color:var(--color-rose)]">Eén opname. Vier outputs. Volledig autonoom.</span>
          </h1>
          <p className="max-w-3xl text-[15px] text-[color:var(--color-cream)] leading-relaxed">
            Elke woensdagavond komt er een nieuwe podcast online. Vanaf dat moment loopt
            de Discours Media Engine als een metro-net door alle outputs: een
            longread-artikel op de website, een Opus-clip-project dat ~40 shorts rendert,
            zeven dagen lang automatische publicatie naar X, Instagram, TikTok en YouTube,
            een nieuwsbrief, en parallel een X-reply queue die menselijk klinkende reacties
            voorbereidt op gesprekken in de Vlaamse timeline.
          </p>
        </header>

        {/* FLOWCHART */}
        <section className="glass rounded-2xl p-6 md:p-8 overflow-x-auto">
          <Flowchart />
        </section>

        {/* DETAILS PER ONDERDEEL */}
        <section className="space-y-6">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-black tracking-tight">Per onderdeel</h2>
            <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-mute)]">scripts · regels · API</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card
              title="Detect new episode"
              schedule="Wo 19:00 (n8n)"
              status="live"
              workflow="discours-auto-process"
              description="Pol YouTube via yt-dlp. Geeft video-IDs die nog geen episode-JSON hebben. Zonder nieuwe ep doet de rest van de cron niets."
              scripts={["scripts/detect_new.py"]}
              apis={["YouTube (yt-dlp)"]}
            />
            <Card
              title="Fetch metadata + transcript"
              schedule="Step 1 / 1b van pipeline.py"
              status="live"
              description="YouTube metadata + raw auto-captions worden binnengehaald. De transcript-JSON dient als bron voor de Claude-agents én als SEO-content op de afleveringspagina."
              scripts={["scripts/fetch_youtube.py", "scripts/fetch_transcript.py"]}
              apis={["YouTube (yt-dlp)"]}
            />
            <Card
              title="Analyze episode (4 Claude-agents)"
              schedule="Step 2 van pipeline.py"
              status="live"
              description="Parser, Quote Hunter, Longread Writer en Guest Profile. Output verschijnt als data/episodes/<nr>.json en is meteen leidend voor homepage + ep-pagina."
              scripts={["scripts/analyze_episode.py"]}
              rules={[
                ".claude/rules/parse-prompt.md",
                ".claude/rules/quote-prompt.md",
                ".claude/rules/topic-teaser-prompt.md",
                ".claude/rules/longread-prompt.md",
                ".claude/rules/guest-profile-prompt.md",
              ]}
              apis={["Anthropic (Sonnet + Haiku)"]}
            />
            <Card
              title="Sanity check + auto-fix"
              schedule="Step 2c van pipeline.py"
              status="live"
              description="Drie LLM-agents controleren feitelijkheid (eigennamen, quotes, cijfers, lexicale plausibiliteit), nuance en volledigheid. Bij needs-fix automatische rewrite tot 2 passes."
              scripts={["scripts/sanity_check.py"]}
              rules={[".claude/rules/longread-sanity-check.md"]}
              apis={["Anthropic"]}
            />
            <Card
              title="Opus clip-project submit"
              schedule="Step 2d van pipeline.py"
              status="live"
              description="Eén master clip-project per episode. ClipAnything-model met customPrompt die de 16 longread-topics meegeeft. Discours brand-template (portrait 9:16, logo, karaoke captions) auto-toegepast."
              scripts={["scripts/opus_clip_episode.py"]}
              apis={["Opus Clips"]}
            />
            <Card
              title="Build site + deploy"
              schedule="Step 3 van pipeline.py + deploy.sh"
              status="live"
              description="Jinja2 rendert alle pagina's, build_site.py injecteert site-versie en build-commit. Daarna git push naar main, Railway pakt op."
              scripts={["scripts/build_site.py", "scripts/deploy.sh", "scripts/deploy_and_verify.py"]}
              rules={[".claude/rules/homepage-design.md", ".claude/rules/current-state-snapshot.md"]}
              apis={["Railway"]}
            />
            <Card
              title="Daily shorts publish"
              schedule="Do–Wo 12:00 CET (n8n)"
              status="live"
              workflow="discours-shorts-publish"
              description="3 nieuwe clips × 4 platforms per dag (X / IG / TikTok / YT). Claude rewrite per clip (topic + hook), idempotente skip op al-success, automatische retry van missing platforms. Doel: 21 clips/ep over 7 dagen."
              scripts={["scripts/opus_publish_episode.py"]}
              apis={["Opus Clips", "Anthropic (Haiku rewrite)"]}
            />
            <Card
              title="DEB X-reply engine"
              schedule="Watch elke 4u + :30, scoring elke 2u"
              status="live"
              workflow="discours-deb-watch / -respond-score / -publish"
              description="GetXAPI haalt timeline + mentions, BM25 matcht relevante episodes, Claude genereert 5 reply-varianten, 5 scoring-agents (Relevance hard-floor < 6). Beste variant gaat naar de Queue, jij keurt goed of weigert."
              scripts={[
                "scripts/deb_watcher.py",
                "scripts/deb_generate_responses.py",
                "scripts/deb_score_responses.py",
                "scripts/deb_post_tweet.py",
              ]}
              rules={[".claude/rules/deb-style-prompt.md", ".claude/rules/deb-scoring-prompts.md"]}
              apis={["GetXAPI", "X (Tweepy)", "Anthropic", "Postgres"]}
            />
            <Card
              title="Nieuwsbrief"
              schedule="Do 08:00 (wekelijks) + 1e v/d maand (digest)"
              status="idle"
              workflow="discours-weekly-send / discours-monthly-digest"
              description="Workflows geïmporteerd in n8n maar nog inactief tot DNS reputation opgebouwd is. Resend audience 'Discours Nieuwsbrief' (id 5822cf9c…), opt-in via homepage modal."
              scripts={["scripts/send_weekly_email.py", "scripts/send_monthly_email.py", "scripts/signup_server.py"]}
              apis={["Resend"]}
            />
            <Card
              title="Sales outreach (PR-bureaus)"
              schedule="Dagelijks 09:00–09:30, send-sweep elke 15 min"
              status="idle"
              workflow="discours-sales-enrich / -drafts / -followups / -send"
              description="3-touch sequence vanuit Notion CRM. AI enricht bedrijven (FTE, klanten, recent nieuws), schrijft drafts via templates, jij keurt goed in Notion, n8n stuurt via Resend."
              scripts={["scripts/sales.py", "scripts/sales_draft.py"]}
              rules={[".claude/rules/sales-outreach-prompt.md"]}
              apis={["Notion", "Resend", "Anthropic"]}
            />
            <Card
              title="Shorts watcher"
              schedule="Elk uur (n8n)"
              status="live"
              workflow="discours-shorts-watcher"
              description="Detecteert handmatig of via Opus geüploade YT-shorts en matcht ze aan de juiste episode in data/shorts.json zodat ze op de homepage en ep-pagina verschijnen."
              scripts={["scripts/fetch_shorts.py"]}
              apis={["YouTube (yt-dlp)"]}
            />
            <Card
              title="Approval dashboard (deze app)"
              schedule="On-demand"
              status="live"
              description="Single-user UI op poort 4003 (Linux) voor de DEB Queue. Postgres-backed (raw SQL), iron-session auth, glassy UI, sticky nav."
              scripts={["src/app/queue/", "src/app/history/", "src/app/settings/"]}
              apis={["Postgres deb"]}
            />
          </div>
        </section>

        {/* TECH STACK */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight">Tech stack & integraties</h2>
          <div className="glass rounded-2xl p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-[13px]">
            {[
              { name: "Anthropic Claude", role: "longread, sanity, rewrites, DEB scoring" },
              { name: "Opus Clips", role: "clip-projects + post-tasks 4 platforms" },
              { name: "YouTube (yt-dlp)", role: "metadata + auto-captions" },
              { name: "Resend", role: "newsletter + sales broadcasts" },
              { name: "Notion", role: "sales CRM + longread backfill" },
              { name: "GetXAPI", role: "X timeline + mentions feed" },
              { name: "X / Tweepy", role: "publish reply via @DiscoursDialoog" },
              { name: "Postgres deb", role: "queue + scoring + cooldowns" },
              { name: "n8n", role: "cron + orchestration" },
              { name: "Railway", role: "static site host" },
              { name: "Cloudflare", role: "DNS + tunnel (hooks)" },
              { name: "Mission Control", role: "cross-project monitoring" },
            ].map((t) => (
              <div key={t.name} className="glass-card p-4 rounded-xl">
                <div className="font-bold text-[14px]">{t.name}</div>
                <div className="text-[12px] text-[color:var(--color-mute)] mt-1">{t.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* STATUS LEGEND */}
        <section className="flex flex-wrap items-center gap-3 text-[11px] text-[color:var(--color-mute)] pb-6">
          <span>Status</span>
          <StatusBadge s="live" />
          <span>= cron actief op n8n</span>
          <StatusBadge s="idle" />
          <span>= workflow geïmporteerd maar uitgeschakeld</span>
          <StatusBadge s="manual" />
          <span>= alleen on-demand</span>
        </section>
      </main>
    </>
  );
}
