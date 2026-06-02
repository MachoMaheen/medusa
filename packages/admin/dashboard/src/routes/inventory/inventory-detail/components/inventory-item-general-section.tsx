/**
 * Wave 2.4 — Inventory item general section.
 *
 * The card chrome and heading row are re-skinned to Happilee v3. The legacy
 * Medusa `Container` is replaced by a rounded-xl white card surface, the
 * heading uses Inter at 16/24 semibold, and the inline "in-stock" stat shows
 * a HappileeBadge (stock semantic — green/amber/red).
 *
 * Token discipline: every visual class resolves through the Medusa preset
 * `ui-*` tokens or the `hap-status-*` Tailwind extensions on HappileeBadge.
 * No raw hex literals appear in this file.
 */
import { HttpTypes } from "@medusajs/types"
import { PencilSquare } from "@medusajs/icons"
import { useTranslation } from "react-i18next"

import { ActionMenu } from "../../../../components/common/action-menu"
import { SectionRow } from "../../../../components/common/section"
import {
  HappileeBadge,
  type HappileeBadgeVariant,
} from "../../../../components/common/happilee-badge/happilee-badge"

type InventoryItemGeneralSectionProps = {
  inventoryItem: HttpTypes.AdminInventoryItemResponse["inventory_item"]
}

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

export const InventoryItemGeneralSection = ({
  inventoryItem,
}: InventoryItemGeneralSectionProps) => {
  const { t } = useTranslation()

  const getQuantityFormat = (quantity: number) => {
    if (quantity !== undefined && !isNaN(quantity)) {
      return t("inventory.quantityAcrossLocations", {
        quantity,
        locations: inventoryItem.location_levels?.length,
      })
    }

    return "-"
  }

  const stocked = inventoryItem.stocked_quantity
  const reserved = inventoryItem.reserved_quantity
  const available = (stocked ?? 0) - (reserved ?? 0)

  return (
    <div
      data-happilee-section=""
      className="bg-ui-bg-base border border-ui-border-menu-bot rounded-xl overflow-hidden font-sans divide-y divide-ui-border-menu-bot"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-base font-semibold leading-6 text-ui-fg-base truncate">
            {inventoryItem.title ?? inventoryItem.sku} {t("fields.details")}
          </h2>
          {typeof stocked === "number" && !Number.isNaN(stocked) ? (
            <HappileeBadge variant={stockVariantFor(stocked)}>
              {stocked > 0
                ? stocked <= LOW_STOCK_THRESHOLD
                  ? t("inventory.lowStock", { defaultValue: "Low stock" })
                  : t("inventory.inStock", { defaultValue: "In stock" })
                : t("inventory.outOfStock", { defaultValue: "Out of stock" })}
            </HappileeBadge>
          ) : null}
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: t("actions.edit"),
                  to: "edit",
                },
              ],
            },
          ]}
        />
      </div>
      <SectionRow title={t("fields.sku")} value={inventoryItem.sku ?? "-"} />
      <SectionRow
        title={t("fields.inStock")}
        value={getQuantityFormat(stocked)}
      />
      <SectionRow
        title={t("inventory.reserved")}
        value={getQuantityFormat(reserved)}
      />
      <SectionRow
        title={t("inventory.available")}
        value={getQuantityFormat(available)}
      />
    </div>
  )
}
