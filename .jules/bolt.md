# Bolt's Journal

## Critical Learnings

## 2026-07-06 - Redundant polling in dual WebSocket/HTTP sync architectures
**Learning:** In applications using hybrid real-time synchronization (WebSocket/Socket.io primary with HTTP polling fallback), initial fallback pollers often remain active even after a WebSocket connection successfully opens, generating unnecessary periodic HTTP requests (e.g. 60 requests/minute per active client) and causing duplicate DOM renders and server load.
**Action:** Always verify that background fallback pollers provide an explicit deactivation hook (`stopPoll()`) that triggers on socket connection, and only reactivate when the socket disconnects or encounters an error.
