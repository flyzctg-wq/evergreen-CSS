## 2026-06-28 - Custom Button Wrapper Accessibility
**Learning:** In static React HTML apps with custom button wrapper components (like `Btn`), aria-label and title props must be explicitly destructured and passed to the underlying `<button>` element so screen readers receive proper context when buttons display icon/bilingual labels.
**Action:** Ensure custom wrapper components forward `aria-label` and `title` attributes down to native HTML elements.
