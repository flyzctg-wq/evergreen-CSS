# Bolt's Journal

## 2026-07-06 - Dual-Transport Polling Teardown
**Learning:** When client applications implement dual real-time transports (e.g. Socket.io push + HTTP polling fallback), continuing 1Hz HTTP polling after the WebSocket handshake succeeds generates redundant HTTP GET traffic (`~3,600` req/hr per viewer) and causes duplicate snapshot processing.
**Action:** Always provide explicit cancellation (`stopPoll()`) upon successful WebSocket connection or data push events, and only re-enable polling when disconnected or on transport error.
