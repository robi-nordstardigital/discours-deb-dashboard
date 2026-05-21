# Discours DEB Dashboard

## What
Approval queue voor de Discours Engine Bot. Toont kandidaat-tweets met 5 AI-gegenereerde response-varianten + scoring; Robi keurt goed of weigert.

## URLs
- **Live**: http://192.168.50.24:4003 (Docker op Linux server)
- **Lokaal dev**: http://localhost:3008
- **Health**: http://192.168.50.24:4003/api/health

## Development
```bash
npm install
npm run dev    # poort 3008
```

Vereist `.env.local` met `DEB_DATABASE_URL`, `DEB_DASHBOARD_PASSWORD`, `DEB_SESSION_SECRET`, `DEB_PUBLISH_WEBHOOK`.

## Deployment
- **Repo**: github.com/robi-nordstardigital/discours-deb-dashboard
- **Branch**: main
- **Deploy**: Docker op Linux server (Compose stack `~/docker/discours-deb-dashboard/`). Cron pull-all.sh trekt repo, daarna `docker compose up -d --build`.

## Tech Stack
Next.js 15 (App Router) + TypeScript + Tailwind 4 + iron-session + node-postgres. Geen ORM (raw SQL via `src/lib/db.ts`).

## Architecture
```
src/
  lib/db.ts           Postgres pool + queries (queue, history, settings)
  lib/session.ts      iron-session cookie helper
  middleware.ts       Auth gate, redirect to /login
  app/login/          Password form + server action
  app/engine/         Discours Media Engine — visuele overzichtspagina
  app/queue/          Main approval UI + actions (publish/reject)
  app/history/        Last 30 days decisions
  app/settings/       Watched accounts + counts
  app/api/health/     200 if DB reachable
  components/Nav.tsx  Sticky glass nav bar
```

## /engine pagina

Visualisatie van de volledige Discours productie-pipeline op één pagina. SVG
flowchart toont input (YouTube) → woensdag-pipeline → vier outputs (website,
~40 shorts, DEB X-bot, nieuwsbrief) → daily publish naar X/IG/TikTok/YT.
Daaronder detail-cards per onderdeel met script-paden, instructie-MD's,
n8n-workflow-namen en API-integraties. Pure server-side rendered (geen DB
queries), auth-protected via dezelfde middleware.

## Database
Reads/writes Postgres `deb` op `192.168.50.24:5433` (Docker container `postgres-deb`). Schema via `~/Projects/Discours/scripts/deb_init_db.py`.

## Publish flow
Dashboard → POST naar `n8n /deb-publish` webhook → Python `deb_post_tweet.py` → Tweepy v2 met @DiscoursDialoog OAuth 1.0a.

## Known Issues
- Single-user auth (Robi). Voor meerdere users uitbreiden naar NextAuth + Postgres users-tabel.
- X_CONSUMER_SECRET ontbreekt nog in `.env`; posting via Tweepy faalt tot dit aangevuld is.
