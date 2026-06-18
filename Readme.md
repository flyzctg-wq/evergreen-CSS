# 🏏 Evergreen Club — Cricket Scoring System

A real-time cricket scoring app for the Evergreen Club. Features a live scorer interface, per-ball undo, manual score correction, and a read-only live viewer page for spectators.

## Features

- **Scorer** — ball-by-ball recording, extras, wickets, free-hit, run-outs
- **↩ Undo Ball** — revert any delivery including wickets and over-endings
- **✎ Manual Correction** — override score/stats for historical entry errors  
- **📵 Live Viewer** — read-only scoreboard that updates in real-time for remote spectators
- **Full Scorecard** — printable scorecard with batting, bowling, fall of wickets

## Quick Start (Local)

```bash
# Static only — works offline, same-device tabs sync automatically
open EvergreenClub.html

# With live remote viewer support (Socket.io)
cd server && node server.js
# Scorer: http://localhost:3847/EvergreenClub.html
# Viewer: http://localhost:3847/Viewer.html?match=CODE&server=http://localhost:3847
```

---

## Deploy to Vercel

### 1 — Push to GitHub
This repo is already connected to GitHub. Just push:
```bash
git push origin main
```

### 2 — Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `flyzctg-wq/evergreen-CSS` repository
3. Click **Deploy** — no build command needed

### 3 — Enable Remote Viewer Sync (Vercel KV)

The scorer and viewer work fully offline without this step (they sync via localStorage on the same device). To enable **cross-device remote sync**:

1. In your Vercel project dashboard → **Storage** tab
2. Click **Create Database** → choose **KV** → name it (e.g. `evergreen-kv`)
3. Click **Connect** to link it to your project
4. Redeploy — environment variables are added automatically

Once KV is connected, the **📵 Viewers** button in the scorer will show a live viewer URL that anyone on the internet can open.

### Live Viewer URL format
```
https://your-deployment.vercel.app/Viewer.html?match=CODE&server=https://your-deployment.vercel.app
```

The scorer's **📵 Viewers** panel shows the full URL automatically — just copy and share it.

---

## Architecture

| Path | Description |
|---|---|
| `EvergreenClub.html` | Main scorer app (React 18 UMD, no build step) |
| `Viewer.html` | Read-only live scoreboard (vanilla JS) |
| `api/matches/[matchId]/state.js` | Serverless match state API (Vercel KV) |
| `api/health.js` | Health check endpoint |
| `server/server.js` | Local dev server with Socket.io (not used on Vercel) |

### Transport on Vercel
- **Vercel**: HTTP polling every 1 second (Viewer.html has built-in 1s poll fallback)
- **Local (`server/`)**: Socket.io real-time push (~50ms) + HTTP poll fallback

> Socket.io requires a long-running process — not available on Vercel serverless. The HTTP polling fallback is seamless: the Viewer auto-detects the environment.
