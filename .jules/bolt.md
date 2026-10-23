## 2025-10-23 - Local User File DB Read Caching

**Learning:** When local file storage fallback is used for user auth data (`server/users.json`), un-cached `loadUsersFromFile()` executed `fs.readFileSync` and `JSON.parse` on every single authentication/JWT verification request (`getUser`). Checking `fs.statSync(path).mtimeMs` before re-reading/re-parsing reduces 5,000 lookup times from ~535ms down to ~30ms (a ~17x speedup).
**Action:** When working with local JSON file persistence fallbacks in Node.js server environments, cache parsed objects in memory and validate freshness via lightweight `fs.statSync(path).mtimeMs` checks, and explicitly invalidate cache on writes.
