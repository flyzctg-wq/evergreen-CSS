## 2024-10-23 - ARIA Label Forwarding on Reusable HTML Wrapper Components
**Learning:** Reusable button and input components (such as `Btn` in static UMD React apps) must explicitly forward `aria-label` and `aria-*` attributes to the underlying native DOM elements so screen readers can announce icon-only or dynamic action controls properly.
**Action:** When working with custom button or input wrapper components in static React HTML pages, always check that `aria-label` and other ARIA props are included in the component props signature and forwarded to `React.createElement`.
