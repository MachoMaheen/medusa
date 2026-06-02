import { HttpTypes } from "@medusajs/types"

import Divider from "@modules/common/components/divider"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import ItemsTemplate from "./items"
import Summary from "./summary"

/**
 * Happilee Commerce — Cart page shell.
 *
 * Layout grammar (per Wave 2.9 design contract):
 *   - Page surface: bg-ui-bg-subtle — Happilee page background
 *   - Two-column grid on >= small: left = line items + sign-in prompt,
 *     right = sticky summary card
 *   - Single-column stack on mobile
 *   - All surfaces are white cards floating on the subtle page bg with
 *     rounded-xl + hap-xs shadow + border-ui-border-base outline
 *
 * Token discipline: no raw hex, no arbitrary spacing — every value traces to
 * the Happilee Tailwind preset or the @medusajs/ui-preset overridden via
 * src/styles/happilee-tokens.css. See .agent-os/decisions/2026-06-02-canonical-token-map.md
 */
const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const hasItems = !!cart?.items?.length

  return (
    <div className="bg-ui-bg-subtle py-12">
      <div className="content-container" data-testid="cart-container">
        <h1 className="font-sans text-3xl font-semibold text-ui-fg-base mb-8">
          Shopping cart
        </h1>

        {hasItems ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_380px] gap-x-8 gap-y-8">
            <div className="flex flex-col gap-y-6">
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider className="border-ui-border-menu-bot" />
                </>
              )}
              <ItemsTemplate cart={cart} />
            </div>

            <div className="relative">
              <div className="sticky top-12 flex flex-col gap-y-6">
                {cart && cart.region && (
                  <div
                    className={
                      "rounded-xl border border-ui-border-base " +
                      "bg-ui-bg-base p-6 shadow-hap-xs"
                    }
                  >
                    <Summary cart={cart as any} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </div>
  )
}

export default CartTemplate
