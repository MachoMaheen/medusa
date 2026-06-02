"use client"

/**
 * Wave 2.10 — Address step (re-skinned).
 *
 * Visual tokens:
 *   - text-lg font-semibold text-ui-fg-base — step heading
 *   - text-sm font-medium text-brand-secondary-text hover:text-brand-solid
 *     — Edit link (replaces the Medusa interactive-hover token usage)
 *   - Section dividers via `border-ui-border-base`
 *
 * Behavior preserved: same useActionState submit flow, same conditional
 * billing-vs-shipping section, same summary read-out when the step is closed.
 */

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text, useToggleState } from "@medusajs/ui"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  return (
    <section
      className="flex flex-col"
      data-testid="checkout-step-address"
      aria-labelledby="checkout-step-address-heading"
    >
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          id="checkout-step-address-heading"
          className="flex flex-row items-center gap-x-2 text-lg font-semibold text-ui-fg-base"
        >
          Shipping Address
          {!isOpen && cart?.shipping_address && (
            <CheckCircleSolid className="text-brand-solid" />
          )}
        </Heading>
        {!isOpen && cart?.shipping_address && (
          <button
            type="button"
            onClick={handleEdit}
            className="text-sm font-medium text-brand-secondary-text hover:text-brand-solid transition-colors"
            data-testid="edit-address-button"
          >
            Edit
          </button>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div className="pb-2">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />

            {!sameAsBilling && (
              <div>
                <Heading
                  level="h2"
                  className="text-base font-semibold text-ui-fg-base mt-8 mb-4"
                >
                  Billing address
                </Heading>

                <BillingAddress cart={cart} />
              </div>
            )}
            <SubmitButton className="mt-6" data-testid="submit-address-button">
              Continue to delivery
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-sm">
            {cart && cart.shipping_address ? (
              <div className="grid grid-cols-1 small:grid-cols-3 gap-6">
                <div
                  className="flex flex-col"
                  data-testid="shipping-address-summary"
                >
                  <Text className="text-sm font-medium text-ui-fg-base mb-1">
                    Shipping Address
                  </Text>
                  <Text className="text-sm text-ui-fg-subtle">
                    {cart.shipping_address.first_name}{" "}
                    {cart.shipping_address.last_name}
                  </Text>
                  <Text className="text-sm text-ui-fg-subtle">
                    {cart.shipping_address.address_1}{" "}
                    {cart.shipping_address.address_2}
                  </Text>
                  <Text className="text-sm text-ui-fg-subtle">
                    {cart.shipping_address.postal_code},{" "}
                    {cart.shipping_address.city}
                  </Text>
                  <Text className="text-sm text-ui-fg-subtle">
                    {cart.shipping_address.country_code?.toUpperCase()}
                  </Text>
                </div>

                <div
                  className="flex flex-col"
                  data-testid="shipping-contact-summary"
                >
                  <Text className="text-sm font-medium text-ui-fg-base mb-1">
                    Contact
                  </Text>
                  <Text className="text-sm text-ui-fg-subtle">
                    {cart.shipping_address.phone}
                  </Text>
                  <Text className="text-sm text-ui-fg-subtle">{cart.email}</Text>
                </div>

                <div
                  className="flex flex-col"
                  data-testid="billing-address-summary"
                >
                  <Text className="text-sm font-medium text-ui-fg-base mb-1">
                    Billing Address
                  </Text>

                  {sameAsBilling ? (
                    <Text className="text-sm text-ui-fg-subtle">
                      Billing and delivery address are the same.
                    </Text>
                  ) : (
                    <>
                      <Text className="text-sm text-ui-fg-subtle">
                        {cart.billing_address?.first_name}{" "}
                        {cart.billing_address?.last_name}
                      </Text>
                      <Text className="text-sm text-ui-fg-subtle">
                        {cart.billing_address?.address_1}{" "}
                        {cart.billing_address?.address_2}
                      </Text>
                      <Text className="text-sm text-ui-fg-subtle">
                        {cart.billing_address?.postal_code},{" "}
                        {cart.billing_address?.city}
                      </Text>
                      <Text className="text-sm text-ui-fg-subtle">
                        {cart.billing_address?.country_code?.toUpperCase()}
                      </Text>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default Addresses
