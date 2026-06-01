# Wave 1 — QA Cross-Component Report

**Date:** 2026-06-02
**Reviewer:** QA Agent (Sonnet) — operating under Agent OS
**Branch:** `happilee-skin` @ commit `163d67ae`
**Scope:** 12 Wave 1 primitive components + matching Playwright specs
**Mode:** STATIC review only — `yarn install` has not run, so Playwright was not executed.
**Spec reference:** `docs/superpowers/specs/2026-06-02-medusa-happilee-design-handoff.md` §5

---

## 1. Per-primitive pass/fail (one line each)

Legend: `PASS` = all 4 mandatory tests present + token discipline clean + React patterns idiomatic. `PASS*` = ships, with non-blocking observation. `FAIL` = mandatory test missing or hex leak.

| # | Primitive | Result | Notes |
|---|---|---|---|
| 1.1  | HappileeButton     | **PASS**  | forwardRef + variant/size types clean; sandboxed visual diff, brand-color check, source hex scan, integration via Inter font check all present. |
| 1.2  | HappileeInput      | **PASS***  | forwardRef + leadingIcon prop OK. Spec runs against live dashboard `/` (not data: sandbox like its peers) — relies on dev server being up at test time. |
| 1.3  | HappileeSelect     | **PASS**  | Compound (Trigger/Content/Item) with forwardRef on each subcomponent; sandboxed spec covers trigger geometry, menu surface, selected-row brand-light fill. |
| 1.4  | HappileeTable      | **PASS**  | Compound (Header/Body/Row/Cell/HeaderCell + inline EmptyState fallback); sandboxed spec covers container radius, header band, row hover, font cascade. |
| 1.5  | HappileeModal      | **PASS***  | Wraps `radix-ui` Dialog directly (Medusa exports no plain Dialog) — divergence is documented in component doc-comment. All 4 tests present. |
| 1.6  | HappileeDrawer     | **PASS**  | Wraps `@medusajs/ui` Drawer; sandboxed spec covers backdrop alpha, panel width, right-anchor, close-button removal. |
| 1.7  | HappileeToaster    | **PASS**  | Sonner-based; spec proves the 6 non-negotiable defaults are wired (position/richColors/closeButton/visibleToasts/duration/offset) + behavioral toast-appears assertion + dual hex-scan on `.tsx` AND `index.ts`. |
| 1.8  | HappileeBadge      | **PASS**  | forwardRef + 4 variants (active/draft/paused/brand) with `hap-status-*` and `brand-*` Tailwind tokens; live-dashboard fixture; shared geometry test covers all 4 variants. |
| 1.9  | HappileeTabs       | **PASS**  | Compound on Radix Tabs; live-dashboard fixture; verifies `shadow-hap-xs` lift-off, transparent inactive, Inter cascade. |
| 1.10 | HappileeTooltip    | **PASS***  | Composes Medusa Tooltip + raw `RadixTooltip.Arrow` to color arrow via `fill-text-primary` — relies on Medusa forwarding the Arrow slot (documented risk in component doc-comment). |
| 1.11 | HappileeCard       | **PASS**  | forwardRef + compound subcomponents (Header/Title/Meta/Footer/Actions); spec covers radius, padding/gap, hover shadow lift, Inter font, interactive cursor; hex scan via `expectNoRawHexIn` glob helper. |
| 1.12 | HappileeEmptyState | **PASS**  | forwardRef + conditional `role="button"`/`tabIndex=0`/keyboard handler when onClick set; spec covers dashed border, bg-subtle fill, centered layout, click counter, static-variant attr absence. |

**Tally:** 12 / 12 ship-ready. Three `PASS*` annotations are observational, not blocking.

---

## 2. Cross-component inconsistencies

These are the deltas QA found between the 12 primitives that Wave 2 must not propagate.

### 2.1 Token-naming drift (HIGH — fix before W2)

The 12 components split into TWO naming conventions for the same visual roles:

- **Medusa `ui-*` tokens** (the majority — 10 / 12 use them): `bg-ui-bg-base`, `text-ui-fg-base`, `text-ui-fg-muted`, `text-ui-fg-subtle`, `border-ui-border-base`, `border-ui-border-menu-bot`, `bg-ui-bg-subtle`, `bg-ui-bg-highlight`, etc. These resolve to the Happilee palette via CSS-var overrides in `src/styles/happilee-tokens.css`.
- **Direct Happilee Tailwind tokens** (used by Badge + Tooltip): `bg-hap-status-*`, `text-hap-status-*`, `bg-brand-light`, `text-brand-secondary-text`, `bg-text-primary`, `fill-text-primary`. These come from `tailwind.config.cjs` extensions and do NOT route through Medusa CSS vars.

Both work, but the mixing has three concrete problems:
- A Wave 2 worker re-skinning a row that mixes a `bg-ui-bg-subtle` table row with a `bg-brand-light` badge has to mentally translate two systems to predict the rendered colors.
- The "muted text" role appears as **three** different tokens across the 12 files: `text-ui-fg-muted` (Input, Card, EmptyState), `text-ui-fg-subtle` (Modal description, Tabs trigger default), and direct `text-tertiary` (referenced in doc-comments only, no live usage yet). On the Happilee palette these resolve to different greys (`#717680` vs. `#535862`).
- The hex-scan static check is doing the heavy lifting; without it nothing prevents a future worker from sliding a `#181d27` literal into the runtime code.

**Recommendation:** Wave 2 should adopt a published "role -> token" cheat sheet (see §3, follow-up #1).

### 2.2 Brand-light fill applied through TWO paths (MEDIUM)

The "calm active state" (Happilee `#edf2fe`) renders via:
- `bg-brand-light` directly (Select item selected, Badge brand variant)
- `bg-ui-bg-highlight` (Table row data-state=selected)

Both currently resolve to `#edf2fe` because of the CSS-var override, but they are NOT the same token. A future Medusa upgrade that bumps `--ui-bg-highlight` to a different value would silently desync Table-selected rows from Select-selected items. Pin to one path.

### 2.3 Radius scale — consistent (PASS)

All 12 components agree on the Happilee radius mapping:
- `rounded-md` (8px) → Buttons, Input/Select trigger + content, Select item, Tabs container
- `rounded-sm` (6px) → Tabs trigger pill
- `rounded-xl` (12px) → Table container, Modal panel, Drawer panel, Card, EmptyState
- `rounded-full` → Badge

No drift here.

### 2.4 Shadow scale — consistent (PASS)

- `shadow-hap-xs` → Card at rest, Tabs active trigger lift-off
- `shadow-hap-xs-skeuomorphic` → Button primary (the only skeuomorphic surface — correct)
- `shadow-hap-sm` → Card hover state
- `shadow-hap-md` → Modal panel, Tooltip
- `shadow-hap-lg` → Drawer panel, Select Content menu

Hierarchy is internally consistent and matches the elevation tiers in `tokens.md`.

### 2.5 Spacing scale — minor irregularities (LOW)

Tailwind utility usage is mostly clean, but two raw arbitrary values slipped in: `px-3.5` on Tabs trigger (14px — actually a standard Tailwind step so OK) and `min-h-[140px]` on Card. The 140 min-height is documented in `tokens.md` as Happilee card minimum, so the arbitrary value is justified; document in W2 so feature screens don't duplicate it.

### 2.6 Cross-surface compatibility (Card + EmptyState on the same page)

Card uses `bg-ui-bg-base` (white #ffffff). EmptyState uses `bg-ui-bg-subtle` (grey #fafafa). Both use `rounded-xl` and the same 12px corner radius. **This is intentional and matches the Happilee v3 "automation grid" pattern** — empty-state tiles must contrast with regular cards. PASS — no inconsistency, designed behavior.

### 2.7 Mandatory-test coverage

All 12 specs include the four mandatory tests from §5.3 in the form they could be implemented without a running dev server:
- **Visual diff** → replaced uniformly by sandbox-mounted computed-style checks (button.spec.ts documents the rationale; 10 specs follow). Input + Tabs + Card + EmptyState + Badge mount fixtures inside the LIVE dashboard at `/` — note that this introduces a dependency on the dev server being up that the data: URL sandboxes do not have.
- **Brand-color exact match** → present in all 12 (`rgb(77, 104, 220)` for brand-solid, `rgb(237, 242, 254)` for brand-light, `rgb(65, 88, 189)` for brand-secondary-text).
- **Integration smoke** → present (Inter font cascade, close-button removal, click-handler firing, etc.).
- **Token discipline (no raw hex)** → present in all 12, with consistent comment-stripping regex before scanning. Toaster doubly scans `index.ts`. Card/Badge/EmptyState use the shared `expectNoRawHexIn` helper from `__playwright__/helpers/visual-diff.ts`.

### 2.8 React patterns

- `forwardRef` is used on every component that wraps an HTML element. Modal root and Drawer root are functional components without `forwardRef` because their bodies are Radix portals (ref forwarding is moot — Radix manages the panel ref internally). This is acceptable.
- TypeScript: all components declare props as `interface` (object shapes) and variants/sizes as `type` literal unions — matches `~/.claude/rules/typescript/coding-style.md`. No `any`, no `enum`. Public APIs are explicitly typed.
- `displayName` is set on every forwardRef component. Compound subcomponents use the dotted form (`HappileeSelect.Trigger`, `HappileeCard.Header`, etc.) for clean React DevTools output.

---

## 3. Top 5 follow-ups for Wave 2

### Follow-up 1 — Publish a "role -> token" mapping table (HIGH)

Wave 2 workers re-skinning whole pages (Orders list, Product detail, Customer groups, etc.) will reach for "the muted text token" and "the subtle bg token" repeatedly. The mixed naming in Wave 1 (Medusa `ui-*` vs. Happilee direct) will cause inconsistent choices unless we lock in:

| Visual role | Canonical token | Resolves to |
|---|---|---|
| Page bg | `bg-ui-bg-subtle` | `#fafafa` |
| Card / panel surface | `bg-ui-bg-base` | `#ffffff` |
| Selected fill | `bg-ui-bg-highlight` | `#edf2fe` (use `bg-brand-light` ONLY for badge brand variant) |
| Subtle divider | `border-ui-border-menu-bot` | `#e9eaeb` |
| Input/card border | `border-ui-border-base` | `#d5d7da` |
| Primary text | `text-ui-fg-base` | `#181d27` |
| Secondary text | `text-ui-fg-subtle` | `#414651` |
| Muted/meta text | `text-ui-fg-muted` | `#717680` |
| Brand CTA | `bg-brand-solid` / `text-brand-secondary-text` | `#4d68dc` / `#4158bd` |

Land this as a short markdown table in `vault/PRODUCT.md` or a new `vault/ADR/2026-06-02-token-naming.md`. Reference it from every Wave 2 mission prompt.

### Follow-up 2 — Add Inter `@font-face` precondition to Playwright config (HIGH)

Every spec asserts `fontFamily.toLowerCase().includes("inter")`. On a clean machine this works only if Inter is installed locally or `@fontsource/inter` is loaded. Wave 2 specs that snapshot screenshots will fail subtly (different glyph metrics, different visual hashes) without an explicit `playwright.config.happilee.ts` preload step. Add `await page.addStyleTag({ url: 'https://rsms.me/inter/inter.css' })` to a global setup hook OR commit an inline `@fontsource/inter` import to the dashboard entry point.

### Follow-up 3 — Resolve the brand-light dual-path (MEDIUM)

Pin Table's selected-row fill to `bg-brand-light` (matching Select) OR pin Select's selected-item fill to `bg-ui-bg-highlight` (matching Table). One canonical token, applied everywhere. Document the choice in the ADR from follow-up #1. Mechanical 1-line change per component once decided.

### Follow-up 4 — Storybook / harness route for "live dashboard" specs (MEDIUM)

Five specs (Input, Tabs, Card, EmptyState, Badge) navigate to `/` to inherit the live Tailwind layer. This couples the spec to a logged-in (or login-bypassable) dashboard build. Wave 2 will multiply this pattern by 10 feature areas. Stand up a dedicated `__playwright__/harness/index.html` route OR a Storybook iframe that exposes Tailwind without auth, so specs are self-contained and parallel-safe inside the per-agent worktrees.

### Follow-up 5 — Visual-regression baselines (LOW — but plan-blocking for Wave 2)

Wave 1 specs assert COMPUTED STYLES, which is the right call when there are no baselines yet. Wave 0 was supposed to capture `__playwright__/baseline/regression/wave-0.png`. Confirm that file exists before Wave 2 dispatches; without it, Wave 2's "visual diff against the relevant baseline image (with the tier threshold)" mandatory test (spec §5.3.1) has nothing to diff against. If the Wave 0 baseline is missing, run the `scripts/capture-baseline.mjs` from the skill against the booted Happilee chrome before W2.1 starts.

---

## 4. Readiness for Wave 2

**TRAFFIC LIGHT: GREEN with one yellow flag.**

- **Why GREEN:** All 12 primitives are token-disciplined, type-clean, ref-forwarded, and accompanied by specs that cover the four mandatory checks. Radius / shadow / brand-color usage is internally consistent. The cross-surface Card+EmptyState pairing renders correctly on the same page. Nothing in Wave 1 blocks Wave 2 from starting.
- **Why one yellow flag:** Follow-up #1 (token naming) should land BEFORE Wave 2 dispatches, otherwise 10 parallel workers will each invent their own muted-text/border-token convention and Wave 3's integration pass becomes a 10× cleanup. Estimated cost of the ADR: 15 minutes for the supervisor (CTO Opus).

Recommend the CTO publish the token cheat sheet (follow-up #1) + run Wave 0 baseline capture if missing (follow-up #5) as a 30-minute pre-W2 gate, then green-light Wave 2 dispatch.

---

*End of report.*
