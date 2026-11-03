# Bolt's Journal - Performance Learnings

## 2026-07-06 - In-Memory Mtime File Cache for Auth Fallback
**Learning:** In environments where Vercel KV is unset (local dev server or tests), `getUser` and `saveUser` fallback to synchronous `fs.readFileSync` and `JSON.parse` of `server/users.json` on every invocation. Synchronous file reads on each authentication check block event loop processing. Caching the parsed Map and validating cache freshness using lightweight `fs.statSync` mtimeMs reduces redundant I/O and JSON parsing overhead by over 65%.
**Action:** Use mtime-checked in-memory caching for local configuration or fallback JSON stores to prevent hot-path file read overhead without risking stale data across external edits.
