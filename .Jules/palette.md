## 2026-10-15 - Modal Close Buttons & Language Toggles Missing ARIA Labels

**Learning:** Inline React `createElement` modals and header HTML buttons in this project often lack explicit `aria-label` attributes. Icon-only buttons like "×" are read aloud by screen readers as "multiplication sign" or "x", making modal dismissal inaccessible.
**Action:** Always verify icon-only buttons (`×`, chevron icons, toggle buttons) in static/inline HTML and React components have descriptive `aria-label`s.
