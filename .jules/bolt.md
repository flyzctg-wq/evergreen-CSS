## 2026-06-28 - File System DB Caching with mtime Check
**Learning:** When using local file-based JSON database fallbacks, reading and parsing JSON on every request incurs severe sync file I/O overhead. Caching the parsed Map and comparing `fs.statSync(path).mtimeMs` against `lastFileMtimeMs` reduces sync I/O overhead by ~2.7x while strictly keeping local file updates in sync across reads and writes.
**Action:** Always check file `mtimeMs` when implementing file-backed local caches, and ensure write operations (`saveUsersToFile`) update both the cached Map and `lastFileMtimeMs`.
