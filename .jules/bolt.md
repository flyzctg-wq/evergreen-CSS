## 2026-10-04 - Local user storage fallback file I/O bottleneck

**Learning:** When Vercel KV is not configured, `getUser()` fell back to reading `users.json` directly from disk using synchronous `fs.readFileSync` and `JSON.parse` on every request. This blocked Node.js event loop on every auth-related API route.
**Action:** Lazily populate in-memory Map cache (`memoryUsers`) on first access and update in-memory cache on writes before persisting to disk.
