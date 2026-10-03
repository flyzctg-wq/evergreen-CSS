## 2024-10-03 - Accessible Custom Toggle Switches in React UMD Tables
**Learning:** Custom CSS toggle switches (`<label class="switch"><input type="checkbox"><span class="slider"></span></label>`) visually hide the underlying checkbox input. When rendered in dynamic table rows, screen readers cannot associate the toggle with the row context unless an explicit `aria-label` (e.g. `aria-label="${status}: ${player.name}"`) is provided directly on the input.
**Action:** Always add item-specific `aria-label`s to custom inputs and inline controls in data tables.
