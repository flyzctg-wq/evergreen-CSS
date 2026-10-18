## 2026-10-18 - Local File User Lookup Caching
**Learning:** `api/auth_utils.js` was reading and JSON parsing `server/users.json` synchronously on every user lookup/authentication request, causing ~0.16ms delay per request (~1.6s per 10k requests).
**Action:** Use file `mtimeMs` checking in `loadUsersFromFile` to cache the parsed user Map in memory and only re-read from disk when the underlying file modified time changes.
