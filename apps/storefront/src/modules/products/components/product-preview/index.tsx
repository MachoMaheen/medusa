import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

/**
 * Wave 2.8 — Related products grid tile.
 *
 * Layout: Happilee card stack
 *   - Thumbnail (rounded-xl + shadow-hap-xs, lifts to shadow-hap-sm on hover)
 *   - Title  : text-sm font-medium text-ui-fg-base
 *   - Price  : text-sm font-semibold text-brand-secondary-text
 *   - gap-md between thumbnail and meta row
 *   - Inter font cascades from PDP container.
 */
export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block focus:outline-none focus:ring-2 focus:ring-brand-solid/20 rounded-xl"
    >
      <div data-testid="product-wrapper" className="flex flex-col gap-md">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex items-baseline justify-between gap-md">
          <span
            className="text-sm font-medium text-ui-fg-base group-hover:text-brand-secondary-text transition-colors duration-hap-fast truncate"
            data-testid="product-title"
          >
            {product.title}
          </span>
          <div className="flex items-baseline gap-sm shrink-0">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
