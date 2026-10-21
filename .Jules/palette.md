## 2024-10-21 - Dynamic ARIA labels for custom CSS toggle switches & inline table controls
**Learning:** Custom styled toggle switches (CSS checkboxes with `opacity: 0` overlays) and inline editable table inputs lack visible text labels, making them unreadable to screen readers unless given explicit, dynamic `aria-label`s containing row context (e.g., player name).
**Action:** Always attach dynamic `aria-label` props (e.g., `Select ${player.name}`, `Role for ${player.name}`, `Notes for ${player.name}`) to custom toggle inputs and row-specific table form controls.
