## 2026-10-02 - Local User DB File Read Caching
**Learning:** In fallback/local file mode (`users.json`), calling `loadUsersFromFile()` on every user lookup caused redundant synchronous `fs.readFileSync` and `JSON.parse` operations on every auth endpoint call.
**Action:** Use `fs.statSync` with `mtimeMs` checking against an in-memory cached Map to achieve >15x speedup without risking stale file reads if modified externally.
