## 2026-03-31 - File-backed Auth Fallback Caching

**Learning:** When Vercel KV is offline or running locally, `api/auth_utils.js` falls back to reading `server/users.json`. Repeatedly calling `fs.readFileSync` and `JSON.parse` on hot auth endpoints (login, me, refresh) blocks Node's event loop and adds unnecessary I/O overhead (~28ms per 1,000 requests vs ~0.09ms cached). Using file modification timestamps (`mtimeMs`) allows zero-copy cached lookups while staying in sync with write operations.

**Action:** For file-backed fallback storage in serverless/Node environments, cache parsed objects in memory and check `fs.statSync().mtimeMs` before re-reading/re-parsing disk files.
