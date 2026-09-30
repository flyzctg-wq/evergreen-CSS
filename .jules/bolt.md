## 2026-09-30 - In-Memory Caching for File-Backed User Auth
**Learning:** In local development or fallback mode, `getUser()` synchronously reads and parses `users.json` from disk on every authenticated request. Without caching, this adds 1-5ms per request and increases I/O overhead on hot authentication endpoints (`/api/auth/me`, `/api/auth/login`, etc.).
**Action:** Cache the parsed user map in memory and validate against `fs.statSync().mtimeMs` before re-reading from disk to eliminate redundant synchronous file I/O and JSON parsing.
