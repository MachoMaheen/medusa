/**
 * HappileeInput — Happilee v3-skinned text input.
 *
 * Wraps the @medusajs/ui `Input` and pins it to the Happilee v3 specs from
 * `~/.claude/skills/happilee-v3-design-system/references/components.md`
 * (search-bar / toolbar input pattern).
 *
 * Spec (all values resolve through Medusa CSS vars overridden in
 * `packages/admin/dashboard/src/styles/happilee-tokens.css`):
 *   - height                  40px      (h-10)
 *   - background              bg-primary / #ffffff   → bg-ui-bg-base
 *   - border                  border-primary / #d5d7da 1px → border-ui-border-base
 *   - radius                  md (8px)  → rounded-md
 *   - padding-left            36px when leading icon, 12px otherwise
 *   - padding-right           12px      (pr-3)
 *   - font                    text-sm (14px Inter)
 *   - placeholder color       text-quaternary / #717680 → placeholder:text-ui-fg-muted
 *   - focus border            brand-solid / #4d68dc    → focus:border-ui-border-interactive
 *   - focus ring              3px brand-light / #edf2fe → focus:ring-[3px] focus:ring-ui-bg-highlight
 *
 * No raw hex appears below — everything routes through Medusa tokens that the
 * Happilee override CSS pins to the Happilee v3 palette.
 */

import { Input as MedusaInput, clx } from "@medusajs/ui"
import * as React from "react"

type MedusaInputProps = React.ComponentPropsWithoutRef<typeof MedusaInput>

export interface HappileeInputProps extends Omit<MedusaInputProps, "size"> {
  /**
   * Optional leading icon rendered inside the input on the left. Sized 16x16
   * and colored `text-ui-fg-muted` to match the Happilee search-bar pattern.
   */
  leadingIcon?: React.ReactNode
}

const happileeInputClasses = clx(
  // Layout & geometry
  "block w-full h-10 rounded-md",
  // Surface & border (resolve to Happilee #ffffff / #d5d7da)
  "bg-ui-bg-base border border-ui-border-base",
  // Typography (Inter inherited from app shell)
  "text-sm text-ui-fg-base",
  // Placeholder color (resolves to Happilee #717680)
  "placeholder:text-ui-fg-muted",
  // Focus: brand-solid border + 3px brand-light ring (#4d68dc / #edf2fe)
  "outline-none transition-colors",
  "focus:border-ui-border-interactive focus:ring-[3px] focus:ring-ui-bg-highlight",
  // Disabled
  "disabled:bg-ui-bg-disabled disabled:text-ui-fg-disabled disabled:cursor-not-allowed",
)

/**
 * Happilee-skinned input. Forwards refs to the underlying input element so it
 * stays compatible with `react-hook-form` registrations used across the
 * dashboard.
 */
export const HappileeInput = React.forwardRef<HTMLInputElement, HappileeInputProps>(
  ({ className, leadingIcon, ...props }, ref) => {
    const paddingX = leadingIcon ? "pl-9 pr-3" : "px-3"

    return (
      <div className="relative w-full">
        {leadingIcon ? (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center text-ui-fg-muted"
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
        ) : null}
        <MedusaInput
          ref={ref}
          className={clx(happileeInputClasses, paddingX, className)}
          {...props}
        />
      </div>
    )
  },
)

HappileeInput.displayName = "HappileeInput"
