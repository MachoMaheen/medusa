/**
 * Wave 2.10 — Checkout summary (right column).
 *
 * Renders the Happilee-skinned order summary card:
 *   - Heading: "Order summary" (text-lg semibold)
 *   - Line items preview list
 *   - Promotions/discount-code input
 *   - Totals (CartTotals)
 *   - Place order CTA (PaymentButton) at the bottom — disabled until the
 *     cart has the address, shipping method and payment session it needs.
 *
 * Card shell tokens (canonical-token-map ADR):
 *   - bg-ui-bg-base       — white surface
 *   - border-ui-border-base — subtle border
 *   - shadow-hap-xs       — Happilee card shadow
 *   - rounded-xl          — 12px (cards use xl per skill)
 */

import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import PaymentButton from "@modules/checkout/components/payment-button"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

type CartWithPromotions = HttpTypes.StoreCart & {
  promotions: HttpTypes.StorePromotion[]
}

const CheckoutSummary = ({ cart }: { cart: CartWithPromotions }) => {
  return (
    <div
      className="rounded-xl bg-ui-bg-base border border-ui-border-base shadow-hap-xs flex flex-col"
      data-testid="checkout-summary"
    >
      <div className="p-6 pb-4">
        <Heading
          level="h2"
          className="text-lg font-semibold text-ui-fg-base"
        >
          Order summary
        </Heading>
      </div>
      <Divider className="mx-6" />
      <div className="p-6">
        <ItemsPreviewTemplate cart={cart} />
      </div>
      <Divider className="mx-6" />
      <div className="px-6 py-4">
        <DiscountCode cart={cart} />
      </div>
      <Divider className="mx-6" />
      <div className="p-6">
        <CartTotals totals={cart} />
      </div>
      <div className="p-6 pt-0">
        <PaymentButton cart={cart} data-testid="summary-place-order-button" />
      </div>
    </div>
  )
}

export default CheckoutSummary
