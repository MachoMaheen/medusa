import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Happilee Commerce — Empty cart state.
 *
 * HappileeEmptyState parity: dashed border (border-ui-border-base) on the
 * subtle page surface (bg-ui-bg-subtle), centered copy, brand-solid CTA.
 *
 * Lives inside the cart page shell which already paints bg-ui-bg-subtle,
 * so this card uses the SAME subtle bg to read as "empty" — a deliberate
 * Happilee pattern (see references/components.md § Empty state).
 */
const EmptyCartMessage = () => {
  return (
    <div
      className={
        "flex flex-col items-center justify-center gap-y-4 " +
        "rounded-xl border border-dashed border-ui-border-base " +
        "bg-ui-bg-subtle px-6 py-16 text-center"
      }
      data-testid="empty-cart-message"
    >
      <h2 className="font-sans text-2xl font-semibold text-ui-fg-base">
        Your cart is empty
      </h2>
      <p
        className={
          "max-w-md font-sans text-base font-normal text-ui-fg-muted"
        }
      >
        Looks like you haven&apos;t added anything yet. Browse our catalog
        and start filling it up.
      </p>
      <LocalizedClientLink href="/store">
        <span
          className={
            "inline-flex h-10 items-center justify-center gap-x-2 " +
            "rounded-md bg-brand-solid px-4 font-sans text-sm font-medium " +
            "text-white shadow-hap-xs transition-colors duration-hap-fast " +
            "hover:bg-brand-secondary-text"
          }
        >
          Continue shopping
        </span>
      </LocalizedClientLink>
    </div>
  )
}

export default EmptyCartMessage
