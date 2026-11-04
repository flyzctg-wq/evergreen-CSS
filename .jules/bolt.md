# Bolt's Performance Journal

## 2026-06-28 - Eliminate Redundant HTTP Polling in Viewer
**Learning:** `Viewer.html` initialized both a 1-second HTTP interval poll and a Socket.io WebSocket connection concurrently as fallback. Without explicitly pausing the polling timer once Socket.io connected, each client tab was firing ~60 redundant HTTP requests/minute against `/api/matches/:matchId/state` despite real-time events arriving over WebSocket.
**Action:** When using WebSocket connections with HTTP polling fallback, always suspend polling timers on socket connect and reinstate polling on socket disconnect or connection error.
