## 2026-10-18 - Language Toggle Button Accessibility & Dynamic ARIA Labels
**Learning:** Single-word language toggle buttons (e.g., "বাংলা" / "English") in multilingual scoreboards need explicit `:focus-visible` styles and dynamically updated `aria-label` / `title` attributes so screen reader and keyboard users understand what action clicking the button will perform.
**Action:** When adding language toggle controls in vanilla JS apps, set initial `aria-label` and `title` in HTML and update them alongside `textContent` in the translation handler.
