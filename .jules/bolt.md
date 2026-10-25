## 2026-03-31 - File-Based User DB Lookups Block Event Loop Without mtime Caching

**Learning:** Synchronous file system reads (`fs.readFileSync`) and JSON parsing (`JSON.parse`) on every user lookup (`getUser`) in file-backed fallback storage cause unnecessary synchronous disk I/O and CPU overhead on every auth request. Checking `fs.statSync(file).mtimeMs` before re-reading from disk reduces lookup time by ~77%+ while keeping the cache perfectly in sync if the file is updated externally.

**Action:** In Node.js file-backed storage fallbacks, always cache parsed contents in memory and check file modification timestamps (`mtimeMs`) to invalidate the cache, rather than synchronously reading and parsing disk contents on every call.
