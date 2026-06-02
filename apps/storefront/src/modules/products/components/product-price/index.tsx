import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

/**
 * Wave 2.8 — PDP price block.
 *
 * Typography (Happilee):
 *   - Main price : text-2xl, font-semibold, text-brand-secondary-text (#4158bd)
 *   - Sale       : same size but text-hap-status-active-text (#15803d) for "on sale" state
 *   - Strike     : text-sm, line-through, text-ui-fg-muted (#717680)
 *   - %-off pill : tag-pill (bg-brand-light + text-brand-secondary-text)
 */
export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return (
      <div className="block w-32 h-9 bg-ui-bg-subtle-hover animate-pulse rounded-md" />
    )
  }

  const isOnSale = selectedPrice.price_type === "sale"

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-baseline gap-md">
        <span
          className={clx("text-2xl font-semibold leading-8", {
            "text-hap-status-active-text": isOnSale,
            "text-brand-secondary-text": !isOnSale,
          })}
        >
          {!variant && (
            <span className="text-sm font-medium text-ui-fg-muted mr-xs">
              From
            </span>
          )}
          <span
            data-testid="product-price"
            data-value={selectedPrice.calculated_price_number}
          >
            {selectedPrice.calculated_price}
          </span>
        </span>

        {isOnSale && (
          <span
            className="inline-flex items-center h-6 px-md rounded-full bg-brand-light text-brand-secondary-text text-xs font-medium"
            data-testid="product-discount"
          >
            -{selectedPrice.percentage_diff}%
          </span>
        )}
      </div>

      {isOnSale && (
        <p className="text-sm text-ui-fg-muted">
          <span>Original: </span>
          <span
            className="line-through"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.original_price}
          </span>
        </p>
      )}
    </div>
  )
}
