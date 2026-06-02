/**
 * Wave 2.10 — HappileeInput (checkout-scoped).
 *
 * Drop-in replacement for `@modules/common/components/input` that adopts the
 * Happilee v3 form-field contract:
 *   - h-10 (40px) field height
 *   - rounded-md (8px) corners
 *   - bg-ui-bg-base surface
 *   - border-ui-border-base default border
 *   - text-sm body, text-ui-fg-base text, text-ui-fg-muted placeholders
 *   - focus: brand-solid border + 3px brand-light ring (the canonical
 *     Happilee focus treatment from the design-system skill)
 *
 * Labels render above the input as `text-sm font-medium text-ui-fg-subtle`,
 * with a discrete error star (`text-ui-fg-error`) when the field is required.
 *
 * Scoped to modules/checkout so that the shared `@modules/common` input keeps
 * its current behavior in non-checkout routes (kept in scope for this wave).
 */

import { Label } from "@medusajs/ui"
import React, { useEffect, useImperativeHandle, useState } from "react"

import Eye from "@modules/common/icons/eye"
import EyeOff from "@modules/common/icons/eye-off"

type HappileeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label: string
  name: string
  topLabel?: string
}

const FIELD_CLASSES = [
  "block",
  "w-full",
  "h-10",
  "rounded-md",
  "bg-ui-bg-base",
  "border",
  "border-ui-border-base",
  "px-3",
  "text-sm",
  "text-ui-fg-base",
  "placeholder:text-ui-fg-muted",
  "outline-none",
  "transition-colors",
  "focus:border-ui-border-interactive",
  "focus:ring-[3px]",
  "focus:ring-ui-bg-highlight",
  "hover:border-ui-border-strong",
].join(" ")

const HappileeInput = React.forwardRef<HTMLInputElement, HappileeInputProps>(
  ({ type, name, label, required, topLabel, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [inputType, setInputType] = useState(type)

    useEffect(() => {
      if (type === "password" && showPassword) {
        setInputType("text")
        return
      }
      if (type === "password" && !showPassword) {
        setInputType("password")
      }
    }, [type, showPassword])

    useImperativeHandle(ref, () => inputRef.current!)

    return (
      <div className="flex flex-col w-full">
        {topLabel && (
          <Label
            htmlFor={name}
            className="mb-1 text-sm font-medium text-ui-fg-subtle"
          >
            {topLabel}
          </Label>
        )}
        <Label
          htmlFor={name}
          className="mb-1 text-sm font-medium text-ui-fg-subtle"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="text-ui-fg-error ml-0.5">
              *
            </span>
          )}
        </Label>
        <div className="relative w-full">
          <input
            type={inputType}
            id={name}
            name={name}
            required={required}
            className={FIELD_CLASSES}
            {...props}
            ref={inputRef}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ui-fg-subtle hover:text-ui-fg-base focus:outline-none transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          )}
        </div>
      </div>
    )
  }
)

HappileeInput.displayName = "HappileeInput"

export default HappileeInput
