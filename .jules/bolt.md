# Bolt's Journal - Critical Learnings Only

## 2026-06-28 - Dual Real-Time Transport Redundancy
**Learning:** In dual-transport client designs where both HTTP polling and WebSockets are initialized for fallback resilience, failing to cancel the polling timer results in 100% redundant HTTP GET requests running indefinitely alongside WebSocket push events.
**Action:** Always provide an explicit stop/pause function on background polling timers that is tied to WebSocket connection and reconnection lifecycle events (`connect` -> stop polling, `disconnect`/`connect_error` -> resume polling).
