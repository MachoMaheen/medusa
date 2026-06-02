import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

/**
 * Wave 2.8 — Related products section under the PDP hero.
 *
 * Layout:
 *   - Section header eyebrow : text-sm font-medium text-brand-secondary-text
 *   - Section title          : text-2xl font-semibold text-ui-fg-base
 *   - Grid                   : 2 cols (mobile) -> 3 -> 4 (large), gap-xl
 *   - Items                  : HappileeCard-style tiles via Thumbnail
 */
type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // edit this function to define your related products logic
  const queryParams: HttpTypes.StoreProductListParams = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  return (
    <section className="product-page-constraint" data-testid="related-products">
      <header className="flex flex-col items-center text-center mb-xl gap-sm">
        <span className="text-sm font-medium text-brand-secondary-text">
          Related products
        </span>
        <h2 className="text-2xl font-semibold text-ui-fg-base max-w-lg leading-8">
          You might also want to check out these products.
        </h2>
      </header>

      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-xl">
        {products.map((p) => (
          <li key={p.id}>
            <Product region={region} product={p} />
          </li>
        ))}
      </ul>
    </section>
  )
}
