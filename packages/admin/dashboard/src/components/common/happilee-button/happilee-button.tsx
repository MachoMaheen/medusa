/**
 * Happilee Button — Wave 1.1
 *
 * A thin wrapper around `@medusajs/ui`'s Button that forces the Happilee v3
 * visual treatment (brand-solid filled primary, outlined secondary). The
 * underlying Medusa Button keeps its semantics (forwardRef, asChild, loading,
 * disabled, focus management) — we override only the visual classes via
 * `className`, which is applied AFTER Medusa's `cva` classes thanks to clx /
 * Tailwind's "last class wins" rule for utilities on the same property.
 *
 * Design contract (from ~/.claude/skills/happilee-v3-design-system/):
 *   - Primary:   bg brand-solid (#4d68dc) / white text / xs-skeuomorphic shadow
 *   - Secondary: white bg / border-primary (#d5d7da) / text-secondary
 *                (#414651) text / xs shadow
 *   - Radius:   rounded-md (8px) for all sizes
 *   - Font:     Inter via font-sans (set globally in tailwind.config.cjs)
 *   - Weight:   font-medium (500) for button text
 *
 * Tokens come from packages/admin/dashboard/tailwind.config.cjs — NO raw hex
 * literals appear in this file.
 */

import { Button as MedusaButton, clx } from "@medusajs/ui"
import * as React from "react"

type HappileeButtonVariant = "primary" | "secondary"
type HappileeButtonSize = "sm" | "md"

interface HappileeButtonProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof MedusaButton>,
    "variant" | "size"
  > {
  variant?: HappileeButtonVariant
  size?: HappileeButtonSize
}

const VARIANT_CLASSES: Record<HappileeButtonVariant, string> = {
  // Primary — filled brand-solid with skeuomorphic inset shadow for the
  // "pressable" Happilee feel. Hover deepens to brand-secondary-text.
  primary: clx(
    "bg-brand-solid text-white border border-transparent",
    "shadow-hap-xs-skeuomorphic",
    "hover:bg-brand-secondary-text",
    "active:bg-brand-secondary-text",
    "disabled:bg-brand-primary-icon disabled:text-white disabled:cursor-not-allowed",
    "after:!hidden"
  ),
  // Secondary — outlined white surface, secondary text, subtle xs shadow.
  // Uses Medusa preset's ui-* token classes (whose CSS vars are overridden
  // to Happilee values in src/styles/happilee-tokens.css) so the visual
  // contract matches the other 11 Wave 1 primitives without parallel naming.
  secondary: clx(
    "bg-ui-bg-base text-brand-secondary-text border border-ui-border-base",
    "shadow-hap-xs",
    "hover:bg-ui-bg-subtle",
    "active:bg-ui-bg-subtle",
    "disabled:bg-ui-bg-subtle disabled:text-ui-fg-muted disabled:cursor-not-allowed",
    "after:!hidden"
  ),
}

// Sizes from the Happilee scale: sm = 32px tall, md = 40px tall.
// Padding/gap stay on the standard Tailwind spacing scale (2/3/4 = 8/12/16px).
const SIZE_CLASSES: Record<HappileeButtonSize, string> = {
  sm: "h-8 px-3 gap-x-2 text-sm",
  md: "h-10 px-4 gap-x-2 text-sm",
}

const BASE_CLASSES = clx(
  "inline-flex items-center justify-center",
  "font-sans font-medium",
  "rounded-md",
  "transition-colors duration-hap-fast",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-solid/30",
  "disabled:shadow-none"
)

/**
 * HappileeButton — re-skinned Medusa Button.
 *
 * Forwards refs so it composes correctly with Radix / Tooltip / form libs.
 * Accepts all underlying Medusa Button props (asChild, isLoading, etc.).
 */
export const HappileeButton = React.forwardRef<
  HTMLButtonElement,
  HappileeButtonProps
>(({ variant = "primary", size = "md", className, ...props }, ref) => {
  return (
    <MedusaButton
      ref={ref}
      // Map the wrapper's "primary"/"secondary" semantics to Medusa's nearest
      // primitive so isLoading/disabled visuals still behave; our className
      // overrides take precedence on the surface styles.
      variant={variant === "primary" ? "primary" : "secondary"}
      size={size === "sm" ? "small" : "base"}
      {...props}
      className={clx(
        BASE_CLASSES,
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className
      )}
    />
  )
})

HappileeButton.displayName = "HappileeButton"

export type { HappileeButtonProps, HappileeButtonVariant, HappileeButtonSize }
