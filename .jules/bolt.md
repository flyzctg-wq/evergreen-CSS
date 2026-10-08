## 2026-10-08 - Cache Local File Storage Lookups with File Modification Validation

**Learning:** `loadUsersFromFile` performed synchronous `fs.readFileSync` and `JSON.parse` on every user retrieval call. In file-backed storage, checking `fs.statSync(file).mtimeMs` before re-reading avoids redundant disk I/O and JSON parsing when the file hasn't changed.

**Action:** When working with file-backed state or JSON databases in Node.js, cache the parsed in-memory Map alongside `stats.mtimeMs` to achieve O(1) in-memory lookups while remaining safe if the file is modified externally.
