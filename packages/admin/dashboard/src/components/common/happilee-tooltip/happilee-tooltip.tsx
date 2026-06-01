/**
 * HappileeTooltip — Wave 1.10
 *
 * Wraps @medusajs/ui's `Tooltip` (Radix Tooltip under the hood) and forces the
 * Happilee v3 visual treatment. The semantics — open/defaultOpen/onOpenChange,
 * delayDuration, side/sideOffset, portal mounting, asChild trigger — are
 * inherited from the underlying primitive; only the surface styling changes.
 *
 * Used most prominently by the SideNav rail in rail-only mode (< 1024px),
 * where each 48×48 icon button shows a tooltip on hover with the section
 * label. See `references/sidebar.md` in the design-system skill.
 *
 * Design contract (from ~/.claude/skills/happilee-v3-design-system/):
 *   - surface          bg-text-primary  (#181d27 — dark for contrast on the
 *                      light Happilee shell)
 *   - text             white, text-xs (12px), font-medium (500)
 *   - padding          px-2.5 py-1.5    (10px × 6px)
 *   - radius           rounded-md       (8px)
 *   - shadow           shadow-hap-md
 *   - max-width        240px
 *   - arrow            small triangle filled with bg-text-primary
 *   - motion           fade + slide-from-side, 200ms (duration-hap-normal)
 *
 * No raw hex appears below — every value routes through tokens that Wave 0
 * pinned to the Happilee v3 palette.
 */

import { Tooltip as MedusaTooltip, clx } from "@medusajs/ui"
import { Tooltip as RadixTooltip } from "radix-ui"
import * as React from "react"

type MedusaTooltipProps = React.ComponentPropsWithoutRef<typeof MedusaTooltip>

type TooltipSide = "top" | "right" | "bottom" | "left"

export interface HappileeTooltipProps
  extends Omit<MedusaTooltipProps, "side" | "maxWidth"> {
  /**
   * Tooltip body — rendered inside the dark surface.
   */
  content: React.ReactNode
  /**
   * Which side of the trigger to anchor the tooltip on.
   *
   * @defaultValue "top"
   */
  side?: TooltipSide
  /**
   * Max width of the tooltip surface in pixels. Defaults to 240, matching the
   * Happilee v3 spec.
   *
   * @defaultValue 240
   */
  maxWidth?: number
}

/**
 * Tailwind classes for the dark Happilee tooltip surface. Kept as a module-
 * level constant so test selectors / visual regressions can rely on a single
 * source of truth for class composition.
 */
const HAPPILEE_TOOLTIP_CLASSES = clx(
  // Surface
  "bg-text-primary text-white",
  // Typography (Inter inherited from app shell)
  "font-sans text-xs font-medium leading-tight",
  // Spacing & geometry
  "px-2.5 py-1.5 rounded-md",
  // Elevation
  "shadow-hap-md",
  // Motion: fade + slight slide from the opposite of `side`, 200ms.
  // Radix sets `data-side` on the content element so we can target it.
  "duration-hap-normal",
  "animate-in fade-in-0 zoom-in-95",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
  "data-[side=bottom]:slide-in-from-top-1",
  "data-[side=top]:slide-in-from-bottom-1",
  "data-[side=left]:slide-in-from-right-1",
  "data-[side=right]:slide-in-from-left-1",
)

/**
 * HappileeTooltip — re-skinned Medusa Tooltip.
 *
 * The Medusa Tooltip composes Radix internally and exposes `className`, which
 * is forwarded to the Radix `Tooltip.Content` element. We append our Happilee
 * classes there. We also render a Radix `Tooltip.Arrow` directly so the arrow
 * inherits the dark surface color — Medusa's wrapper does not render one.
 *
 * Because Medusa's Tooltip already mounts a `RadixTooltip.Root` + `Trigger` +
 * `Portal` + `Content`, we add the arrow via the Radix slot named `Arrow`
 * that the Medusa Content forwards under the hood. If a future Medusa version
 * drops Radix arrow forwarding we'll have to inline the Root ourselves; for
 * now this is the lightest-touch path that survives Medusa upgrades.
 */
export const HappileeTooltip = ({
  content,
  side = "top",
  maxWidth = 240,
  className,
  children,
  ...props
}: HappileeTooltipProps) => {
  // Compose the rendered content: the caller's body + a Radix arrow. The arrow
  // is positioned by Radix and inherits `fill` from the surface color so we
  // explicitly set it to text-primary via `fill-text-primary` Tailwind class.
  const renderedContent = (
    <>
      {content}
      <RadixTooltip.Arrow
        width={10}
        height={5}
        className="fill-text-primary"
        aria-hidden="true"
      />
    </>
  )

  return (
    <MedusaTooltip
      content={renderedContent}
      side={side}
      maxWidth={maxWidth}
      className={clx(HAPPILEE_TOOLTIP_CLASSES, className)}
      // Add a stable hook for the Playwright spec to assert against without
      // depending on Radix internals.
      data-happilee-tooltip="true"
      {...props}
    >
      {children}
    </MedusaTooltip>
  )
}

HappileeTooltip.displayName = "HappileeTooltip"

export type { TooltipSide }
