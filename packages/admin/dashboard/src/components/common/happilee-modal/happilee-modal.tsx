/**
 * HappileeModal — Wave 1.5
 *
 * A centered confirmation/form modal pinned to the Happilee v3 modal spec from
 * `~/.claude/skills/happilee-v3-design-system/references/components.md`
 * (Modal / drawer section).
 *
 * `@medusajs/ui` doesn't export a plain `Dialog` primitive — it only exposes
 * the full-screen `FocusModal`, the side `Drawer`, and the alert `Prompt`. All
 * three wrap `radix-ui`'s `Dialog` / `AlertDialog`. For the standard centered
 * modal shape (560px / 720px max-width, alpha-30 backdrop, radius xl), we wrap
 * `radix-ui`'s Dialog directly — identical to what FocusModal does internally
 * but styled to the Happilee v3 centered-modal contract.
 *
 * Spec (every color routes through a Happilee-overridden Medusa CSS var or a
 * Happilee Tailwind extension — NO raw hex literals appear below):
 *
 *   backdrop      bg-black/30 (alpha-black-30) + backdrop-blur-hap-md (16px)
 *   panel surface bg-ui-bg-base (→ Happilee bg-primary / #ffffff)
 *   radius        rounded-xl (12px — Happilee modal radius)
 *   shadow        shadow-hap-md
 *   padding       p-6 (24px = Happilee spacing 3xl) on the panel
 *   max-width     560px ("md") / 720px ("lg" — multi-section forms)
 *
 *   title row     text-lg font-semibold text-ui-fg-base (18px Inter)
 *                 + 24×24 ghost close button (text-ui-fg-muted,
 *                 hover bg-ui-bg-base-hover ≈ alpha-black-05)
 *
 *   description   text-sm text-ui-fg-subtle (text-tertiary token)
 *                 mt-1 (Happilee spacing sm = 4px / "margin-top sm")
 *
 *   body          pt-3 (Happilee spacing md = 8px), gap-y-2 between sections
 *
 *   footer        pt-4 (Happilee spacing xl = 16px) + border-t
 *                 border-ui-border-menu-bot (→ Happilee border-secondary
 *                 #e9eaeb), gap-x-1.5 (sm = 6px), justify-end
 *
 *   animation     200ms ease-out fade + zoom (Radix data-state attrs).
 *
 * API:
 *   <HappileeModal open onOpenChange size="md|lg">
 *     <HappileeModal.Title>Title</HappileeModal.Title>
 *     <HappileeModal.Description>Subtitle</HappileeModal.Description>
 *     <HappileeModal.Body>{form body}</HappileeModal.Body>
 *     <HappileeModal.Footer>{actions}</HappileeModal.Footer>
 *   </HappileeModal>
 */

import { XMark } from "@medusajs/icons"
import { IconButton, clx } from "@medusajs/ui"
import { Dialog as RadixDialog } from "radix-ui"
import * as React from "react"

type HappileeModalSize = "md" | "lg"

export interface HappileeModalProps {
  /** Controlled open state — wired to Radix Dialog.Root. */
  open?: boolean
  /** Controlled open-change handler. */
  onOpenChange?: (open: boolean) => void
  /** Panel max-width preset: "md" = 560px (standard), "lg" = 720px (forms). */
  size?: HappileeModalSize
  /** Modal children — typically Title / Description / Body / Footer. */
  children?: React.ReactNode
  /** Optional className applied to the panel for one-off overrides. */
  className?: string
}

const SIZE_WIDTH: Record<HappileeModalSize, string> = {
  // 560px — standard Happilee modal max-width.
  md: "max-w-[560px]",
  // 720px — wider variant for multi-section forms (per skill components.md).
  lg: "max-w-[720px]",
}

// ── Title ────────────────────────────────────────────────────────────────

interface HappileeModalTitleProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Title row — renders the accessible Radix Dialog.Title plus a 24×24 ghost
 * close button on the right that closes the modal via Radix's Dialog.Close.
 */
const HappileeModalTitle = React.forwardRef<
  HTMLDivElement,
  HappileeModalTitleProps
>(({ className, children, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={clx(
        "flex items-start justify-between gap-x-3",
        className,
      )}
      {...rest}
    >
      <RadixDialog.Title asChild>
        <h2 className="text-lg font-semibold text-ui-fg-base leading-7">
          {children}
        </h2>
      </RadixDialog.Title>
      <RadixDialog.Close asChild>
        <IconButton
          type="button"
          size="small"
          variant="transparent"
          aria-label="Close modal"
          className={clx(
            "h-6 w-6 shrink-0",
            // Ghost close button — quaternary text, alpha-black-05 on hover.
            "text-ui-fg-muted",
            "hover:bg-ui-bg-base-hover",
          )}
        >
          <XMark />
        </IconButton>
      </RadixDialog.Close>
    </div>
  )
})
HappileeModalTitle.displayName = "HappileeModal.Title"

// ── Description ──────────────────────────────────────────────────────────

interface HappileeModalDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

/**
 * Optional subtitle below the title. Uses the accessible Radix
 * Dialog.Description so screen readers announce it on open.
 */
const HappileeModalDescription = React.forwardRef<
  HTMLParagraphElement,
  HappileeModalDescriptionProps
>(({ className, children, ...rest }, ref) => {
  return (
    <RadixDialog.Description asChild>
      <p
        ref={ref}
        className={clx(
          // 14px Inter, tertiary text color, mt-1 = Happilee spacing sm.
          "mt-1 text-sm text-ui-fg-subtle leading-5",
          className,
        )}
        {...rest}
      >
        {children}
      </p>
    </RadixDialog.Description>
  )
})
HappileeModalDescription.displayName = "HappileeModal.Description"

// ── Body ─────────────────────────────────────────────────────────────────

interface HappileeModalBodyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Body region — padding-top md (8px) and 8px gap between vertical sections,
 * per Happilee modal spec.
 */
const HappileeModalBody = React.forwardRef<
  HTMLDivElement,
  HappileeModalBodyProps
>(({ className, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={clx(
        // pt-2 = 8px (Happilee md), gap-y-2 = 8px between stacked sections.
        "flex flex-col gap-y-2 pt-2",
        className,
      )}
      {...rest}
    />
  )
})
HappileeModalBody.displayName = "HappileeModal.Body"

// ── Footer ───────────────────────────────────────────────────────────────

interface HappileeModalFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Footer row — right-aligned action stack with gap-x-1.5 (6px = Happilee sm),
 * padding-top xl (16px), and a top border in border-secondary.
 */
const HappileeModalFooter = React.forwardRef<
  HTMLDivElement,
  HappileeModalFooterProps
>(({ className, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={clx(
        "flex items-center justify-end gap-x-1.5",
        // 16px padding-top + 16px margin-top (to push the border into the
        // 24px panel padding). The Happilee modal spec puts the border
        // flush against a 16px gap above the buttons.
        "mt-4 pt-4 border-t border-ui-border-menu-bot",
        className,
      )}
      {...rest}
    />
  )
})
HappileeModalFooter.displayName = "HappileeModal.Footer"

// ── Overlay + panel base classes ─────────────────────────────────────────

const OVERLAY_CLASSES = clx(
  // bg-black/30 = alpha-black-30; backdrop-blur-hap-md = 16px.
  "fixed inset-0 z-50 bg-black/30 backdrop-blur-hap-md",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "duration-hap-normal ease-out",
)

const PANEL_BASE = clx(
  // Centered fixed overlay, full-width on small screens with an 8px gutter.
  "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
  "w-[calc(100%-16px)]",
  // Surface — Happilee bg-primary (#ffffff) via Medusa var override.
  "bg-ui-bg-base",
  // Radius xl (12px) per Happilee modal spec.
  "rounded-xl",
  // Shadow md per spec (modal-level elevation).
  "shadow-hap-md",
  // Internal padding 24px (Happilee spacing 3xl) — Title/Body/Footer rely
  // on this rather than each owning their own horizontal padding.
  "p-6",
  // Focus management — Radix handles trap; suppress the default outline.
  "outline-none",
  // Animation: 200ms fade + subtle zoom on open/close.
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  "duration-hap-normal ease-out",
)

// ── Root ─────────────────────────────────────────────────────────────────

/**
 * HappileeModal — Happilee v3-skinned centered modal.
 *
 * Wraps radix-ui's Dialog primitive (the same primitive Medusa's FocusModal,
 * Drawer, and Prompt build on) and applies the Happilee modal/drawer spec.
 */
const HappileeModalRoot = ({
  open,
  onOpenChange,
  size = "md",
  children,
  className,
}: HappileeModalProps) => {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={OVERLAY_CLASSES} />
        <RadixDialog.Content
          className={clx(PANEL_BASE, SIZE_WIDTH[size], className)}
          data-happilee-modal=""
          data-size={size}
        >
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
HappileeModalRoot.displayName = "HappileeModal"

export const HappileeModal = Object.assign(HappileeModalRoot, {
  Title: HappileeModalTitle,
  Description: HappileeModalDescription,
  Body: HappileeModalBody,
  Footer: HappileeModalFooter,
})

export type {
  HappileeModalSize,
  HappileeModalTitleProps,
  HappileeModalDescriptionProps,
  HappileeModalBodyProps,
  HappileeModalFooterProps,
}
