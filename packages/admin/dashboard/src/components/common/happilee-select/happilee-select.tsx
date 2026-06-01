/**
 * HappileeSelect — Happilee v3-skinned select dropdown.
 *
 * Wraps the @medusajs/ui `Select` and pins it to the Happilee v3 specs from
 * `~/.claude/skills/happilee-v3-design-system/references/components.md`
 * (the select inherits Input geometry for its trigger and uses the
 * tier-two list pattern for its menu/items).
 *
 * Trigger spec (matches HappileeInput exactly):
 *   - height                  40px      (h-10)
 *   - background              bg-primary / #ffffff   → bg-ui-bg-base
 *   - border                  border-primary / #d5d7da 1px → border-ui-border-base
 *   - radius                  md (8px)  → rounded-md
 *   - padding                 px-3
 *   - font                    text-sm (14px Inter)
 *   - placeholder color       text-quaternary / #717680 → text-ui-fg-muted
 *   - focus border            brand-solid / #4d68dc    → focus:border-ui-border-interactive
 *   - focus ring              3px brand-light / #edf2fe → focus:ring-[3px] focus:ring-ui-bg-highlight
 *
 * Menu (Content) spec — Happilee tier-two list pattern:
 *   - background              bg-primary / #ffffff   → bg-ui-bg-base
 *   - border                  border-secondary / #e9eaeb 1px → border-ui-border-menu-bot
 *   - radius                  md (8px)  → rounded-md
 *   - shadow                  hap-lg
 *   - padding                 p-1 (4px)
 *
 * Item spec:
 *   - text-sm, text-ui-fg-base, rounded-md, px-3 py-2
 *   - hover                   bg-secondary / #fafafa → bg-ui-bg-base-hover
 *   - selected (data-state=checked):
 *       bg-brand-light (#edf2fe)
 *       text-brand-secondary-text (#4158bd)
 *       left border 2px brand-solid (#4d68dc)
 *
 * No raw hex appears below — every color routes through Happilee tokens
 * (Tailwind `brand-*` colors from tailwind.config.cjs) or Medusa CSS vars
 * that the happilee-tokens.css override pins to the Happilee v3 palette.
 */

import { Select as MedusaSelect, clx } from "@medusajs/ui"
import * as React from "react"

type MedusaSelectRootProps = React.ComponentPropsWithoutRef<typeof MedusaSelect>

export interface HappileeSelectProps extends Omit<MedusaSelectRootProps, "size"> {}

/**
 * Root — drop-in replacement for the @medusajs/ui Select.Root. Forwards every
 * prop through; the visual reskin happens on Trigger/Content/Item subcomponents.
 */
const HappileeSelectRoot = ({ children, ...props }: HappileeSelectProps) => {
  return <MedusaSelect {...props}>{children}</MedusaSelect>
}
HappileeSelectRoot.displayName = "HappileeSelect"

/* ── Trigger ────────────────────────────────────────────────────────────── */

const triggerClasses = clx(
  // Layout & geometry — mirror HappileeInput exactly
  "flex w-full h-10 items-center justify-between rounded-md px-3",
  // Surface & border (resolve to Happilee #ffffff / #d5d7da via CSS vars)
  "bg-ui-bg-base border border-ui-border-base",
  // Typography (Inter inherited from app shell)
  "text-sm text-ui-fg-base",
  // Placeholder color (resolves to Happilee #717680)
  "data-[placeholder]:text-ui-fg-muted",
  // Focus: brand-solid border + 3px brand-light ring (#4d68dc / #edf2fe)
  "outline-none transition-colors",
  "focus:border-ui-border-interactive focus:ring-[3px] focus:ring-ui-bg-highlight",
  "data-[state=open]:border-ui-border-interactive data-[state=open]:ring-[3px] data-[state=open]:ring-ui-bg-highlight",
  // Disabled
  "disabled:bg-ui-bg-disabled disabled:text-ui-fg-disabled disabled:cursor-not-allowed",
)

type TriggerProps = React.ComponentPropsWithoutRef<typeof MedusaSelect.Trigger>

const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <MedusaSelect.Trigger
        ref={ref}
        className={clx(triggerClasses, className)}
        {...props}
      >
        {children}
      </MedusaSelect.Trigger>
    )
  },
)
Trigger.displayName = "HappileeSelect.Trigger"

/* ── Content (menu surface) ─────────────────────────────────────────────── */

const contentClasses = clx(
  // Surface + tier-two list pattern (white bg, subtle border, hap-lg shadow)
  "bg-ui-bg-base border border-ui-border-menu-bot rounded-md shadow-hap-lg",
  // Padding so items sit nicely inside the rounded corners
  "p-1",
  // Make it at least as wide as the trigger
  "min-w-[var(--radix-select-trigger-width)]",
  // Color of text in the menu (inherited by items, but set here as fallback)
  "text-ui-fg-base",
)

type ContentProps = React.ComponentPropsWithoutRef<typeof MedusaSelect.Content>

const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <MedusaSelect.Content
        ref={ref}
        className={clx(contentClasses, className)}
        {...props}
      >
        {children}
      </MedusaSelect.Content>
    )
  },
)
Content.displayName = "HappileeSelect.Content"

/* ── Item ───────────────────────────────────────────────────────────────── */

const itemClasses = clx(
  // Layout
  "relative flex w-full cursor-pointer select-none items-center rounded-md",
  "px-3 py-2 text-sm outline-none transition-colors",
  // Default text color
  "text-ui-fg-base",
  // Hover: bg-secondary (#fafafa)
  "hover:bg-ui-bg-base-hover focus:bg-ui-bg-base-hover",
  // Selected — Happilee tier-two selected pattern
  // bg-brand-light + text-brand-secondary-text + 2px left border in brand-solid
  "data-[state=checked]:bg-brand-light",
  "data-[state=checked]:text-brand-secondary-text",
  "data-[state=checked]:border-l-2 data-[state=checked]:border-brand-solid",
  // Disabled
  "data-[disabled]:text-ui-fg-disabled data-[disabled]:cursor-not-allowed",
)

type ItemProps = React.ComponentPropsWithoutRef<typeof MedusaSelect.Item>

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <MedusaSelect.Item
        ref={ref}
        className={clx(itemClasses, className)}
        {...props}
      >
        {children}
      </MedusaSelect.Item>
    )
  },
)
Item.displayName = "HappileeSelect.Item"

/* ── Pass-through subcomponents (no reskin needed) ──────────────────────── */

const Value = MedusaSelect.Value
const Group = MedusaSelect.Group
const Label = MedusaSelect.Label
const Separator = MedusaSelect.Separator

/* ── Composite export ───────────────────────────────────────────────────── */

export const HappileeSelect = Object.assign(HappileeSelectRoot, {
  Trigger,
  Content,
  Item,
  Value,
  Group,
  Label,
  Separator,
})
