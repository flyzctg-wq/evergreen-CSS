## 2026-10-08 - Accessible Form Controls in Custom Table Draft Lists
**Learning:** Custom UI controls (such as toggle switch CSS wrappers over `<input type="checkbox">` or custom `Btn` wrapper components) in single-file React UMD components often omit `aria-label` attribute forwarding, making table rows invisible to screen readers.
**Action:** Always verify that custom button components forward `ariaLabel` as `aria-label` and pass descriptive context (e.g. `Select ${player.name}`) to checkbox and text inputs.
