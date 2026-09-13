# CSS & Design System Consistency Backlog (Sourcing vs. Contract)

*Saved on 2026-09-13 per user request for future polish.*

## Reference Comparison (from User Screenshots)
- **Reference Standard**: Sourcing Module (`http://127.0.0.1:8124`, `media_1789322727402.png`)
- **Target Module**: Contract Module (`http://127.0.0.1:8125`, `media_1789322737659.png`)

---

## Identified Differences to Align:

### 1. Top Navigation Bar
- [ ] **Module Badge**: Add green module indicator pill (`CONTRACTS` / `CONTRACT`) next to the DMP logo.
- [ ] **Language Selector**: Add the `[ EN v ]` rounded pill dropdown.
- [ ] **Account Switcher**: Add `[ • Acting as <User> v ]` pill dropdown directly in the header.
- [ ] **User Subtitle**: Standardize user role display (e.g. `SOCAR - Procurement (PROC)` / `SOCAR Upstream Operations`).

### 2. Breadcrumbs & Page Header
- [ ] **Breadcrumb Prefix**: Use `Contract module > Contract management` or `Contract module > Contracts` matching Sourcing's `Sourcing module > RFx management`.
- [ ] Muted gray breadcrumb typography and separator.

### 3. Filter Sidebar
- [ ] **Double Chevron Toggle**: Align size, placement, and hover state of the `«` collapse toggle.
- [ ] **Date Inputs**: Use `DD / MM / YYYY` placeholders with calendar SVG icon matching Sourcing.
- [ ] **Font & Spacing**: Standardize label font weights, input field heights, and spacing between filter groups.

### 4. Search Bar & Primary Action Button
- [ ] **Search Placeholder**: Change generic `Search here` to descriptive `Search contracts by number, description, or owner`.
- [ ] **Button Styling**: Match font-family, font-size, border-radius (~6-8px), and padding of `+ Add new contract` to Sourcing's `+ Create RFx`.

### 5. Table Layout & Status Indicators
- [ ] **Status Column**: Match Sourcing's dot indicator style:
  - Green dot: `• Active` / `• Awarded`
  - Yellow dot: `• Upcoming` / `• Open for bidding`
  - Gray / Red dot: `• Expired` / `• Cancelled`
  instead of full-width pill background chips.
- [ ] **Row Typography & Heights**: Match line-height, title font weights, and subtle subtitle secondary text in table cells.
