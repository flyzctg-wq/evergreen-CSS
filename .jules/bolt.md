## 2026-06-28 - In-Memory User Lookup Caching

**Learning:** `loadUsersFromFile()` in `api/auth_utils.js` previously executed synchronous disk reads (`fs.readFileSync`) and JSON parsing (`JSON.parse`) on every user lookup (`getUser()`), blocking the Node event loop on every authenticated request. Adding mtime-aware in-memory caching reduced user lookup latency from ~23.6 µs/call down to ~0.34 µs/call (~70x speedup) with zero breaking changes.
**Action:** Always cache file-backed reads in memory with `statSync` or update-on-write invalidation when disk persistent fallback databases are used in Node serverless/Express endpoints.
