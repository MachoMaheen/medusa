/**
 * HappileeEmptyState — Wave 1.12
 *
 * The "Create new automation"-style entry tile from the Happilee v3 admin: an
 * empty-state card that lives inside a grid of regular cards, signalling the
 * primary "add a new thing" action without breaking the grid's visual rhythm.
 *
 * Specs come from references/components.md → "Empty state card" in the
 * happilee-v3-design-system skill:
 *
 *   border    1px DASHED border-primary (#d5d7da)  → border border-dashed border-ui-border-base
 *   bg        bg-secondary (#fafafa)               → bg-ui-bg-subtle  (NOT white — must
 *                                                    contrast with regular cards)
 *   radius    xl (12px)                            → rounded-xl
 *   layout    center contents, flex column, gap-md → flex flex-col items-center
 *                                                    justify-center gap-2
 *
 * Contents (composable via props):
 *   1. Icon (default = Plus, 24x24) inside a 32x32 white circle with a 1px
 *      border-primary outline.
 *   2. Title (text-md / 16px font-semibold, text-ui-fg-base).
 *   3. Description (text-sm / 14px, text-ui-fg-muted = #717680).
 *   4. Optional onClick — when supplied, the entire card becomes a button
 *      (cursor-pointer, hover deepens fill via bg-ui-bg-subtle-hover).
 *
 * Token discipline: every color resolves through Medusa's @medusajs/ui-preset
 * (overridden in src/styles/happilee-tokens.css to the Happilee v3 palette).
 * NO raw hex literals in this file.
 */

import * as React from "react"
import { clx } from "@medusajs/ui"
import { Plus } from "@medusajs/icons"

/**
 * Loose icon type — `@medusajs/icons` exports are React components that accept
 * standard SVG props plus an optional `color` prop. We intentionally do NOT
 * import the package's IconProps type to avoid a hard coupling that breaks if
 * the upstream type shape changes.
 */
type IconComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { color?: string }
>

export interface HappileeEmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick" | "title"> {
  /** Icon shown inside the 32x32 circle. Defaults to the Plus icon. */
  icon?: IconComponent
  /** Title text (16px / font-semibold). */
  title: string
  /** Subtitle / description text (14px / text-ui-fg-muted). */
  description: string
  /**
   * Optional click handler. When provided the whole card becomes interactive
   * (cursor-pointer, hover state, role=button, keyboard activation).
   */
  onClick?: () => void
}

const CARD_BASE = clx(
  // Surface
  "flex flex-col items-center justify-center",
  "gap-2", // 8px = Happilee spacing md
  "p-6",
  "rounded-xl",
  "border border-dashed border-ui-border-base",
  "bg-ui-bg-subtle",
  // Type — Inter is the only family (font-sans is mapped to Inter in
  // tailwind.config.cjs).
  "font-sans text-center",
  // Smooth hover transition for the interactive variant
  "transition-colors duration-hap-fast"
)

const CARD_INTERACTIVE = clx(
  "cursor-pointer",
  "hover:bg-ui-bg-subtle-hover",
  "focus-visible:outline-none",
  "focus-visible:ring-2 focus-visible:ring-brand-solid/30"
)

const ICON_CIRCLE = clx(
  "flex h-8 w-8 items-center justify-center",
  "rounded-full",
  "bg-ui-bg-base", // white card surface for the circle
  "border border-ui-border-base"
)

export const HappileeEmptyState = React.forwardRef<
  HTMLDivElement,
  HappileeEmptyStateProps
>(
  (
    {
      icon: Icon = Plus,
      title,
      description,
      onClick,
      className,
      ...rest
    },
    ref
  ) => {
    const interactive = typeof onClick === "function"

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        onClick?.()
      }
    }

    return (
      <div
        ref={ref}
        data-happilee-empty-state=""
        data-interactive={interactive ? "true" : "false"}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? onClick : undefined}
        onKeyDown={interactive ? handleKeyDown : undefined}
        className={clx(CARD_BASE, interactive && CARD_INTERACTIVE, className)}
        {...rest}
      >
        <span data-happilee-empty-state-icon="" className={ICON_CIRCLE}>
          <Icon width={24} height={24} />
        </span>
        <span
          data-happilee-empty-state-title=""
          className="text-base font-semibold text-ui-fg-base"
        >
          {title}
        </span>
        <span
          data-happilee-empty-state-description=""
          className="text-sm text-ui-fg-muted"
        >
          {description}
        </span>
      </div>
    )
  }
)

HappileeEmptyState.displayName = "HappileeEmptyState"
