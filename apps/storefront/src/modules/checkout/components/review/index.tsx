"use client"

/**
 * Wave 2.10 — Review step (re-skinned).
 *
 * The actual "Place order" button moved to the right-column order summary
 * card (CheckoutSummary). This step now just renders the terms-acknowledgement
 * copy and tells the shopper to hit the CTA in the summary panel.
 */

import { Heading, Text, clx } from "@medusajs/ui"
import { useSearchParams } from "next/navigation"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <section
      className="flex flex-col"
      data-testid="checkout-step-review"
      aria-labelledby="checkout-step-review-heading"
    >
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          id="checkout-step-review-heading"
          className={clx(
            "flex flex-row items-center gap-x-2 text-lg font-semibold text-ui-fg-base",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Review
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <div className="flex items-start w-full">
          <Text className="text-sm text-ui-fg-subtle">
            By clicking the <span className="font-medium text-ui-fg-base">Place order</span> button in the summary, you confirm that you have read, understand and accept our Terms of Use, Terms of Sale and Returns Policy and acknowledge that you have read Happilee Commerce&apos;s Privacy Policy.
          </Text>
        </div>
      )}
    </section>
  )
}

export default Review
