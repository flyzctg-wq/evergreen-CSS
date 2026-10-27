## 2025-05-20 - Fallback File I/O Caching in Serverless/Node Auth
**Learning:** In fallback storage systems using local JSON files (e.g. `users.json`), repeated synchronous disk reads (`fs.readFileSync`) and JSON parsing on every request create unnecessary disk I/O latency and memory allocation overhead.
**Action:** Use an in-memory cache validated against file modification time (`mtimeMs`) via `fs.statSync`. Update the memory cache directly when saving.
