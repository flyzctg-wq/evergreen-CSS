## 2026-10-17 - In-memory caching for user lookups in auth_utils

**Learning:** `authUtils.getUser()` was triggering synchronous file reads (`fs.readFileSync`) and JSON parsing of `server/users.json` on every request when Vercel KV was offline, blocking the Node.js event loop on every auth route.
**Action:** Lazily cache local file users in `memoryUsers` Map on first load and keep in sync during `saveUser` to ensure O(1) in-memory lookups.
