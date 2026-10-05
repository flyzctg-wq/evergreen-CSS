## 2026-06-28 - In-memory caching for local file-based database fallbacks

**Learning:** When database access falls back to a local JSON file (`users.json`), executing `fs.readFileSync` and `JSON.parse` synchronously on every user lookup/query blocks the Node.js event loop and introduces disk I/O latency on every authenticated request. Using an in-memory cache mapped to file modification timestamps (`fs.statSync(LOCAL_DB_PATH).mtimeMs`) avoids repeated synchronous disk reads while ensuring data freshness.

**Action:** Whenever implementing disk file or fallback persistence layer lookups in Node.js, maintain an in-memory `Map` cache and stat timestamp to serve O(1) reads without blocking the event loop.
