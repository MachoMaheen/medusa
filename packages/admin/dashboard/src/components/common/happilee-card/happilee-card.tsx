/**
 * HappileeCard — Wave 1.11
 *
 * The defining surface of Happilee v3. Implements the "automation card" pattern
 * from references/components.md in the happilee-v3-design-system skill:
 *
 *   bg            bg-primary (white)              -> bg-ui-bg-base
 *   border        1px border-secondary            -> border-ui-border-menu-bot
 *   radius        xl (12px)                       -> rounded-xl
 *   padding       lg (12px)                       -> p-3
 *   shadow        xs                              -> shadow-hap-xs
 *   gap           md (8px) between vert. sections -> gap-2
 *   min-height    ~140px                          -> min-h-[140px]
 *   hover         shadow-sm + cursor-pointer       -> hover:shadow-hap-sm
 *                 transition box-shadow 200ms     -> duration-hap-normal
 *
 * Compose-friendly: <HappileeCard> opens the frame, sub-components fill the
 * canonical three vertical sections (top action row -> title/stat -> footer).
 * Token discipline: every value resolves to a Tailwind utility class declared
 * in tailwind.config.cjs or the @medusajs/ui-preset. NO raw hex literals.
 */

import * as React from "react"
import { clx } from "@medusajs/ui"

// ─── Root frame ──────────────────────────────────────────────────────────────

export interface HappileeCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * When true the card opts into the interactive pattern: pointer cursor +
   * elevated shadow on hover. Defaults to false so plain content cards stay
   * static. The shadow transition (`duration-hap-normal` = 200ms) is always
   * armed so toggling `interactive` via state still animates smoothly.
   */
  interactive?: boolean
  /**
   * Accepts a custom HTML tag for the root frame (e.g. `"article"` for an
   * entity card, `"button"` for a fully clickable tile). Defaults to `"div"`.
   */
  as?: "div" | "article" | "section" | "button"
}

const FRAME_BASE = clx(
  // Surface
  "bg-ui-bg-base border border-ui-border-menu-bot",
  "rounded-xl",
  "p-3",
  "shadow-hap-xs",
  // Layout — vertical stack with 8px gaps between sections
  "flex flex-col gap-2",
  "min-h-[140px]",
  // Typography — Inter via font-sans (the family is also set on the root in
  // tailwind.config.cjs, but we restate it locally so the card is robust when
  // rendered inside a context that resets font-family).
  "font-sans",
  // Animation — armed even on non-interactive cards so consumers can toggle
  // `interactive` via prop / state and still get a smooth transition.
  "transition-[box-shadow] duration-hap-normal"
)

const FRAME_INTERACTIVE = clx(
  "cursor-pointer hover:shadow-hap-sm",
  // Focus-visible ring for keyboard users when the card itself is focusable.
  "focus-visible:outline-none focus-visible:shadow-hap-sm",
  "focus-visible:ring-2 focus-visible:ring-brand-solid/30"
)

export const HappileeCard = React.forwardRef<HTMLDivElement, HappileeCardProps>(
  (
    { interactive = false, as: Tag = "div", className, children, ...rest },
    ref
  ) => {
    // Cast required because the union of allowed tags has heterogeneous prop
    // types; consumers opting into "button" pass button-shaped handlers.
    const Component = Tag as React.ElementType
    return (
      <Component
        ref={ref}
        data-happilee-card=""
        data-interactive={interactive ? "true" : "false"}
        className={clx(
          FRAME_BASE,
          interactive && FRAME_INTERACTIVE,
          className
        )}
        {...rest}
      >
        {children}
      </Component>
    )
  }
)
HappileeCard.displayName = "HappileeCard"

// ─── Header (top row: badge slot + actions slot) ─────────────────────────────

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Left-aligned slot — typically a HappileeBadge. */
  badge?: React.ReactNode
  /** Right-aligned slot — typically icon buttons (pause/play, more-actions). */
  actions?: React.ReactNode
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ badge, actions, className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        data-happilee-card-header=""
        className={clx(
          "flex items-center justify-between gap-2",
          className
        )}
        {...rest}
      >
        <div className="flex min-w-0 items-center gap-2">{badge}</div>
        <div className="flex items-center gap-1">{actions}</div>
        {/* `children` is intentionally placed AFTER the slots so consumers can
            inject extra inline content without breaking the badge/actions
            layout when both slots are present. */}
        {children}
      </div>
    )
  }
)
CardHeader.displayName = "HappileeCard.Header"

// ─── Title (16/24 semibold, text-primary) ────────────────────────────────────

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  /** Heading level — defaults to h3 (card titles live below page h1/h2). */
  level?: 2 | 3 | 4 | 5 | 6
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ level = 3, className, children, ...rest }, ref) => {
    const Heading = (`h${level}` as unknown) as React.ElementType
    return (
      <Heading
        ref={ref}
        data-happilee-card-title=""
        className={clx(
          // text-md per the skill = 16/24 → Tailwind text-base
          "text-base font-semibold leading-6 text-ui-fg-base",
          "truncate",
          className
        )}
        {...rest}
      >
        {children}
      </Heading>
    )
  }
)
CardTitle.displayName = "HappileeCard.Title"

// ─── Meta (text-sm tertiary — stat line / "Runs: 15") ────────────────────────

export type CardMetaProps = React.HTMLAttributes<HTMLParagraphElement>

export const CardMeta = React.forwardRef<HTMLParagraphElement, CardMetaProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <p
        ref={ref}
        data-happilee-card-meta=""
        className={clx(
          // text-sm = 14/20; text-ui-fg-muted maps to the Happilee "muted" tone
          // closest to text-tertiary on the cards we ported. The exact
          // text-tertiary value lives in the design system as a future token
          // addition (see references/tokens.md) — using fg-muted keeps this
          // file token-clean.
          "text-sm leading-5 text-ui-fg-muted",
          className
        )}
        {...rest}
      >
        {children}
      </p>
    )
  }
)
CardMeta.displayName = "HappileeCard.Meta"

// ─── Footer (bottom row: meta left + tag pill right) ─────────────────────────

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Left-aligned meta text (e.g. "Last edited: 01/06/2026"). */
  meta?: React.ReactNode
  /** Right-aligned tag / category pill (e.g. "All contacts"). */
  tag?: React.ReactNode
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ meta, tag, className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        data-happilee-card-footer=""
        className={clx(
          // `mt-auto` pins the footer to the bottom of the card frame so the
          // 140px min-height isn't visually broken when the body is short.
          "mt-auto flex items-center justify-between gap-2",
          "text-xs leading-4 text-ui-fg-muted",
          className
        )}
        {...rest}
      >
        <div className="min-w-0 truncate">{meta}</div>
        <div className="flex shrink-0 items-center gap-1">{tag}</div>
        {children}
      </div>
    )
  }
)
CardFooter.displayName = "HappileeCard.Footer"

// ─── Actions (small icon-button row, used inside CardHeader.actions) ─────────

export type CardActionsProps = React.HTMLAttributes<HTMLDivElement>

export const CardActions = React.forwardRef<HTMLDivElement, CardActionsProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        data-happilee-card-actions=""
        className={clx("flex items-center gap-1", className)}
        {...rest}
      >
        {children}
      </div>
    )
  }
)
CardActions.displayName = "HappileeCard.Actions"

// ─── Re-exports as a compound for ergonomic consumer code ───────────────────

type HappileeCardCompound = typeof HappileeCard & {
  Header: typeof CardHeader
  Title: typeof CardTitle
  Meta: typeof CardMeta
  Footer: typeof CardFooter
  Actions: typeof CardActions
}

const CompoundCard = HappileeCard as HappileeCardCompound
CompoundCard.Header = CardHeader
CompoundCard.Title = CardTitle
CompoundCard.Meta = CardMeta
CompoundCard.Footer = CardFooter
CompoundCard.Actions = CardActions

export default CompoundCard
