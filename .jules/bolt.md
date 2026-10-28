# Bolt's Journal - Critical Learnings

## 2026-03-30 - Local File DB Synchronous Read Bottleneck
**Learning:** In fallback/file-based persistence modes, loading users from disk synchronously via `fs.readFileSync` and `JSON.parse` on every `getUser` request creates an unnecessary synchronous disk I/O bottleneck (~0.5ms-2ms per lookup).
**Action:** Use an in-memory Map cache backed by `fs.statSync(file).mtimeMs` validation. This drops lookup times to ~0.0001ms while maintaining correctness when the underlying file is updated.
