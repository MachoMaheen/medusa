import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Wave 2.8 — Product info block (collection link, title, description).
 *
 * Typography per canonical token map ADR:
 *   - Title  : text-3xl, font-semibold, text-ui-fg-base (#181d27)
 *   - Sub    : text-sm, text-brand-secondary-text (#4158bd) collection link
 *   - Body   : text-base, leading-7, text-ui-fg-subtle (#414651)
 * All text inherits font-sans (Inter) from the PDP container.
 */
type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info" data-testid="product-info">
      <div className="flex flex-col gap-md">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-sm font-medium text-brand-secondary-text hover:text-brand-solid transition-colors duration-hap-fast"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}

        <h1
          className="text-3xl leading-[38px] font-semibold text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </h1>

        <p
          className="text-base leading-7 text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </p>
      </div>
    </div>
  )
}

export default ProductInfo
