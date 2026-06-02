"use client"

import { HttpTypes } from "@medusajs/types"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import DiscountCode from "@modules/checkout/components/discount-code"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

/**
 * Happilee Commerce — cart summary card body.
 *
 * The outer rounded-xl + bg-ui-bg-base surface is owned by the parent
 * (CartTemplate). This component lays out the totals + CTA inside that
 * surface using the canonical Happilee type + spacing scale.
 *
 * "Go to checkout" CTA = brand-solid filled, full-width, rounded-md —
 * the one place on this page where Happilee brand blue appears.
 */
const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-4">
      <h2 className="font-sans text-lg font-semibold text-ui-fg-base">
        Order summary
      </h2>

      <DiscountCode cart={cart} />

      <Divider className="border-ui-border-menu-bot" />

      <CartTotals totals={cart} />

      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
        className="block"
      >
        <button
          type="button"
          className={
            "inline-flex h-10 w-full items-center justify-center gap-x-2 " +
            "rounded-md bg-brand-solid px-4 font-sans text-sm font-medium " +
            "text-white shadow-hap-xs transition-colors duration-hap-fast " +
            "hover:bg-brand-secondary-text " +
            "focus-visible:outline-none focus-visible:ring-2 " +
            "focus-visible:ring-brand-solid focus-visible:ring-offset-2 " +
            "disabled:cursor-not-allowed disabled:opacity-50"
          }
        >
          Go to checkout
        </button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
