/**
 * Wave 2.10 — Checkout route layout.
 *
 * Happilee checkout shell:
 *   - Top brand bar: 64px tall, white surface, "Happilee Commerce" wordmark
 *     with the Happilee H mark on the left, "Back to cart" link on the right.
 *   - Body sits on bg-ui-bg-subtle (#fafafa) so cards inside float on a
 *     neutral page.
 *
 * Tokens (see .agent-os/decisions/2026-06-02-canonical-token-map.md):
 *   - bg-ui-bg-base       — top bar surface
 *   - bg-ui-bg-subtle     — page background
 *   - border-ui-border-base — bottom divider on top bar
 *   - bg-brand-solid      — the Happilee H mark square
 *   - text-ui-fg-base     — wordmark
 *   - text-ui-fg-subtle   — "Back to cart" link
 *   - text-brand-secondary-text — hover state on link
 */

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-ui-bg-subtle min-h-screen flex flex-col">
      <header className="h-16 bg-ui-bg-base border-b border-ui-border-base">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/"
            className="flex items-center gap-x-3"
            data-testid="store-link"
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-solid text-white font-semibold text-base"
            >
              H
            </span>
            <span className="text-base font-semibold text-ui-fg-base tracking-tight">
              Happilee Commerce
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/cart"
            className="flex items-center gap-x-1 text-sm font-medium text-ui-fg-subtle hover:text-brand-secondary-text transition-colors"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="hidden small:inline">Back to cart</span>
            <span className="inline small:hidden">Back</span>
          </LocalizedClientLink>
        </nav>
      </header>
      <main className="flex-1" data-testid="checkout-container">
        {children}
      </main>
    </div>
  )
}
