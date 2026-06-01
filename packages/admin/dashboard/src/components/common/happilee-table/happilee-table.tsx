/**
 * HappileeTable — Wave 1.4
 *
 * A thin re-skin of `@medusajs/ui`'s `Table` that pins the table surface to
 * the Happilee v3 visual language. The underlying Medusa primitive keeps its
 * semantics (forwardRef, native `<table>` / `<tr>` / `<th>` / `<td>` element
 * pass-through), and we override only the presentation layer through
 * `className`, which is applied AFTER Medusa's defaults so utilities on the
 * same property win.
 *
 * Design contract — sourced from
 * `~/.claude/skills/happilee-v3-design-system/references/{tokens,components}.md`
 *
 *   Container:
 *     - bg-primary (#ffffff)              → bg-ui-bg-base
 *     - 1px border-secondary (#e9eaeb)    → border-ui-border-menu-bot
 *     - radius xl (12px)                  → rounded-xl
 *     - overflow-hidden so corner radius clips inner rows
 *
 *   Header row:
 *     - bg-secondary (#fafafa)            → bg-ui-bg-subtle
 *     - text-xs font-semibold uppercase tracking-wide
 *     - text-tertiary (#535862)           → text-ui-fg-muted
 *     - padding y 12px x 16px             → py-3 px-4
 *     - border-b border-secondary         → border-b border-ui-border-menu-bot
 *
 *   Body row:
 *     - padding y 12px x 16px             → applied to descendant cells
 *     - border-b border-secondary         → border-b border-ui-border-menu-bot
 *     - last row has no border            → last:border-b-0
 *     - hover bg-secondary                → hover:bg-ui-bg-subtle
 *     - data-state=selected → bg brand-light (#edf2fe) → bg-ui-bg-highlight
 *
 *   Cell:
 *     - text-sm                           → text-sm
 *     - text-primary (#181d27) default    → text-ui-fg-base
 *     - text-tertiary (#535862) when meta → opt-in via `meta` prop
 *     - font-normal (400)
 *
 *   Typography: Inter, inherited from the app shell (set globally in
 *   `tailwind.config.cjs` and applied to `:root`).
 *
 * Every value below traces back to a Tailwind/Medusa token whose underlying
 * CSS variable is pinned to the Happilee v3 palette in
 * `packages/admin/dashboard/src/styles/happilee-tokens.css`. No raw hex
 * literals appear in this file outside of doc comments.
 */

import { Table as MedusaTable, clx } from "@medusajs/ui"
import * as React from "react"

/* ─── Root container ─────────────────────────────────────────────────── */

type MedusaTableProps = React.ComponentPropsWithoutRef<typeof MedusaTable>

export interface HappileeTableProps extends MedusaTableProps {
  /**
   * Optional wrapper className applied to the outer container (the element
   * that paints the rounded border + white surface).
   */
  containerClassName?: string
}

const CONTAINER_CLASSES = clx(
  // Surface
  "bg-ui-bg-base",
  // 1px border-secondary, radius xl (12px), clip inner rows to the radius
  "border border-ui-border-menu-bot rounded-xl overflow-hidden",
  // Inter — inherited, set defensively at the wrapper for visual-regression
  "font-sans",
)

const TABLE_CLASSES = clx(
  // Full width + collapsed borders so our row borders are crisp 1px lines.
  "w-full border-collapse",
  // Inter family + sensible defaults — descendant cells set size/weight.
  "font-sans",
)

const HappileeTableRoot = React.forwardRef<HTMLTableElement, HappileeTableProps>(
  ({ className, containerClassName, children, ...props }, ref) => {
    return (
      <div
        data-testid="happilee-table-container"
        className={clx(CONTAINER_CLASSES, containerClassName)}
      >
        <MedusaTable
          ref={ref}
          {...props}
          className={clx(TABLE_CLASSES, className)}
        >
          {children}
        </MedusaTable>
      </div>
    )
  },
)
HappileeTableRoot.displayName = "HappileeTable"

/* ─── Header (thead) ─────────────────────────────────────────────────── */

type MedusaHeaderProps = React.ComponentPropsWithoutRef<typeof MedusaTable.Header>

const HEADER_CLASSES = clx(
  // Header row band — bg-secondary (#fafafa) + bottom border separating from body.
  "[&_tr]:bg-ui-bg-subtle",
  "[&_tr]:border-b [&_tr]:border-ui-border-menu-bot",
  // Override Medusa's default thead hover (which also colors bg-subtle).
  "[&_tr]:hover:bg-ui-bg-subtle",
)

const HappileeTableHeader = React.forwardRef<HTMLTableSectionElement, MedusaHeaderProps>(
  ({ className, ...props }, ref) => (
    <MedusaTable.Header
      ref={ref}
      {...props}
      className={clx(HEADER_CLASSES, className)}
    />
  ),
)
HappileeTableHeader.displayName = "HappileeTable.Header"

/* ─── Body (tbody) ───────────────────────────────────────────────────── */

type MedusaBodyProps = React.ComponentPropsWithoutRef<typeof MedusaTable.Body>

const HappileeTableBody = React.forwardRef<HTMLTableSectionElement, MedusaBodyProps>(
  ({ className, ...props }, ref) => (
    <MedusaTable.Body
      ref={ref}
      {...props}
      // Medusa's Body adds a border-b; we keep it removed because the last
      // row's `last:border-b-0` is what closes the table cleanly inside the
      // rounded container.
      className={clx("border-b-0", className)}
    />
  ),
)
HappileeTableBody.displayName = "HappileeTable.Body"

/* ─── Row (tr) ───────────────────────────────────────────────────────── */

type MedusaRowProps = React.ComponentPropsWithoutRef<typeof MedusaTable.Row>

export interface HappileeTableRowProps extends MedusaRowProps {
  /**
   * Renders the row in the selected visual state (`bg-brand-light` /
   * `#edf2fe`). Wired via `data-state="selected"` so consumers can also drive
   * it from Radix / @tanstack/react-table selection APIs.
   */
  selected?: boolean
}

const ROW_BASE_CLASSES = clx(
  // Default surface — white — and a subtle bottom divider.
  "bg-ui-bg-base",
  "border-b border-ui-border-menu-bot last:border-b-0",
  // Hover — calm Happilee gray. Suppressed for selected rows below.
  "hover:bg-ui-bg-subtle",
  // Selected — brand-light fill (#edf2fe). Beats hover via `data-state`.
  "data-[state=selected]:bg-ui-bg-highlight",
  "data-[state=selected]:hover:bg-ui-bg-highlight",
  // Smooth transition between states.
  "transition-colors duration-hap-fast",
  // Override Medusa's pl-6/pr-6 first/last cell padding — Happilee uses a
  // uniform 16px horizontal padding on every cell (set per-cell below).
  "[&_td:first-child]:pl-4 [&_td:last-child]:pr-4",
  "[&_th:first-child]:pl-4 [&_th:last-child]:pr-4",
)

const HappileeTableRow = React.forwardRef<HTMLTableRowElement, HappileeTableRowProps>(
  ({ className, selected, ...props }, ref) => (
    <MedusaTable.Row
      ref={ref}
      data-state={selected ? "selected" : props["data-state"]}
      {...props}
      className={clx(ROW_BASE_CLASSES, className)}
    />
  ),
)
HappileeTableRow.displayName = "HappileeTable.Row"

/* ─── HeaderCell (th) ────────────────────────────────────────────────── */

type MedusaHeaderCellProps = React.ComponentPropsWithoutRef<typeof MedusaTable.HeaderCell>

const HEADER_CELL_CLASSES = clx(
  // Reset Medusa's h-12 / py-0 so we can apply the Happilee padding.
  "h-auto",
  // Padding y 12px x 16px (py-3 px-4) — same on every column for visual rhythm.
  "py-3 px-4",
  // Typography: 12px semibold uppercase tracking-wide, tertiary text.
  "text-xs font-semibold uppercase tracking-wide text-ui-fg-muted",
  // Left-aligned by default — consumers can override per column.
  "text-left",
)

const HappileeTableHeaderCell = React.forwardRef<HTMLTableCellElement, MedusaHeaderCellProps>(
  ({ className, ...props }, ref) => (
    <MedusaTable.HeaderCell
      ref={ref}
      {...props}
      className={clx(HEADER_CELL_CLASSES, className)}
    />
  ),
)
HappileeTableHeaderCell.displayName = "HappileeTable.HeaderCell"

/* ─── Cell (td) ──────────────────────────────────────────────────────── */

type MedusaCellProps = React.ComponentPropsWithoutRef<typeof MedusaTable.Cell>

export interface HappileeTableCellProps extends MedusaCellProps {
  /**
   * Renders the cell as a "meta" cell — secondary text color
   * (`text-tertiary` / `#535862`) for muted metadata columns like timestamps,
   * IDs, etc. Default is `text-primary` (`#181d27`).
   */
  meta?: boolean
}

const CELL_BASE_CLASSES = clx(
  // Reset Medusa's h-12 / py-0.
  "h-auto",
  // Padding y 12px x 16px.
  "py-3 px-4",
  // Typography: 14px regular weight.
  "text-sm font-normal align-middle",
)

const CELL_PRIMARY_CLASSES = "text-ui-fg-base"
const CELL_META_CLASSES = "text-ui-fg-muted"

const HappileeTableCell = React.forwardRef<HTMLTableCellElement, HappileeTableCellProps>(
  ({ className, meta = false, ...props }, ref) => (
    <MedusaTable.Cell
      ref={ref}
      {...props}
      className={clx(
        CELL_BASE_CLASSES,
        meta ? CELL_META_CLASSES : CELL_PRIMARY_CLASSES,
        className,
      )}
    />
  ),
)
HappileeTableCell.displayName = "HappileeTable.Cell"

/* ─── Empty state ────────────────────────────────────────────────────── */

export interface HappileeTableEmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Headline shown in the empty state. Defaults to "No results".
   */
  title?: string
  /**
   * Optional secondary copy below the title.
   */
  description?: string
}

/**
 * Inline "No results" panel used when the table has zero rows. This is a
 * forward-compatible stand-in for Wave 1.12's `HappileeEmptyState`; when that
 * component lands, consumers can swap to it. Keeping the local fallback here
 * means Wave 1.4 ships unblocked.
 */
const HappileeTableEmptyState = React.forwardRef<
  HTMLDivElement,
  HappileeTableEmptyStateProps
>(({ title = "No results", description, className, ...props }, ref) => (
  <div
    ref={ref}
    role="status"
    aria-live="polite"
    {...props}
    className={clx(
      // Surface matches the table body — same white card, no extra border
      // because the outer container already paints one.
      "bg-ui-bg-base",
      // Generous vertical breathing room so an empty table doesn't feel like
      // a styling bug.
      "py-12 px-4",
      "flex flex-col items-center justify-center text-center",
      "font-sans",
      className,
    )}
  >
    <p className="text-sm font-medium text-ui-fg-base">{title}</p>
    {description ? (
      <p className="mt-1 text-xs text-ui-fg-muted">{description}</p>
    ) : null}
  </div>
))
HappileeTableEmptyState.displayName = "HappileeTable.EmptyState"

/* ─── Compound export ────────────────────────────────────────────────── */

/**
 * Compound component, matching the @medusajs/ui Table API surface so it can
 * be a drop-in replacement at call sites:
 *
 *   <HappileeTable>
 *     <HappileeTable.Header>
 *       <HappileeTable.Row>
 *         <HappileeTable.HeaderCell>Name</HappileeTable.HeaderCell>
 *       </HappileeTable.Row>
 *     </HappileeTable.Header>
 *     <HappileeTable.Body>
 *       <HappileeTable.Row selected>
 *         <HappileeTable.Cell>Acme</HappileeTable.Cell>
 *       </HappileeTable.Row>
 *     </HappileeTable.Body>
 *   </HappileeTable>
 */
export const HappileeTable = Object.assign(HappileeTableRoot, {
  Header: HappileeTableHeader,
  Body: HappileeTableBody,
  Row: HappileeTableRow,
  HeaderCell: HappileeTableHeaderCell,
  Cell: HappileeTableCell,
  EmptyState: HappileeTableEmptyState,
})

export type {
  MedusaHeaderProps as HappileeTableHeaderProps,
  MedusaBodyProps as HappileeTableBodyProps,
  MedusaHeaderCellProps as HappileeTableHeaderCellProps,
}
