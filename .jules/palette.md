## 2025-02-18 - Table Form Controls Accessibility
**Learning:** Table row inputs and custom visual controls (like switch toggles) lack accessible names for screen readers when headers are not directly tied to inputs using `aria-label` or `<label htmlFor>`. In UMD/React components within HTML files, dynamic `aria-label` with localized template interpolation provides immediate context (e.g. "Select Reaz" instead of "Checkbox").
**Action:** Always add dynamic localized `aria-label`s to interactive elements in repeating table rows.
