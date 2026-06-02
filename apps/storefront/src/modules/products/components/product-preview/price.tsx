import { clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"

/**
 * Wave 2.8 — Related products price chip.
 *
 * Tokens (Happilee):
 *   - default     : text-sm font-semibold text-brand-secondary-text
 *   - sale        : text-sm font-semibold text-hap-status-active-text
 *   - strike-thru : text-xs text-ui-fg-muted line-through (original price)
 */
export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  const isOnSale = price.price_type === "sale"

  return (
    <>
      {isOnSale && (
        <span
          className="line-through text-xs text-ui-fg-muted"
          data-testid="original-price"
        >
          {price.original_price}
        </span>
      )}
      <span
        className={clx("text-sm font-semibold", {
          "text-hap-status-active-text": isOnSale,
          "text-brand-secondary-text": !isOnSale,
        })}
        data-testid="price"
      >
        {price.calculated_price}
      </span>
    </>
  )
}
