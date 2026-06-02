/**
 * Wave 2.10 — Checkout page (two-column body).
 *
 * Layout grammar (per spec §3, §4.4, §5):
 *   - LEFT (60%):  step stepper at top, then active step form inside a
 *                  HappileeCard-style outline (white surface, rounded-xl,
 *                  shadow-hap-xs, p-6, border-ui-border-base).
 *   - RIGHT (40%): sticky order summary card with line items, totals and the
 *                  "Place order" CTA. Lives inside the same HappileeCard
 *                  outline.
 *
 * On mobile the grid collapses to a single column with the summary stacked
 * below the form.
 */

import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutStepStepper from "@modules/checkout/components/step-stepper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  return (
    <div className="content-container py-8 small:py-12">
      <div className="grid grid-cols-1 small:grid-cols-[3fr_2fr] gap-6 small:gap-8 items-start">
        <div className="flex flex-col gap-y-6">
          <div className="rounded-xl bg-ui-bg-base border border-ui-border-base shadow-hap-xs p-6">
            <CheckoutStepStepper />
          </div>
          <div className="rounded-xl bg-ui-bg-base border border-ui-border-base shadow-hap-xs p-6">
            <PaymentWrapper cart={cart}>
              <CheckoutForm cart={cart} customer={customer} />
            </PaymentWrapper>
          </div>
        </div>
        <div className="small:sticky small:top-6">
          <CheckoutSummary cart={cart} />
        </div>
      </div>
    </div>
  )
}
