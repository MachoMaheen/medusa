/**
 * HappileeBadge — Happilee v3 status / category pill.
 *
 * A thin wrapper that renders a 24px-tall, rounded-full pill in one of four
 * variants. Three status variants (`active` / `draft` / `paused`) carry a 1px
 * border and use the `hap-status-*` Tailwind tokens. The `brand` variant is the
 * "All contacts"-style category pill — brand-light fill, brand-secondary-text,
 * NO border.
 *
 * Specs come from references/components.md in the happilee-v3-design-system
 * skill. All colors are sourced from tailwind.config.cjs (`hap-status-*` and
 * `brand-*` extensions). NO raw hex values in this file.
 *
 *   height       24px (h-6)
 *   padding      2px 8px (py-0.5 px-2)
 *   radius       full
 *   font         text-xs font-medium  (12px / weight 500)
 *   border       1px solid (status variants only)
 */

import * as React from "react"
import { clx } from "@medusajs/ui"

export type HappileeBadgeVariant = "active" | "draft" | "paused" | "brand"

export interface HappileeBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Visual variant — three status pills + one brand category pill. */
  variant?: HappileeBadgeVariant
}

const VARIANT_CLASSES: Record<HappileeBadgeVariant, string> = {
  active:
    "bg-hap-status-active-bg text-hap-status-active-text border border-hap-status-active-border",
  draft:
    "bg-hap-status-draft-bg text-hap-status-draft-text border border-hap-status-draft-border",
  paused:
    "bg-hap-status-paused-bg text-hap-status-paused-text border border-hap-status-paused-border",
  brand: "bg-brand-light text-brand-secondary-text",
}

const BASE_CLASSES =
  "inline-flex items-center justify-center h-6 px-2 py-0.5 rounded-full text-xs font-medium leading-none whitespace-nowrap"

export const HappileeBadge = React.forwardRef<
  HTMLSpanElement,
  HappileeBadgeProps
>(({ variant = "draft", className, children, ...rest }, ref) => {
  return (
    <span
      ref={ref}
      data-happilee-badge=""
      data-variant={variant}
      className={clx(BASE_CLASSES, VARIANT_CLASSES[variant], className)}
      {...rest}
    >
      {children}
    </span>
  )
})
HappileeBadge.displayName = "HappileeBadge"
