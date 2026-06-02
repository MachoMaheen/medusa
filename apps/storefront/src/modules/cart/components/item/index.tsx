"use client"

import { clx } from "@medusajs/ui"
import { useState } from "react"

import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

/**
 * Happilee Commerce — single cart line item.
 *
 * `full` (cart page) — Happilee row grammar:
 *   thumbnail (left) │ name + variant (center) │ qty stepper + price + delete (right)
 * `preview` (mini-cart) — compact row with inline qty × unit-price chip.
 *
 * The row lives inside an `<li>` inside `<ul class="divide-y …">` so it does
 * not own its own border. The divide stroke is `border-ui-border-menu-bot`
 * per the canonical token map.
 */
const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  if (type === "preview") {
    return (
      <div
        className="flex items-start gap-x-4 px-4 py-4"
        data-testid="product-row"
      >
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="block w-16 shrink-0"
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>

        <div className="flex flex-1 flex-col gap-y-1">
          <span
            className={
              "font-sans text-sm font-medium text-ui-fg-base line-clamp-1"
            }
            data-testid="product-title"
          >
            {item.product_title}
          </span>
          <LineItemOptions
            variant={item.variant}
            data-testid="product-variant"
          />
        </div>

        <div className="flex flex-col items-end gap-y-1">
          <span className="flex items-center gap-x-1 font-sans text-xs text-ui-fg-muted">
            <span>{item.quantity}×</span>
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={clx(
        "flex flex-col gap-y-4 px-6 py-5",
        "small:flex-row small:items-center small:gap-x-6"
      )}
      data-testid="product-row"
    >
      <LocalizedClientLink
        href={`/products/${item.product_handle}`}
        className="block w-24 shrink-0"
      >
        <Thumbnail
          thumbnail={item.thumbnail}
          images={item.variant?.product?.images}
          size="square"
        />
      </LocalizedClientLink>

      <div className="flex flex-1 flex-col gap-y-1">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={
            "font-sans text-base font-medium text-ui-fg-base hover:text-brand-secondary-text"
          }
          data-testid="product-title"
        >
          {item.product_title}
        </LocalizedClientLink>
        <LineItemOptions
          variant={item.variant}
          data-testid="product-variant"
        />
        <span className="font-sans text-sm text-ui-fg-muted">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </div>

      <div
        className={
          "flex items-center gap-x-4 small:flex-col small:items-end small:gap-y-3"
        }
      >
        <div className="flex items-center gap-x-2">
          <DeleteButton id={item.id} data-testid="product-delete-button" />
          <CartItemSelect
            value={item.quantity}
            onChange={(value) =>
              changeQuantity(parseInt(value.target.value))
            }
            className="h-10 w-16"
            data-testid="product-select-button"
          >
            {Array.from(
              { length: Math.min(maxQuantity, 10) },
              (_, i) => (
                <option value={i + 1} key={i}>
                  {i + 1}
                </option>
              )
            )}
          </CartItemSelect>
          {updating && <Spinner />}
        </div>
        <span className="font-sans text-base font-semibold text-ui-fg-base">
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </div>

      {error && (
        <div className="small:absolute small:right-6 small:bottom-2">
          <ErrorMessage error={error} data-testid="product-error-message" />
        </div>
      )}
    </div>
  )
}

export default Item
