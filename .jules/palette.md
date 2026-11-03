# Palette's Journal

## 2026-06-28 - Focus Visibility & ARIA State on Viewer Language Toggle
**Learning:** In static standalone viewer apps that do not pull in heavy UI design frameworks, interactive controls like language toggle buttons frequently miss `:focus-visible` styling and descriptive `aria-label` tags, impairing keyboard navigation on dark theme backgrounds.
**Action:** Always provide explicit `:focus-visible` rings with appropriate outline offsets using existing theme tokens (like `var(--gold)`) and ensure dynamic ARIA labels reflect the target action state upon language toggle.
