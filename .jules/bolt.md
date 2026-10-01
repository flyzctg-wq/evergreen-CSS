# Bolt's Journal

## 2026-10-01 - Caching localStorage Reads and JSON Parsing in UI Render Loops

**Learning:** Repeatedly calling `localStorage.getItem` and `JSON.parse` inside render functions / scorecard loops causes severe UI render latency because `localStorage` access is synchronous and parsing JSON repeatedly allocates memory and blocks the main thread. Caching the parsed Map with a cache invalidation key based on the raw `localStorage` string converts O(N) array scans and storage reads into O(1) in-memory Map lookups.

**Action:** When looking up static/semi-static data stored in `localStorage` inside UI rendering loops, cache the parsed object/Map in memory and only re-parse when the underlying string value in `localStorage` changes.
