# Bolt's Journal - Critical Performance Learnings

## 2025-05-18 - Avoid repeated localStorage reads and JSON.parse in render loops
**Learning:** In static HTML/JS web applications, accessing `localStorage.getItem()` and parsing JSON inside frequent render functions or row-mapping iterations (such as rendering player scorecards or live update views) causes synchronous I/O overhead and object allocations on every single player row.
**Action:** Cache parsed `localStorage` data in an in-memory Map or lookup object that invalidates or re-reads only when `localStorage` changes, avoiding redundant parsing and disk reads on render.
