/**
 * Wave 2.4 — Inventory list table columns.
 *
 * The "In stock" cell now renders a HappileeBadge whose variant maps to a
 * stock-status semantic per `.agent-os/decisions/2026-06-02-canonical-token-map.md`:
 *
 *   - quantity == 0          → variant "paused"  (out of stock — red-ish)
 *   - 0 < quantity <= 10     → variant "draft"   (low stock — amber/grey)
 *   - quantity > 10          → variant "active"  (in stock — green)
 *
 * Threshold of 10 is the project-wide default "low stock" warning level used
 * across Medusa's inventory analytics. If a per-item reorder point becomes
 * available on `AdminInventoryItem` in a future upstream release, swap the
 * literal for `item.reorder_point` then.
 *
 * Token discipline: all visuals come from `HappileeBadge` (which itself uses
 * the `hap-status-*` Tailwind extensions). No raw hex literals in this file.
 */
import { AdminInventoryItem } from "@medusajs/types"

import { Checkbox } from "@medusajs/ui"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { PlaceholderCell } from "../../../../components/table/table-cells/common/placeholder-cell"
import {
  HappileeBadge,
  type HappileeBadgeVariant,
} from "../../../../components/common/happilee-badge/happilee-badge"
import { InventoryActions } from "./inventory-actions"

const LOW_STOCK_THRESHOLD = 10

const stockVariantFor = (quantity: number): HappileeBadgeVariant => {
  if (quantity <= 0) {
    return "paused"
  }
  if (quantity <= LOW_STOCK_THRESHOLD) {
    return "draft"
  }
  return "active"
}

const columnHelper = createColumnHelper<AdminInventoryItem>()

export const useInventoryTableColumns = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => {
          return (
            <Checkbox
              checked={
                table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : table.getIsAllPageRowsSelected()
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
            />
          )
        },
        cell: ({ row }) => {
          return (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              onClick={(e) => {
                e.stopPropagation()
              }}
            />
          )
        },
      }),
      columnHelper.accessor("title", {
        header: t("fields.title"),
        cell: ({ getValue }) => {
          const title = getValue()

          if (!title) {
            return <PlaceholderCell />
          }

          return (
            <div className="flex size-full items-center overflow-hidden">
              <span className="truncate text-ui-fg-base">{title}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor("sku", {
        header: t("fields.sku"),
        cell: ({ getValue }) => {
          const sku = getValue() as string

          if (!sku) {
            return <PlaceholderCell />
          }

          return (
            <div className="flex size-full items-center overflow-hidden">
              <span className="truncate text-ui-fg-muted">{sku}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor("reserved_quantity", {
        header: t("inventory.reserved"),
        cell: ({ getValue }) => {
          const quantity = getValue()

          if (Number.isNaN(quantity)) {
            return <PlaceholderCell />
          }

          return (
            <div className="flex size-full items-center overflow-hidden">
              <span className="truncate text-ui-fg-base">{quantity}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor("stocked_quantity", {
        header: t("fields.inStock"),
        cell: ({ getValue }) => {
          const quantity = getValue()

          if (typeof quantity !== "number" || Number.isNaN(quantity)) {
            return <PlaceholderCell />
          }

          return (
            <div className="flex size-full items-center overflow-hidden">
              <HappileeBadge variant={stockVariantFor(quantity)}>
                {quantity}
              </HappileeBadge>
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => <InventoryActions item={row.original} />,
      }),
    ],
    [t]
  )
}
