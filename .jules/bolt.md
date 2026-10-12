## 2026-10-12 - In-Memory Caching for File DB Fallback
**Learning:** Local file-based fallback storage (`users.json`) in shared auth utility functions re-read and re-parsed the JSON file synchronously on every user lookup (`getUser`). Using an in-memory Map with `fs.statSync(LOCAL_DB_PATH).mtimeMs` freshness checking eliminates synchronous file I/O and JSON parsing overhead while remaining responsive to disk changes.
**Action:** Always check shared file-based persistence helpers for repeated synchronous file I/O operations and cache parsed structures in module scope with mtime invalidation.
