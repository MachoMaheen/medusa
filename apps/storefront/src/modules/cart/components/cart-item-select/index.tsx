"use client"

import { clx } from "@medusajs/ui"
import {
  SelectHTMLAttributes,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

import ChevronDown from "@modules/common/icons/chevron-down"

type NativeSelectProps = {
  placeholder?: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">

/**
 * Happilee Commerce — quantity selector for cart line items.
 *
 * Visual grammar: white surface input with border-ui-border-base outline,
 * rounded-md, Inter copy, chevron suffix. Focus ring uses brand-solid.
 * Mirrors the Wave 1.3 Select primitive's small variant.
 */
const CartItemSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ placeholder = "Select...", className, children, ...props }, ref) => {
    const innerRef = useRef<HTMLSelectElement>(null)
    const [isPlaceholder, setIsPlaceholder] = useState(false)

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    useEffect(() => {
      if (innerRef.current && innerRef.current.value === "") {
        setIsPlaceholder(true)
      } else {
        setIsPlaceholder(false)
      }
    }, [innerRef.current?.value])

    return (
      <div
        onFocus={() => innerRef.current?.focus()}
        onBlur={() => innerRef.current?.blur()}
        className={clx(
          "group relative inline-flex items-center",
          "rounded-md border border-ui-border-base bg-ui-bg-base",
          "font-sans text-sm font-medium text-ui-fg-base",
          "shadow-hap-xs transition-colors duration-hap-fast",
          "hover:bg-ui-bg-subtle-hover",
          "focus-within:border-brand-solid focus-within:ring-2",
          "focus-within:ring-brand-solid focus-within:ring-offset-0",
          {
            "text-ui-fg-muted": isPlaceholder,
          },
          className
        )}
      >
        <select
          ref={innerRef}
          {...props}
          className={
            "h-full w-full appearance-none border-none bg-transparent " +
            "pl-3 pr-7 font-sans text-sm text-ui-fg-base outline-none"
          }
        >
          <option disabled value="">
            {placeholder}
          </option>
          {children}
        </select>
        <span
          className={
            "pointer-events-none absolute right-2 flex items-center " +
            "text-ui-fg-muted"
          }
        >
          <ChevronDown />
        </span>
      </div>
    )
  }
)

CartItemSelect.displayName = "CartItemSelect"

export default CartItemSelect
