## 2026-10-03 - Memoize localStorage Reads in Scorecard Render Loops
**Learning:** Calling `localStorage.getItem()` and `JSON.parse()` repeatedly inside row-rendering functions (e.g., player role lookup for every batter/bowler on every render) causes synchronous storage I/O and redundant $O(N)$ JSON parses on hot rendering paths.
**Action:** Cache the parsed data in an in-memory `Map` and only re-parse when the raw string returned by `localStorage.getItem()` changes.
