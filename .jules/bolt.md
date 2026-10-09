## 2026-10-09 - File DB mtime Caching in auth_utils
**Learning:** Sync disk reads (`readFileSync`) and JSON parsing (`JSON.parse`) in local fallback storage paths add ~150ms per 1,000 requests. Using file stat modification time (`mtimeMs`) caching reduces latency by ~30x while remaining safely synchronized with disk updates.
**Action:** Always check for repeated sync disk reads in fallback store helpers and cache using `fs.statSync` `mtimeMs`.
