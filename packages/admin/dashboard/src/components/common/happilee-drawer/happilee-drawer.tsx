/**
 * HappileeDrawer — Wave 1.6
 *
 * A thin re-skin of `@medusajs/ui`'s Drawer (Radix Dialog under the hood) that
 * pins it to the Happilee v3 modal/drawer specs from
 * `~/.claude/skills/happilee-v3-design-system/references/components.md`.
 *
 * Spec (all values resolve through Medusa CSS vars overridden in
 * `packages/admin/dashboard/src/styles/happilee-tokens.css`, plus Happilee
 * extensions from `tailwind.config.cjs`):
 *
 *   backdrop      bg-black/30 + backdrop-blur-hap-md (16px)
 *   panel surface bg-ui-bg-base (→ Happilee bg-primary / #ffffff)
 *   panel shadow  shadow-hap-lg
 *   panel slide   from right by default (left side optional)
 *   panel width   480px default ("md"), 560px when size="lg"
 *   panel padding 0 — child Title/Body/Footer own their own padding
 *   header        bg-ui-bg-base, border-b border-ui-border-menu-bot
 *                 (→ Happilee border-secondary / #e9eaeb),
 *                 padding 16px 24px (py-4 px-6),
 *                 title text-lg font-semibold text-ui-fg-base,
 *                 close 24×24 ghost (Medusa transparent IconButton),
 *   body          flex-1 overflow-y-auto, padding 24px (p-6)
 *   footer        border-t border-ui-border-menu-bot,
 *                 padding 16px 24px, gap-2 (= sm / 8px), justify-end
 *   animation     200ms ease-out (duration-hap-normal) slide + fade
 *
 * NO raw hex literals — every color routes through a Happilee-overridden token.
 *
 * API:
 *   <HappileeDrawer open onOpenChange side="right|left" size="md|lg">
 *     <HappileeDrawer.Title>...</HappileeDrawer.Title>
 *     <HappileeDrawer.Body>...</HappileeDrawer.Body>
 *     <HappileeDrawer.Footer>...</HappileeDrawer.Footer>
 *   </HappileeDrawer>
 */

import { XMark } from "@medusajs/icons"
import {
  Drawer as MedusaDrawer,
  IconButton,
  clx,
} from "@medusajs/ui"
import * as React from "react"

type HappileeDrawerSide = "right" | "left"
type HappileeDrawerSize = "md" | "lg"

export interface HappileeDrawerProps {
  /** Controlled open state. */
  open?: boolean
  /** Controlled open-change handler — wired to Radix Dialog onOpenChange. */
  onOpenChange?: (open: boolean) => void
  /** Slide-in side. Defaults to "right" (the Happilee v3 default). */
  side?: HappileeDrawerSide
  /** Panel width preset: "md" = 480px, "lg" = 560px. */
  size?: HappileeDrawerSize
  /** Drawer children — typically Title / Body / Footer. */
  children?: React.ReactNode
  /** Optional className applied to the panel surface for one-off overrides. */
  className?: string
}

const SIZE_WIDTH: Record<HappileeDrawerSize, string> = {
  // 480px / 560px — both on the Happilee modal width scale.
  md: "sm:max-w-[480px]",
  lg: "sm:max-w-[560px]",
}

const SIDE_POSITION: Record<HappileeDrawerSide, string> = {
  // sm:right-2 / sm:left-2 — mirror Medusa's default 8px gutter.
  right: "sm:right-2 sm:left-auto",
  left: "sm:left-2 sm:right-auto",
}

const SIDE_ANIMATION: Record<HappileeDrawerSide, string> = {
  // Slide in from the chosen edge; Tailwind's tailwindcss-animate utilities
  // are provided by Medusa's ui-preset.
  right:
    "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
  left:
    "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
}

interface HappileeDrawerTitleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Trailing slot for the header (right of the title, left of the close button).
   * Use for inline actions like a kbd hint or status badge.
   */
  trailing?: React.ReactNode
}

/**
 * Header row. Renders the accessible Drawer.Title, padding 16px 24px, with a
 * 24×24 ghost close button on the right wired to Radix's Dialog.Close.
 */
const HappileeDrawerTitle = React.forwardRef<
  HTMLDivElement,
  HappileeDrawerTitleProps
>(({ className, children, trailing, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={clx(
        "flex items-center justify-between gap-x-3",
        "bg-ui-bg-base border-b border-ui-border-menu-bot",
        "px-6 py-4",
        className,
      )}
      {...rest}
    >
      <MedusaDrawer.Title asChild>
        <h2 className="text-lg font-semibold text-ui-fg-base leading-7">
          {children}
        </h2>
      </MedusaDrawer.Title>
      <div className="flex items-center gap-x-2">
        {trailing}
        <MedusaDrawer.Close asChild>
          <IconButton
            type="button"
            size="small"
            variant="transparent"
            aria-label="Close drawer"
            className="h-6 w-6"
          >
            <XMark />
          </IconButton>
        </MedusaDrawer.Close>
      </div>
    </div>
  )
})
HappileeDrawerTitle.displayName = "HappileeDrawer.Title"

interface HappileeDrawerBodyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Scrollable body. Padding 24px (Happilee spacing 3xl), grows to fill the
 * panel between Title and Footer.
 */
const HappileeDrawerBody = React.forwardRef<
  HTMLDivElement,
  HappileeDrawerBodyProps
>(({ className, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={clx("flex-1 overflow-y-auto p-6", className)}
      {...rest}
    />
  )
})
HappileeDrawerBody.displayName = "HappileeDrawer.Body"

interface HappileeDrawerFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Footer row. Border-t border-secondary, padding 16px 24px, gap 8px (sm),
 * right-aligned action stack.
 */
const HappileeDrawerFooter = React.forwardRef<
  HTMLDivElement,
  HappileeDrawerFooterProps
>(({ className, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={clx(
        "flex items-center justify-end gap-x-2",
        "border-t border-ui-border-menu-bot",
        "px-6 py-4",
        className,
      )}
      {...rest}
    />
  )
})
HappileeDrawerFooter.displayName = "HappileeDrawer.Footer"

const PANEL_BASE = clx(
  // Layout — full-height column flex so Body can scroll while Title/Footer pin.
  "fixed inset-y-2 z-50 flex w-full flex-1 flex-col",
  // Small screens: stretch with a uniform 8px gutter.
  "max-sm:inset-x-2 max-sm:w-[calc(100%-16px)]",
  // Surface — Happilee bg-primary (#ffffff) via Medusa CSS var override.
  "bg-ui-bg-base",
  // Radius xl (12px) — matches Happilee modal/drawer radius.
  "rounded-xl",
  // Shadow lg per Happilee popover/drawer spec.
  "shadow-hap-lg",
  // No internal padding on the panel itself — children own padding.
  "p-0",
  // Remove focus ring artifact; Radix manages focus trap.
  "outline-none",
  // Animation: 200ms ease-out fade + slide.
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "duration-hap-normal ease-out",
)

const OVERLAY_CLASSES = clx(
  // Backdrop: pure black at 30% opacity + 16px blur per Happilee spec.
  "fixed inset-0 z-50 bg-black/30 backdrop-blur-hap-md",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "duration-hap-normal ease-out",
)

/**
 * HappileeDrawer — Happilee v3-skinned drawer panel.
 *
 * Composes Medusa's Drawer (Radix Dialog) with the Happilee panel/overlay
 * classes. Children compose via the static sub-components.
 */
const HappileeDrawerRoot = ({
  open,
  onOpenChange,
  side = "right",
  size = "md",
  children,
  className,
}: HappileeDrawerProps) => {
  return (
    <MedusaDrawer open={open} onOpenChange={onOpenChange}>
      <MedusaDrawer.Content
        className={clx(
          PANEL_BASE,
          SIZE_WIDTH[size],
          SIDE_POSITION[side],
          SIDE_ANIMATION[side],
          className,
        )}
        overlayProps={{ className: OVERLAY_CLASSES }}
        data-happilee-drawer=""
        data-side={side}
        data-size={size}
      >
        {children}
      </MedusaDrawer.Content>
    </MedusaDrawer>
  )
}
HappileeDrawerRoot.displayName = "HappileeDrawer"

export const HappileeDrawer = Object.assign(HappileeDrawerRoot, {
  Title: HappileeDrawerTitle,
  Body: HappileeDrawerBody,
  Footer: HappileeDrawerFooter,
})

export type {
  HappileeDrawerSide,
  HappileeDrawerSize,
  HappileeDrawerTitleProps,
  HappileeDrawerBodyProps,
  HappileeDrawerFooterProps,
}
