import { Dialog, Transition } from "@headlessui/react"
import { clx } from "@medusajs/ui"
import React, { Fragment, useMemo } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"

import { getProductPrice } from "@lib/util/get-product-price"
import OptionSelect from "./option-select"
import { HttpTypes } from "@medusajs/types"
import { isSimpleProduct } from "@lib/util/product"

/**
 * Wave 2.8 — Mobile sticky-bottom actions bar.
 *
 * Happilee surface tokens:
 *   - bar bg          : bg-ui-bg-base (#ffffff)
 *   - bar border-top  : border-ui-border-base
 *   - shadow          : shadow-hap-md (floating)
 *   - Primary CTA     : same brand-solid pattern as desktop
 *   - Variant chooser : white outlined card pattern
 *   - Modal panel     : bg-ui-bg-base rounded-xl, shadow-hap-md, backdrop blur
 */
type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  options: Record<string, string | undefined>
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
}) => {
  const { state, open, close } = useToggleState()

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  const isSimple = isSimpleProduct(product)
  const isOnSale = selectedPrice?.price_type === "sale"

  return (
    <>
      <div
        className={clx("large:hidden inset-x-0 bottom-0 fixed z-50", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-in-out duration-hap-slow"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-hap-slow"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="bg-ui-bg-base border-t border-ui-border-base shadow-hap-md flex flex-col gap-md justify-center items-stretch p-lg w-full"
            data-testid="mobile-actions"
          >
            <div className="flex items-center justify-between gap-md">
              <span
                className="text-sm font-medium text-ui-fg-base truncate"
                data-testid="mobile-title"
              >
                {product.title}
              </span>
              {selectedPrice ? (
                <div className="flex items-baseline gap-sm shrink-0">
                  {isOnSale && (
                    <span className="line-through text-xs text-ui-fg-muted">
                      {selectedPrice.original_price}
                    </span>
                  )}
                  <span
                    className={clx("text-sm font-semibold", {
                      "text-hap-status-active-text": isOnSale,
                      "text-brand-secondary-text": !isOnSale,
                    })}
                  >
                    {selectedPrice.calculated_price}
                  </span>
                </div>
              ) : null}
            </div>

            <div
              className={clx("grid grid-cols-2 w-full gap-md", {
                "!grid-cols-1": isSimple,
              })}
            >
              {!isSimple && (
                <button
                  type="button"
                  onClick={open}
                  className="inline-flex items-center justify-between h-11 px-lg rounded-md bg-ui-bg-base border border-ui-border-base text-sm font-medium text-ui-fg-base shadow-hap-xs hover:bg-ui-bg-subtle-hover transition-colors duration-hap-fast"
                  data-testid="mobile-actions-button"
                >
                  <span className="truncate">
                    {variant
                      ? Object.values(options).join(" / ")
                      : "Select Options"}
                  </span>
                  <ChevronDown />
                </button>
              )}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock || !variant}
                className={clx(
                  "brand-solid inline-flex items-center justify-center h-11 px-lg rounded-md",
                  "bg-brand-solid text-white text-sm font-semibold",
                  "shadow-hap-xs-skeuomorphic transition-colors duration-hap-fast",
                  "hover:bg-brand-secondary-text",
                  "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-brand-solid"
                )}
                data-testid="mobile-cart-button"
                aria-busy={isAdding}
              >
                {isAdding ? (
                  <span
                    className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-sm"
                    aria-hidden="true"
                  />
                ) : null}
                {!variant
                  ? "Select variant"
                  : !inStock
                  ? "Out of stock"
                  : "Add to cart"}
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-hap-slow"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-hap-normal"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-ui-fg-base/30 backdrop-blur-hap-md" />
          </Transition.Child>

          <div className="fixed bottom-0 inset-x-0">
            <div className="flex min-h-full h-full items-end justify-center text-left">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-hap-slow"
                enterFrom="opacity-0 translate-y-md"
                enterTo="opacity-100 translate-y-0"
                leave="ease-in duration-hap-normal"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-md"
              >
                <Dialog.Panel
                  className="w-full flex flex-col gap-md"
                  data-testid="mobile-actions-modal"
                >
                  <div className="w-full flex justify-end pr-lg">
                    <button
                      type="button"
                      onClick={close}
                      className="bg-ui-bg-base w-12 h-12 rounded-full border border-ui-border-base text-ui-fg-base shadow-hap-sm flex justify-center items-center hover:bg-ui-bg-subtle-hover transition-colors duration-hap-fast"
                      data-testid="close-modal-button"
                      aria-label="Close"
                    >
                      <X />
                    </button>
                  </div>
                  <div className="bg-ui-bg-base rounded-t-xl px-xl py-3xl shadow-hap-md">
                    {(product.variants?.length ?? 0) > 1 && (
                      <div className="flex flex-col gap-xl">
                        {(product.options || []).map((option) => (
                          <div key={option.id}>
                            <OptionSelect
                              option={option}
                              current={options[option.id]}
                              updateOption={updateOptions}
                              title={option.title ?? ""}
                              disabled={optionsDisabled}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileActions
