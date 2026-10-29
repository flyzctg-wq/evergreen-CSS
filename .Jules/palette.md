## 2026-06-28 - ARIA Labels for Dynamic Table Row Form Controls
**Learning:** Table row inputs (such as checkboxes, inline editable inputs, role selects, and delete buttons) within lists or tables lack clear context for screen readers when using generic placeholders or header titles alone.
**Action:** Always provide context-aware dynamic ARIA labels (e.g. `aria-label={`${t("roleCol")}: ${player.name}`}`) for form controls rendered per row so screen readers announce both the column purpose and the item name.
