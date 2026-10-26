## 2026-10-26 - In-Memory User Caching in Fallback File Store
**Learning:** `api/auth_utils.js` loaded and parsed `server/users.json` on every `getUser()` call via synchronous file read operations (`fs.readFileSync` and `JSON.parse`). In a node process, caching this in a Map after initial load or on `saveUser()` eliminates file I/O overhead on every auth lookup/middleware check.
**Action:** Always maintain an in-memory Map cache when using JSON file fallbacks for user lookup endpoints to avoid redundant synchronous disk I/O.
