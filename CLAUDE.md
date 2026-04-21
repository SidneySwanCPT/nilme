# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Camp 8 is a Georgia high school football intelligence site: recruiting maps, prospect camps, NIL tracking, coach directory, athlete dashboard, and a Claude-powered AI chat. It is a **static multi-page site** (no build step, no bundler, no `package.json`) deployed on **Netlify**, with **Supabase** for auth/data and two **Netlify serverless functions** as secure proxies.

## Development workflow

There is no build, lint, or test command — files in the repo root are served directly.

- **Local dev (with functions):** `netlify dev` — runs the site plus `netlify/functions/*` on localhost with env vars from `.env`. Plain `python -m http.server` works for pure-HTML browsing but will break anything that calls `/api/*` or `/.netlify/functions/*`.
- **Deploy:** push to the tracked branch — Netlify auto-builds from `netlify.toml` (no build command, `functions = "netlify/functions"`).
- **Schema changes:** edit `schema.sql` and run it in Supabase Dashboard → SQL Editor. Nothing in the repo applies migrations automatically.

Required Netlify env vars (set in the Netlify UI, not committed):
- `ANTHROPIC_API_KEY` — used by `netlify/functions/chat.js` and `news-scanner.js`
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` — used by `news-scanner.js` (service role, NOT anon)
- `CAMP8_BACKEND_URL`, `CAMP8_API_SECRET` — used by `netlify/functions/scrape.js` to reach the EC2 scraper

## Architecture

### Page boot sequence

Every HTML page follows the same pattern, and the order matters:

1. Load Supabase SDK from jsDelivr CDN: `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2">`
2. `auth-guard.js` — **must come before `nav.js`**. Hides `<html>` with `visibility:hidden`, checks session, redirects to `login.html` if not signed in, or `onboarding.html` if `athletes.onboarding_complete` is false. Pages in its `PUBLIC_PAGES` allow-list (e.g. `index.html`, `nil-central.html`, `camps.html`) skip the gate.
3. `<div id="nav-root"></div>` + `nav.js` — `nav.js` replaces `#nav-root` with the shared nav, computes the breadcrumb from its `PAGE_MAP`, wires dropdown hover timers, and injects the floating AI chat bubble (skipped on `chat.html`). **Edit `nav.js` to change the nav on every page at once.**
4. `shared.js` (optional) — HTML escape, toast, debounce, `getSB()`, etc.
5. `supabase-client.js` (optional) — typed-ish helpers for `athletes`, `athlete_combine_scores`, `athlete_nil_scores`, `athlete_starred_camps`, `athlete_offers`, `athlete_goals`.

### Serverless functions (`netlify/functions/`)

- **`chat.js`** — proxies the browser to `api.anthropic.com/v1/messages` so `ANTHROPIC_API_KEY` stays server-side. Consumed by `ai-chat.js` (the shared chat UI module used by `chat.html`, `nil-rating.html`, `combine-eval.html`). Hard-codes `model: 'claude-sonnet-4-5'`. The root-level `chat.js` is a local dev copy that adds rate limiting — **the deployed version is the one in `netlify/functions/`**; keep both in sync or delete the root copy.
- **`scrape.js`** — proxies to an EC2 backend (`CAMP8_BACKEND_URL`) that scrapes MaxPreps. Only `type: 'maxpreps'` is allowlisted. Same root-vs-functions duplication caveat applies.
- **Scheduled: `news-scanner`** — cron `0 8 * * *` (declared in `netlify.toml`). Pulls Google News RSS via rss2json, filters commitments/NIL headlines, asks Claude Haiku to extract structured JSON, and inserts into the `pending_news` table for admin review in `admin.html`.

### Data layers

There are two parallel data sources; understand which you're touching:

- **Static JS data files** (`camps-data.js`, `recruits-data.js`, `commitments-data.js`, `coaches-data.js`, `nil-data.js`, `programs-data.js`, `sponsors-data.js`, `transfer-data.js`) — large `const X_DATA = [...]` arrays loaded as script tags. The site renders directly from these. `camps-data.js` is ~500KB; edit carefully.
- **Supabase tables** (`schema.sql`) — two groups:
  - Per-athlete tables (`athletes`, `athlete_combine_scores`, `athlete_nil_scores`, `athlete_starred_camps`, `athlete_offers`, `athlete_goals`) are RLS-gated by `auth.uid() = user_id`. All writes go through `supabase-client.js`.
  - Admin tables (`camps_admin`, `commitments_admin`, `nil_deals_admin`, `coaches_admin`, `pending_news`) supplement the static files. Public-read policies require `is_active=true` / `verified=true`. Reviewed in `admin.html`.

### Auth / routing gotchas

- The Supabase **URL and anon key are hardcoded** in `supabase-client.js`, `auth-guard.js`, and `nav.js`. If you rotate them, update all three.
- `auth-guard.js`'s `PUBLIC_PAGES` list must stay in sync with what users should be able to see logged-out. Adding a new public page? Add it there.
- `netlify.toml` has a catch-all `/* → /404.html` redirect; any new top-level route needs a file or a redirect rule above it.
- Pages are reached by bare filename (`coaches.html`, not `/coaches`) — internal links use `.html` extensions.

### Shared AI chat module

`ai-chat.js` exposes `CAMP8_AI.send({ messages, system, max_tokens })` and `CAMP8_AI.buildChatUI({ container, system, welcomeMsg, accentColor, onResponse })`. All AI-driven pages go through it and through `/.netlify/functions/chat`. The function uses `window._c8SendMsg` as a global hook, so only one chat UI can be active per page.
