# ADR 001 — Canonical Token Map for Happilee Commerce Re-skin

**Date:** 2026-06-02
**Status:** Accepted
**Driver:** QA Agent's Wave 1 cross-component review surfaced naming drift between
the 12 primitive workers. Without a canonical map, 10 Wave 2 workers will
each pick differently for the same visual role.

## Context

Wave 1 shipped 12 primitives. The QA cross-component review found two naming
patterns coexisting for identical visual roles:

1. **Medusa `ui-*` tokens** (10/12 components) — `bg-ui-bg-base`, `text-ui-fg-muted`,
   `border-ui-border-base`, etc. These route through `src/styles/happilee-tokens.css`
   CSS variable overrides.
2. **Direct Happilee Tailwind tokens** (Badge + Tooltip) — `bg-hap-status-*`,
   `text-brand-secondary-text`, `bg-text-primary`. These come from
   `tailwind.config.cjs` extensions and bypass the CSS-var indirection.

Specific drifts found:
- "muted text" role appears as `text-ui-fg-muted` (#717680), `text-ui-fg-subtle`
  (#535862), and direct `text-tertiary` (#535862) — three different tokens, two
  different rendered greys.
- "calm active state" (Happilee `#edf2fe`) applied via both `bg-brand-light`
  AND `bg-ui-bg-highlight`. Same value today; could desync on future Medusa
  upgrade.

## Decision

**Default path: Medusa preset tokens.** Every visual role uses the Medusa
`ui-*` Tailwind class. The CSS-var override in `src/styles/happilee-tokens.css`
pins the var to its Happilee value. This keeps a single mental model for any
Wave 2+ worker: think in Medusa class names, get Happilee colors.

**Exception path: direct Happilee Tailwind tokens.** Use these ONLY for
visuals that don't exist in Medusa's preset namespace:
- Status-tag colors (`bg-hap-status-active-bg`, etc.) — these are Happilee-specific
  semantic palette
- Brand mark surface (`text-text-primary` for dark tooltip background) — this
  particular use-case (text color as a surface color) has no Medusa equivalent

**The canonical map:**

| Visual role | Canonical class | Hex (Happilee) |
|---|---|---|
| Page background | `bg-ui-bg-subtle` | `#fafafa` |
| Card / surface background | `bg-ui-bg-base` | `#ffffff` |
| Subtle background (hover, header band) | `bg-ui-bg-subtle-hover` | `#f5f5f5` |
| Highlighted background (selected row, active nav) | `bg-ui-bg-highlight` | `#edf2fe` |
| Primary text | `text-ui-fg-base` | `#181d27` |
| Secondary text | `text-ui-fg-subtle` | `#414651` |
| Muted text (placeholders, hints, captions) | `text-ui-fg-muted` | `#717680` |
| Brand text (links, selected nav label) | `text-brand-secondary-text` | `#4158bd` |
| Inverted text (on dark/brand surface) | `text-white` | `#ffffff` |
| Default border (inputs, cards) | `border-ui-border-base` | `#d5d7da` |
| Subtle border (dividers, table rows) | `border-ui-border-menu-bot` | `#e9eaeb` |
| Brand primary surface (CTA fill, brand mark) | `bg-brand-solid` | `#4d68dc` |
| Brand hover surface | `bg-brand-secondary-text` | `#4158bd` |
| Status: active | `bg-hap-status-active-bg` + `text-hap-status-active-text` + `border-hap-status-active-border` | `#f0fdf4`/`#15803d`/`#bbf7d0` |
| Status: draft | `bg-hap-status-draft-*` | (analogous) |
| Status: paused | `bg-hap-status-paused-*` | (analogous) |
| Tag / category pill | `bg-brand-light` + `text-brand-secondary-text` | `#edf2fe`/`#4158bd` |
| Tooltip surface (dark) | `bg-text-primary` + `text-white` | `#181d27`/`#ffffff` |

**Brand-light vs ui-bg-highlight resolution:**
- Use `bg-ui-bg-highlight` for **row/cell selected states** in lists and tables
  (where it's a transient state)
- Use `bg-brand-light` for **persistent badge/pill backgrounds** (where it's
  the identity of the element)

Both resolve to `#edf2fe` today via different paths; this separation prevents
a future Medusa upgrade from silently desyncing them.

## Consequences

**Positive:**
- One mental model for Wave 2 workers (think `ui-*`, get Happilee)
- Existing 10/12 primitives already conform
- Future Medusa upgrades only affect tokens we explicitly overrode in
  `happilee-tokens.css` — drift is contained

**Negative:**
- Wave 1.8 Badge and Wave 1.10 Tooltip ship as exceptions, not the rule.
  Their use of direct `bg-hap-*` and `bg-text-primary` tokens is correct
  (no Medusa equivalent), but workers reading those files first might
  copy the pattern incorrectly. Hence this ADR being highly visible.
- The "muted text" cleanup: Wave 1.5 Modal description currently uses
  `text-ui-fg-subtle` (which maps to `#414651` = Happilee secondary, NOT
  muted). Per this ADR, modal description should be `text-ui-fg-muted`
  (= `#717680` = Happilee quaternary placeholder). Tracked as a Wave 1
  cleanup task below.

## Wave 1 cleanup tasks (do before Wave 2 dispatches)

1. Modal: change description text from `text-ui-fg-subtle` to `text-ui-fg-muted`
2. Verify no Wave 1 component uses `text-tertiary` direct token in runtime
   code (only doc-comments allowed)
3. Verify `bg-brand-light` only appears in Badge brand variant + Select
   selected item left-border, not in Table row selected (which should be
   `bg-ui-bg-highlight`)

## Worker prompt addendum (Wave 2 onwards)

The Wave 2 mission template must include:

> Before writing any Tailwind class, consult `.agent-os/decisions/2026-06-02-canonical-token-map.md`.
> The default path is Medusa `ui-*` tokens. Only use direct Happilee Tailwind
> tokens for the explicit exceptions listed in the ADR (status badges,
> dark tooltip surface).
