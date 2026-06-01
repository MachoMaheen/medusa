/**
 * Happilee Tabs — Wave 1.9
 *
 * A horizontal tab list re-skinned to match the Happilee v3 design language.
 * Wraps Radix Tabs primitives directly (`radix-ui` is already a transitive
 * dependency of @medusajs/ui) so we keep accessibility + keyboard navigation
 * for free while imposing the Happilee visual contract.
 *
 * The defining Happilee tab signature is the "lift off" effect: the active
 * tab is a white pill that sits on top of a #fafafa container with the
 * shadow-hap-xs token. Inactive tabs are transparent and only become
 * visible on hover via the alpha-black-05 wash.
 *
 * Design contract (from ~/.claude/skills/happilee-v3-design-system/
 * references/components.md → "Tab list (horizontal)"):
 *
 *   container:   bg bg-secondary (#fafafa), radius md (8px), padding 4px,
 *                gap 4px between triggers
 *   tab default: bg transparent, text text-secondary (#414651),
 *                padding 6px 14px, radius sm (6px)
 *   tab active:  bg bg-primary (#ffffff), text text-primary (#181d27),
 *                font-medium, shadow-hap-xs  ← the lift-off
 *   tab hover:   bg alpha-black-05 (rgba(0,0,0,0.05))
 *
 * Tokens come from Medusa's @medusajs/ui-preset (overridden by
 * src/styles/happilee-tokens.css) and tailwind.config.cjs. NO raw hex
 * literals appear in this file — every value traces back to a token.
 *
 * API mirrors @medusajs/ui Tabs for a smooth swap:
 *   <HappileeTabs defaultValue="overview">
 *     <HappileeTabs.List>
 *       <HappileeTabs.Trigger value="overview">Overview</HappileeTabs.Trigger>
 *       <HappileeTabs.Trigger value="settings">Settings</HappileeTabs.Trigger>
 *     </HappileeTabs.List>
 *     <HappileeTabs.Content value="overview">...</HappileeTabs.Content>
 *     <HappileeTabs.Content value="settings">...</HappileeTabs.Content>
 *   </HappileeTabs>
 */

"use client"

import { clx } from "@medusajs/ui"
import { Tabs as RadixTabs } from "radix-ui"
import * as React from "react"

// ── Root ─────────────────────────────────────────────────────────────────────
type HappileeTabsRootProps = React.ComponentPropsWithoutRef<
  typeof RadixTabs.Root
>

const HappileeTabsRoot = React.forwardRef<
  React.ElementRef<typeof RadixTabs.Root>,
  HappileeTabsRootProps
>(({ className, ...props }, ref) => (
  <RadixTabs.Root
    ref={ref}
    className={clx("font-sans", className)}
    {...props}
  />
))
HappileeTabsRoot.displayName = "HappileeTabs"

// ── List (container — bg-ui-bg-subtle, rounded-md, p-1, gap-1) ──────────────
const LIST_CLASSES = clx(
  // Container surface — Happilee bg-secondary token via Medusa --bg-subtle
  // override. inline-flex so the pill hugs its triggers; w-fit prevents it
  // from stretching across the parent.
  "inline-flex w-fit items-center",
  "bg-ui-bg-subtle",
  // Geometry from components.md: radius md = 8px, padding 4px, gap 4px.
  "rounded-md p-1 gap-1",
  // Keep the container itself flat — the lift-off comes from the active
  // trigger's shadow-hap-xs, not from the list wrapper.
  "border border-transparent"
)

type HappileeTabsListProps = React.ComponentPropsWithoutRef<
  typeof RadixTabs.List
>

const HappileeTabsList = React.forwardRef<
  React.ElementRef<typeof RadixTabs.List>,
  HappileeTabsListProps
>(({ className, ...props }, ref) => (
  <RadixTabs.List
    ref={ref}
    className={clx(LIST_CLASSES, className)}
    {...props}
  />
))
HappileeTabsList.displayName = "HappileeTabs.List"

// ── Trigger (inactive transparent / active white pill with shadow-hap-xs) ────
const TRIGGER_BASE = clx(
  // Typography — Inter via font-sans, 14px (text-sm), text-secondary by default
  "font-sans text-sm leading-5",
  "text-ui-fg-subtle",
  // Geometry — 6px vertical / 14px horizontal padding, radius sm (6px).
  // h-7 = 28px which leaves room for the 6px padding to surround a 14px
  // line-height label; px-[14px] would be a raw value, so we use px-3.5 (14px)
  // from Tailwind's standard scale.
  "rounded-sm px-3.5 py-1.5",
  "inline-flex items-center justify-center whitespace-nowrap",
  // Smooth state transitions for the lift-off effect.
  "transition-all duration-hap-fast",
  // Accessibility — visible focus ring using the brand-solid token.
  "outline-none focus-visible:ring-2 focus-visible:ring-ui-bg-interactive/30",
  // Inactive hover — alpha-black-05 wash. The bg-black/5 utility resolves to
  // rgba(0,0,0,0.05) which IS the alpha-black-05 token by definition. Skip
  // hover on the active state so the white pill doesn't darken.
  "hover:bg-black/5",
  "data-[state=active]:hover:bg-ui-bg-base",
  // Active "lift off" — white pill, primary text, medium weight, hap-xs shadow.
  // This is THE Happilee tab signature.
  "data-[state=active]:bg-ui-bg-base",
  "data-[state=active]:text-ui-fg-base",
  "data-[state=active]:font-medium",
  "data-[state=active]:shadow-hap-xs",
  // Disabled — keep ghost styling but block interaction.
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type HappileeTabsTriggerProps = React.ComponentPropsWithoutRef<
  typeof RadixTabs.Trigger
>

const HappileeTabsTrigger = React.forwardRef<
  React.ElementRef<typeof RadixTabs.Trigger>,
  HappileeTabsTriggerProps
>(({ className, ...props }, ref) => (
  <RadixTabs.Trigger
    ref={ref}
    className={clx(TRIGGER_BASE, className)}
    {...props}
  />
))
HappileeTabsTrigger.displayName = "HappileeTabs.Trigger"

// ── Content ──────────────────────────────────────────────────────────────────
type HappileeTabsContentProps = React.ComponentPropsWithoutRef<
  typeof RadixTabs.Content
>

const HappileeTabsContent = React.forwardRef<
  React.ElementRef<typeof RadixTabs.Content>,
  HappileeTabsContentProps
>(({ className, ...props }, ref) => (
  <RadixTabs.Content
    ref={ref}
    className={clx(
      // Standard outline reset; consumers control padding/spacing.
      "outline-none focus-visible:ring-2 focus-visible:ring-ui-bg-interactive/30",
      className
    )}
    {...props}
  />
))
HappileeTabsContent.displayName = "HappileeTabs.Content"

// ── Compound export — mirrors @medusajs/ui Tabs shape ────────────────────────
const HappileeTabs = Object.assign(HappileeTabsRoot, {
  List: HappileeTabsList,
  Trigger: HappileeTabsTrigger,
  Content: HappileeTabsContent,
})

export { HappileeTabs }
export type {
  HappileeTabsContentProps,
  HappileeTabsListProps,
  HappileeTabsRootProps,
  HappileeTabsTriggerProps,
}
