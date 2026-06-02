import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"

import Item from "@modules/cart/components/item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

/**
 * Happilee Commerce — cart line-items column.
 *
 * Renders as a single Happilee card (`bg-ui-bg-base` surface, rounded-xl,
 * border-ui-border-base, shadow-hap-xs) containing a vertical stack of
 * line items separated by subtle dividers (`border-ui-border-menu-bot`).
 *
 * Skeleton state mirrors the same row shape so the layout never jumps.
 * The skeleton is inlined here (rather than importing
 * `@modules/skeletons/components/skeleton-line-item`) because the legacy
 * skeleton emits `Table.Row` markup, incompatible with the new `<ul>`
 * list container.
 */
const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  const sorted = items
    ? [...items].sort((a, b) =>
        (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
      )
    : null

  return (
    <div
      className={
        "rounded-xl border border-ui-border-base bg-ui-bg-base " +
        "shadow-hap-xs overflow-hidden"
      }
    >
      <div
        className={
          "flex items-center justify-between border-b border-ui-border-menu-bot " +
          "px-6 py-4"
        }
      >
        <h2 className="font-sans text-lg font-semibold text-ui-fg-base">
          Items
        </h2>
        {sorted && (
          <span
            className="font-sans text-sm font-medium text-ui-fg-muted"
            data-testid="cart-item-count"
          >
            {sorted.length} {sorted.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>
      <ul className="divide-y divide-ui-border-menu-bot">
        {sorted
          ? sorted.map((item) => (
              <li key={item.id}>
                <Item item={item} currencyCode={cart?.currency_code} />
              </li>
            ))
          : repeat(3).map((i) => (
              <li
                key={i}
                className="flex items-center gap-x-4 px-6 py-5"
              >
                <div
                  className={
                    "h-24 w-24 shrink-0 animate-pulse rounded-md " +
                    "bg-ui-bg-subtle-hover"
                  }
                />
                <div className="flex flex-1 flex-col gap-y-2">
                  <div
                    className="h-4 w-32 animate-pulse rounded bg-ui-bg-subtle-hover"
                  />
                  <div
                    className="h-3 w-24 animate-pulse rounded bg-ui-bg-subtle-hover"
                  />
                </div>
                <div className="h-10 w-16 animate-pulse rounded bg-ui-bg-subtle-hover" />
              </li>
            ))}
      </ul>
    </div>
  )
}

export default ItemsTemplate
