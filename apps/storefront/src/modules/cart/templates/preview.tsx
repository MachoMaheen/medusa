"use client"

import { clx } from "@medusajs/ui"

import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import Item from "@modules/cart/components/item"

type ItemsTemplateProps = {
  cart: HttpTypes.StoreCart
}

/**
 * Happilee Commerce — Mini-cart preview list (used in the topbar dropdown).
 *
 * Renders the same compact `Item type="preview"` row used elsewhere in
 * the Happilee shell — divided by border-ui-border-menu-bot, scrollable
 * when content exceeds the visible drawer area.
 *
 * The skeleton state is inlined (not imported from the legacy
 * `@modules/skeletons/...` Table.Row variant) so the markup stays inside
 * the `<ul>` list container shape.
 */
const ItemsPreviewTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart.items
  const hasOverflow = items && items.length > 4
  const sorted = items
    ? [...items].sort((a, b) =>
        (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
      )
    : null

  return (
    <div
      className={clx("flex flex-col", {
        "max-h-[420px] overflow-y-auto overflow-x-hidden no-scrollbar":
          hasOverflow,
      })}
      data-testid="items-table"
    >
      <ul className="divide-y divide-ui-border-menu-bot">
        {sorted
          ? sorted.map((item) => (
              <li key={item.id}>
                <Item
                  item={item}
                  type="preview"
                  currencyCode={cart.currency_code}
                />
              </li>
            ))
          : repeat(3).map((i) => (
              <li
                key={i}
                className="flex items-start gap-x-4 px-4 py-4"
              >
                <div
                  className={
                    "h-16 w-16 shrink-0 animate-pulse rounded-md " +
                    "bg-ui-bg-subtle-hover"
                  }
                />
                <div className="flex flex-1 flex-col gap-y-2">
                  <div
                    className="h-3 w-32 animate-pulse rounded bg-ui-bg-subtle-hover"
                  />
                  <div
                    className="h-3 w-20 animate-pulse rounded bg-ui-bg-subtle-hover"
                  />
                </div>
              </li>
            ))}
      </ul>
    </div>
  )
}

export default ItemsPreviewTemplate
