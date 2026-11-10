# Bolt's Performance Journal

## 2026-07-06 - Dual-Transport Polling Redundancy in Viewer
**Learning:** `Viewer.html` initialized both an aggressive 1-second HTTP poll loop (`setInterval`) and a Socket.io WebSocket connection concurrently without tearing down the timer on connect. This doubled the load, generating 60 superfluous HTTP requests/minute per active client even while real-time WebSocket push updates were streaming.
**Action:** When implementing fallback polling alongside WebSocket connections, always pause/clear the interval timer when the socket connects (`stopPoll()`) and only resume it upon disconnect or connection error (`startPoll()`).
