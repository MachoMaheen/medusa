/**
 * Happilee Toaster — Wave 1.7
 *
 * Wraps `sonner` (Happilee v3's chosen toast library) with the
 * Happilee-defaults required by the design system:
 *
 *   - position:      "top-right"
 *   - richColors:    true   (sonner renders semantic colors that align with
 *                            our token palette — see references/components.md
 *                            "Toast (sonner)" — DO NOT replace with custom toast)
 *   - closeButton:   true
 *   - visibleToasts: 3
 *   - duration:      4000ms
 *   - offset:        16px
 *
 * Consumers should import via the folder barrel:
 *
 *   import { toast, HappileeToaster } from "@/components/common/happilee-toaster"
 *
 * Then mount `<HappileeToaster />` once at the app root (in providers.tsx,
 * replacing Medusa's `<Toaster />`), and call `toast("...")` anywhere.
 *
 * No raw hex appears in this file — sonner's `richColors` mode renders
 * semantic-state colors via its own CSS variables. If we ever need to
 * override them we'll do it via tokenized CSS classes, not inline hex.
 */

import * as React from "react"
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner"

type SonnerToasterProps = React.ComponentProps<typeof SonnerToaster>

// Allow consumers to override individual defaults (e.g. `duration`) without
// having to repeat the full Happilee preset. We omit `position` because the
// design contract forbids changing it — toasts always live top-right.
export interface HappileeToasterProps
  extends Omit<SonnerToasterProps, "position"> {}

// Centralized defaults so the values appear once and are easy to audit.
const HAPPILEE_TOASTER_DEFAULTS = {
  position: "top-right",
  richColors: true,
  closeButton: true,
  visibleToasts: 3,
  duration: 4000,
  offset: 16,
} as const satisfies Pick<
  SonnerToasterProps,
  "position" | "richColors" | "closeButton" | "visibleToasts" | "duration" | "offset"
>

export const HappileeToaster = ({
  richColors = HAPPILEE_TOASTER_DEFAULTS.richColors,
  closeButton = HAPPILEE_TOASTER_DEFAULTS.closeButton,
  visibleToasts = HAPPILEE_TOASTER_DEFAULTS.visibleToasts,
  duration = HAPPILEE_TOASTER_DEFAULTS.duration,
  offset = HAPPILEE_TOASTER_DEFAULTS.offset,
  ...rest
}: HappileeToasterProps): React.ReactElement => {
  return (
    <SonnerToaster
      position={HAPPILEE_TOASTER_DEFAULTS.position}
      richColors={richColors}
      closeButton={closeButton}
      visibleToasts={visibleToasts}
      duration={duration}
      offset={offset}
      {...rest}
    />
  )
}

HappileeToaster.displayName = "HappileeToaster"

// Re-export sonner's imperative API under a stable local name so consumers
// only ever import from this module — `toast.success(...)`, `toast.error(...)`,
// `toast.promise(...)` all work as documented by sonner.
export const toast = sonnerToast
export type { SonnerToasterProps }
