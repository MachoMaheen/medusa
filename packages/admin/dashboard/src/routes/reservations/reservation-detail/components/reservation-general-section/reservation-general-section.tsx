/**
 * Wave 2.4 — Reservation detail general section.
 *
 * Re-skins the panel chrome. Heading row uses Inter 16/24 semibold; the
 * "Available at location" stat surfaces a HappileeBadge so stock status is
 * visually consistent with the inventory detail page.
 *
 * Token discipline: all tokens via Medusa preset `ui-*` + HappileeBadge
 * `hap-status-*`. No raw hex literals in this file.
 */
import { AdminReservationResponse } from "@medusajs/types"

import { ActionMenu } from "../../../../../components/common/action-menu"
import { PencilSquare } from "@medusajs/icons"
import { SectionRow } from "../../../../../components/common/section"
import {
  HappileeBadge,
  type HappileeBadgeVariant,
} from "../../../../../components/common/happilee-badge/happilee-badge"
import { useInventoryItem } from "../../../../../hooks/api/inventory"
import { useStockLocation } from "../../../../../hooks/api/stock-locations"
import { useTranslation } from "react-i18next"

type ReservationGeneralSectionProps = {
  reservation: AdminReservationResponse["reservation"]
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

export const ReservationGeneralSection = ({
  reservation,
}: ReservationGeneralSectionProps) => {
  const { t } = useTranslation()

  const { inventory_item: inventoryItem, isPending: isLoadingInventoryItem } =
    useInventoryItem(reservation.inventory_item_id)

  const { stock_location: location, isPending: isLoadingLocation } =
    useStockLocation(reservation.location_id)

  if (
    isLoadingInventoryItem ||
    !inventoryItem ||
    isLoadingLocation ||
    !location
  ) {
    return (
      <div
        data-happilee-section-loading=""
        className="bg-ui-bg-base border border-ui-border-menu-bot rounded-xl px-6 py-4 text-sm text-ui-fg-muted font-sans"
      >
        {t("general.loading", { defaultValue: "Loading..." })}
      </div>
    )
  }

  const locationLevel = inventoryItem.location_levels!.find(
    (l) => l.location_id === reservation.location_id
  )

  const available = locationLevel?.available_quantity

  return (
    <div
      data-happilee-section=""
      className="bg-ui-bg-base border border-ui-border-menu-bot rounded-xl overflow-hidden font-sans divide-y divide-ui-border-menu-bot"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-base font-semibold leading-6 text-ui-fg-base truncate">
            {t("inventory.reservation.header", {
              itemName: inventoryItem.title ?? inventoryItem.sku,
            })}
          </h2>
          {typeof available === "number" ? (
            <HappileeBadge variant={stockVariantFor(available)}>
              {available > 0
                ? available <= LOW_STOCK_THRESHOLD
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
                  to: `edit`,
                },
              ],
            },
          ]}
        />
      </div>
      <SectionRow
        title={t("inventory.reservation.lineItemId")}
        value={reservation.line_item_id}
      />
      <SectionRow
        title={t("inventory.reservation.description")}
        value={reservation.description}
      />
      <SectionRow
        title={t("inventory.reservation.location")}
        value={location?.name}
      />
      <SectionRow
        title={t("inventory.reservation.inStockAtLocation")}
        value={locationLevel?.stocked_quantity}
      />
      <SectionRow
        title={t("inventory.reservation.availableAtLocation")}
        value={locationLevel?.available_quantity}
      />
      <SectionRow
        title={t("inventory.reservation.reservedAtLocation")}
        value={locationLevel?.reserved_quantity}
      />
    </div>
  )
}
