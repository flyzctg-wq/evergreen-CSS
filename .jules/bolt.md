## 2026-03-01 - Synchronous File DB Caching in Serverless / Fallback Auth
**Learning:** Calling `fs.readFileSync` and `JSON.parse` synchronously on every authentication check (`getUser`) blocks the Node.js event loop and allocates unnecessary objects on every request.
**Action:** Cache the parsed user database in memory (`cachedUsersMap`) and validate freshness using `fs.statSync(path).mtimeMs`. This reduces user lookup overhead from O(N) file I/O to O(1) in-memory lookups when the file has not changed.
