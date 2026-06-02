"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

/**
 * Wave 2.8 — Product actions panel.
 *
 * Components inside (Happilee tokens):
 *   - Divider between option groups : border-ui-border-menu-bot
 *   - Primary CTA "Add to cart"     : bg-brand-solid, text-white, rounded-md,
 *                                     shadow-hap-xs-skeuomorphic, hover -> bg-brand-secondary-text
 *   - Disabled state                : bg-brand-primary-icon (#93adfe via brand scale)
 *                                     -> token-mapped to bg-brand-solid + opacity-60 to stay on-scale
 *   - Loading spinner               : text-white border-white
 *   - Inter font cascades from PDP container.
 */
type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string

  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    if (selectedVariant?.allow_backorder) {
      return true
    }

    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })

    setIsAdding(false)
  }

  const ctaDisabled =
    !inStock ||
    !selectedVariant ||
    !!disabled ||
    isAdding ||
    !isValidVariant

  const ctaLabel =
    !selectedVariant && !options
      ? "Select variant"
      : !inStock || !isValidVariant
      ? "Out of stock"
      : "Add to cart"

  return (
    <>
      <div className="flex flex-col gap-xl" ref={actionsRef}>
        {(product.variants?.length ?? 0) > 1 && (
          <div className="flex flex-col gap-lg">
            {(product.options || []).map((option) => (
              <OptionSelect
                key={option.id}
                option={option}
                current={options[option.id]}
                updateOption={setOptionValue}
                title={option.title ?? ""}
                data-testid="product-options"
                disabled={!!disabled || isAdding}
              />
            ))}
            <div
              className="h-px w-full bg-ui-border-menu-bot"
              aria-hidden="true"
            />
          </div>
        )}

        <ProductPrice product={product} variant={selectedVariant} />

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={ctaDisabled}
          className={clx(
            "brand-solid w-full inline-flex items-center justify-center h-11 px-lg rounded-md",
            "bg-brand-solid text-white text-sm font-semibold",
            "shadow-hap-xs-skeuomorphic transition-colors duration-hap-fast",
            "hover:bg-brand-secondary-text",
            "focus:outline-none focus:ring-2 focus:ring-brand-solid/30 focus:ring-offset-1",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-brand-solid"
          )}
          data-testid="add-product-button"
          aria-busy={isAdding}
        >
          {isAdding ? (
            <span
              className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-sm"
              aria-hidden="true"
            />
          ) : null}
          {ctaLabel}
        </button>

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
