# Palette's Journal - Critical Learnings

## 2026-06-28 - Bilingual Language Toggle Accessibility
**Learning:** For standalone bilingual toggle buttons that show the target language name as inner text (e.g., "বাংলা" or "English"), screen readers benefit from an explicit `aria-label` stating the action ("Switch language to বাংলা" / "Switch language to English") updated dynamically in sync with the state toggle. In addition, providing explicit `:focus-visible` styling using the design system's highlight token (`var(--gold)`) ensures clear visual focus indicators for keyboard navigation.
**Action:** When adding or updating language switchers, always pair inner language text with an action-oriented `aria-label` that updates on change, and ensure a 2px focus ring with `:focus-visible`.
