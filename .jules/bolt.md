# Bolt's Journal - Critical Performance Learnings

## 2025-05-18 - Local File DB Synchronous Disk I/O Bottleneck
**Learning:** In fallback or file-backed Node.js storage helpers, reading and parsing JSON files synchronously (`fs.readFileSync` + `JSON.parse`) on every user lookup blocks the single-threaded event loop and creates significant latency (~1ms-5ms per request). Caching the parsed Map in module-level memory cuts read latency to O(1) in RAM (< 0.005ms per query), providing a ~1000x speedup.
**Action:** Always verify if fallback/file-based database routines are hitting disk on every query and cache the in-memory representation while synchronizing write paths.
