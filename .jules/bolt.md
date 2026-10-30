# Bolt's Journal - Critical Learnings

## 2026-10-30 - Socket.io and Polling Dual-Transport Lifecycle in Viewer
**Learning:** In dual-transport hybrid setups where WebSockets (Socket.io) and HTTP polling coexist as fallbacks, unconditional background polling wastes 60 requests/minute per active viewer when WebSocket push is healthy.
**Action:** Always tie polling timers to the transport connection lifecycle: invoke `stopPoll()` upon WebSocket `connect` (and when match status is terminal such as `matchOver`), and only activate `startPoll()` on initial connection, `disconnect`, or `connect_error`.
