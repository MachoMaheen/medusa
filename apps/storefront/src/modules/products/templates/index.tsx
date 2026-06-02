import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

/**
 * Wave 2.8 — Happilee Commerce PDP layout.
 *
 * Layout grammar (per spec §3 + canonical token map ADR):
 *   - Page background: bg-ui-bg-subtle (#fafafa)
 *   - Two-column hero: large image gallery on the LEFT (rounded-xl,
 *     shadow-hap-sm), product info + actions panel on the RIGHT.
 *   - Right panel is a sticky white card on desktop so the "Add to cart"
 *     CTA stays in view as the user scrolls product details.
 *   - Inter (font-sans) cascades from the top-level container.
 *   - Related-products grid sits below the hero on the same subtle bg.
 */
type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <div className="font-sans bg-ui-bg-subtle">
      <div
        className="content-container grid grid-cols-1 large:grid-cols-[1fr_400px] gap-xl large:gap-3xl py-3xl"
        data-testid="product-container"
      >
        {/* Hero left — image gallery */}
        <div className="w-full">
          <ImageGallery images={images} />
        </div>

        {/* Hero right — sticky product info / actions card */}
        <aside className="w-full large:sticky large:top-3xl large:self-start">
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl shadow-hap-sm p-xl flex flex-col gap-xl">
            <ProductOnboardingCta />
            <ProductInfo product={product} />
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
            <ProductTabs product={product} />
          </div>
        </aside>
      </div>

      {/* Related products */}
      <div
        className="content-container my-3xl"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
