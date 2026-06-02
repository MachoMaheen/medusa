/**
 * Wave 2.4 — Inventory item reservations panel.
 *
 * Re-skinned chrome only — the inner ReservationItemTable is left untouched
 * (it consumes the global DataTable primitive, out of scope for Wave 2.4).
 *
 * Token discipline: only Medusa preset `ui-*` classes here; the secondary
 * button uses HappileeButton which itself enforces tokens. No raw hex.
 */
import { HttpTypes } from "@medusajs/types"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ReservationItemTable } from "./reservations-table/reservation-list-table"
import { HappileeButton } from "../../../../components/common/happilee-button/happilee-button"

type InventoryItemLocationLevelsSectionProps = {
  inventoryItem: HttpTypes.AdminInventoryItemResponse["inventory_item"]
}

export const InventoryItemReservationsSection = ({
  inventoryItem,
}: InventoryItemLocationLevelsSectionProps) => {
  const { t } = useTranslation()

  return (
    <div
      data-happilee-section=""
      className="bg-ui-bg-base border border-ui-border-menu-bot rounded-xl overflow-hidden font-sans divide-y divide-ui-border-menu-bot"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-base font-semibold leading-6 text-ui-fg-base">
          {t("reservations.domain")}
        </h2>
        <HappileeButton variant="secondary" size="sm" asChild>
          <Link to={`/reservations/create?item_id=${inventoryItem.id}`}>
            {t("actions.create")}
          </Link>
        </HappileeButton>
      </div>
      <ReservationItemTable inventoryItem={inventoryItem} />
    </div>
  )
}
