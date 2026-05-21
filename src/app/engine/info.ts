// Samenvattingen van scripts en regel-bestanden uit het Discours-project.
// Gebruikt door de "More info"-uitklappers op /engine.
// Houd de tekst kort: 2-4 zinnen per item, helder Nederlands.

export const SCRIPTS: Record<string, { what: string }> = {
  "scripts/detect_new.py": {
    what:
      "Pollt het @discours YouTube-kanaal via yt-dlp en vergelijkt met data/episodes/. " +
      "Geeft een JSON-array van nieuwe video-ID's terug op stdout. " +
      "Exit-code 0 = nieuwe afleveringen gevonden, 1 = niets nieuw — de n8n-cron stopt dan vroegtijdig.",
  },
  "scripts/fetch_youtube.py": {
    what:
      "Haalt YouTube metadata (titel, beschrijving, duurtijd, channel, publish-datum) op via yt-dlp en bewaart als data/raw/<id>.json. " +
      "Dit is de bron voor verdere analyse-stappen.",
  },
  "scripts/fetch_transcript.py": {
    what:
      "Downloadt de YouTube auto-captions (.vtt) via yt-dlp en parset naar een JSON met timestamps. " +
      "Werkt zonder cookies op de Linux server (residential IP); op de Mac valt het terug op Chrome-cookies wanneer YouTube blokkeert. " +
      "Het ruwe transcript wordt ook gebruikt in de SEO-collapse op de aflevering-pagina.",
  },
  "scripts/analyze_episode.py": {
    what:
      "Roept vier specialised Claude-agents aan: Parser (gastinfo, themes, tags), Quote Hunter (25-30 quotes), Longread Writer (Humo-stijl), Guest Profile (bio + foto-zoekterm). " +
      "Output gaat naar data/episodes/<nr>.json en is meteen leidend voor homepage en aflevering-pagina.",
  },
  "scripts/sanity_check.py": {
    what:
      "Verifieert elke longread op drie criteria: feitelijkheid (hallucinaties, fonetische naamfouten zoals 'Tomlijn' → Tommelein), nuance (standpunt gast getrouw weergegeven), volledigheid (alle topics gedekt). " +
      "Bij needs-fix herschrijft een Sonnet-agent automatisch (max 2 passes). Output naar data/sanity/<nr>.json.",
  },
  "scripts/opus_clip_episode.py": {
    what:
      "Submit één master Opus clip-project per episode. ClipAnything-model met customPrompt die de 16 longread-topics meegeeft, " +
      "30-180 sec clips, portrait 9:16, sourceLang nl. " +
      "Subcommandos: --status, --fetch, --wait, --delete. Stage-cyclus QUEUED → PROCESSING → COMPLETE; clips komen uit GET /api/exportable-clips.",
  },
  "scripts/opus_publish_episode.py": {
    what:
      "Publiceert clips naar X, Instagram, TikTok en YouTube Shorts via Opus' POST /api/post-tasks. " +
      "Per clip vraagt Claude (Haiku) twee outputs: een abstract topic-zinsdeel ('over X') en een schone declaratieve hook-zin. " +
      "Daily-cron-modus via --next-batch N: top N nog-niet-gestarte clips + retry van partial-success per platform. Idempotent op (clip, platform).",
  },
  "scripts/build_site.py": {
    what:
      "Rendert alle Jinja2-templates naar site/, leest data/episodes/*.json + boeken + shorts + wikipedia-guests. " +
      "Berekent canonieke tellers (episode_count_display rondt af naar tiental, voor brand-consistentie), injecteert build-commit en site-versie in base.html.",
  },
  "scripts/deploy.sh": {
    what:
      "Bouwt de site, voegt site/ + data/-wijzigingen toe, commit met 'Auto: deploy YYYY-MM-DD-HHMM' en pusht naar main. " +
      "Railway pakt op via GitHub-integratie. Wordt direct vanuit pipeline.py + n8n discours-auto-process aangeroepen.",
  },
  "scripts/deploy_and_verify.py": {
    what:
      "End-to-end deploy + verify: Mac-push → Linux git pull + build_site + commit + push → poll live URL tot meta-commit matched local HEAD. " +
      "Bij failure één retry met empty commit (tegen gemiste Railway-webhook). Exit-code 0 = live, 1 = persistente failure, 3 = unreachable.",
  },
  "scripts/deploy_verify.py": {
    what:
      "Lichtgewicht versie: alleen verify (geen push). Pollt de meta-tag discours-build-commit en vergelijkt met local HEAD. " +
      "Gebruikt door deploy_and_verify.py als onderdeel-stap.",
  },
  "scripts/pipeline.py": {
    what:
      "De volledige cron-flow van n8n discours-auto-process. Roept op volgorde: fetch_youtube, fetch_transcript, analyze_episode, fetch_shorts, sanity_check, opus_clip_episode (submit), build_site. " +
      "Best-effort try/except per stap zodat een single failure de andere stappen niet blokkeert.",
  },
  "scripts/fetch_shorts.py": {
    what:
      "Pollt YouTube shorts van @discours en matcht ze aan episodes op basis van gastnaam of upload-datum. " +
      "Output gaat naar data/shorts.json en wordt op de homepage + aflevering-pagina getoond.",
  },
  "scripts/deb_watcher.py": {
    what:
      "Pollt de timeline van gevolgde X-accounts + @DiscoursDialoog mentions via GetXAPI. " +
      "Elke tweet wordt matched tegen episodes_search.transcript_text via Postgres BM25 (plainto_tsquery). Bij score boven drempel = candidate in de DB.",
  },
  "scripts/deb_generate_responses.py": {
    what:
      "Voor elke nieuwe candidate haalt het de best-matched episode op (titel, hero_summary, top quotes) en vraagt Claude Sonnet om 5 verschillende reply-varianten. " +
      "Valideert character-count (270) en YouTube-link preservation.",
  },
  "scripts/deb_score_responses.py": {
    what:
      "Voor elke variant 5 onafhankelijke scoring-agents (4× Haiku + 1× Sonnet voor Authenticity). " +
      "Composite weighting: Authenticity & Appropriateness tellen dubbel. Hard floor: Appropriateness < 6 = auto-reject.",
  },
  "scripts/deb_post_tweet.py": {
    what:
      "Ontvangt JSON van de n8n publish-webhook na approval in /queue, draait laatste guard (cooldown, hard cap 3/dag, blocklist) en post via Tweepy v2. " +
      "Update authors_replied + topic_cooldowns + candidates.status.",
  },
  "scripts/send_weekly_email.py": {
    what:
      "Stuurt de wekelijkse nieuwsbrief over één afleveringen via Resend broadcasts (audience filter frequency=weekly). " +
      "Idempotent via data/sent/weekly_<nr>.json marker. --dry-run rendert naar preview-HTML.",
  },
  "scripts/send_monthly_email.py": {
    what:
      "Maandelijkse wrap-up van de 4 recentste afleveringen, zelfde Resend-flow als de weekly, met audience frequency=monthly. " +
      "Idempotent via data/sent/monthly_<YYYY-MM>.json.",
  },
  "scripts/signup_server.py": {
    what:
      "Minimal stdlib HTTP-server op poort 3006 (dev) voor het signup-formulier. " +
      "Honeypot-veld 'website', e-mail regex check, frequency enum. POST naar Resend /audiences/<id>/contacts. " +
      "Productie loopt via n8n-webhook of als tweede Railway-service.",
  },
  "scripts/sales.py": {
    what:
      "Sales outreach pipeline met 4 subcommando's: enrich (web search op bedrijven), drafts (max 3 hoofdmails/dag), followups (Opvolg 1+2 op 14-dagen intervallen), send (Approved drafts → Resend). " +
      "State via Notion 3-DB CRM (Bedrijven, Contacten, Berichten-queue).",
  },
  "src/app/queue/": {
    what:
      "Approval-UI voor de DEB X-replies. Toont per kandidaat de tweet + de 5 ge-scoorde varianten + 'publish'/'reject'/'skip' acties. " +
      "Publish triggert n8n-webhook → deb_post_tweet.py.",
  },
  "src/app/history/": {
    what:
      "Laatste 30 dagen aan publish/reject/skip beslissingen. Bevat link naar de live tweet en de oorspronkelijke kandidaat-tweet.",
  },
  "src/app/settings/": {
    what:
      "Beheer van watched_accounts (welke X-accounts pollen we), counts per status, cooldown-overzicht.",
  },
};

export const RULES: Record<string, { what: string }> = {
  ".claude/rules/parse-prompt.md": {
    what:
      "Prompt voor de Parser-agent in analyze_episode.py. Definieert hoe gastnaam, rol, themes, tags (max 8), one-liner en hero_summary (4-5 zinnen Humo-stijl) eruit moeten zien. " +
      "Bevat 'goed/fout' voorbeelden voor tag-selectie (geen generieke begrippen, geen dubbele concepten).",
  },
  ".claude/rules/quote-prompt.md": {
    what:
      "Prompt voor de Quote Hunter-agent. Vraagt 25-30 quotes verspreid over de hele aflevering (verdeeld in 4 kwartielen, min. 6 per blok). " +
      "Per quote: text, timestamp, context (teaser via topic-teaser-prompt), relevance_score (1-10), click_score (1-10).",
  },
  ".claude/rules/topic-teaser-prompt.md": {
    what:
      "Specifieke regels voor het 'context'-veld per quote — de korte teaser die in de homepage hero verschijnt naast de ▶-timestamp. " +
      "60-110 tekens, beschrijf het ONDERWERP niet het antwoord, framing-woorden zoals 'Analyse over…', 'Waarom Europa…'. Strikt geen quote-tekst in context.",
  },
  ".claude/rules/longread-prompt.md": {
    what:
      "De volledige stylebook voor de longread-writer: Humo/De Morgen-stijl, Belgisch Nederlands, geen em-dashes, minimaal 8 ## headings met click-trigger titels, 8-10 blockquotes. " +
      "Verbiedt scene-cliches in de epiloog ('glas water', 'obers ruimen tafels'). YouTube-timestamps per heading verplicht.",
  },
  ".claude/rules/guest-profile-prompt.md": {
    what:
      "Korte bio (2-3 zinnen) voor de gast plus een Google-zoekterm om een foto te vinden. " +
      "Informatief, neutraal, respectvol, gebruikt officiële titel en eerdere functies.",
  },
  ".claude/rules/longread-sanity-check.md": {
    what:
      "De drie criteria die elke longread moet doorstaan: feitelijkheid (zes regels incl. 'lexicale plausibiliteit' tegen YouTube auto-caption corrupties), nuance (standpunt gast getrouw), volledigheid (alle topics gedekt). " +
      "Bevat een tabel met bekende caption-corrupties (Cro→De Croo, Tomlijn→Tommelein, kakientje→kaki tintje, etc.) die het script automatisch herkent.",
  },
  ".claude/rules/homepage-design.md": {
    what:
      "De homepage-design-visie: CNN-3-kolom hero (links quote-headlines, midden nieuwste ep, rechts CTA's) + afwisselende feed daaronder. " +
      "Markeert wat WEL en NIET mag wijzigen zonder overleg ('Niet wijzigen zonder expliciete toestemming').",
  },
  ".claude/rules/current-state-snapshot.md": {
    what:
      "Snapshot van de huidige goedgekeurde site-staat (homepage layout, episode-detail-pagina structuur, kleuren-palet, font-keuzes). " +
      "Referentie bij elke rebuild om te checken dat er niets is gesneuveld.",
  },
  ".claude/rules/deb-style-prompt.md": {
    what:
      "Toon en regels voor de 5 reply-varianten die DEB schrijft: vriendelijk, inhoudelijk, geen marketingtaal, max 270 tekens, " +
      "altijd met YouTube timestamp-link. " +
      "Vijf invalshoeken per kandidaat: beamend_kern, beamend_andere, beamend_guest, nuancerend, ludiek.",
  },
  ".claude/rules/deb-scoring-prompts.md": {
    what:
      "De prompts voor de 5 scoring-agents per variant: Relevance (Sonnet, hard floor < 6 = auto-reject), Appropriateness, Authenticity (Sonnet), Added Value, Diversity. " +
      "Elk geeft JSON met {score, why}; Relevance bevat een 3-step check (tweet-claim → quote-argument → koppeling).",
  },
  ".claude/rules/sales-outreach-prompt.md": {
    what:
      "Templates voor Hoofdmail, Opvolg 1 en Opvolg 2 in het sales-outreach-traject. " +
      "Belgisch Nederlands, geen em-dashes, geen marketingtaal, geen episode-referenties. " +
      "Subject-roulatie van 3 varianten per touch voor inbox-deliverability.",
  },
  ".claude/rules/pipeline-overview.md": {
    what:
      "Volledige end-to-end pipeline-beschrijving van YouTube → publicatie + DEB + nieuwsbrief. " +
      "Toont actoren (Linux server, n8n, Claude, Railway, Cloudflare) en kritieke paden om te debuggen.",
  },
  ".claude/rules/book-detection-prompt.md": {
    what:
      "Vraagt Claude of het transcript een boek van de gast vermeldt. " +
      "Output: has_book, title, authors, context. Negeert 'De Dialoog Paradox' (boek van de hosts).",
  },
  ".claude/rules/server-setup.md": {
    what:
      "Eenmalige setup-instructies voor de Linux server (venv, dependencies, ANTHROPIC_API_KEY in .env). " +
      "Onboarding-document, niet aangeroepen door scripts.",
  },
};
