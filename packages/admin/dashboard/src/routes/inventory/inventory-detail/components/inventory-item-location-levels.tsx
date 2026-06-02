/**
 * Wave 2.4 — Inventory item location levels section.
 *
 * Re-skins the panel that frames the per-location stock table (dense tabular
 * data). The header row is re-painted with Happilee v3 tokens and the
 * "Manage locations" action uses HappileeButton (secondary variant).
 *
 * Token discipline: see `.agent-os/decisions/2026-06-02-canonical-token-map.md`.
 * No raw hex literals appear in this file.
 */
import { HttpTypes } from "@medusajs/types"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ItemLocationListTable } from "./location-levels-table/location-list-table"
import { HappileeButton } from "../../../../components/common/happilee-button/happilee-button"

type InventoryItemLocationLevelsSectionProps = {
  inventoryItem: HttpTypes.AdminInventoryItemResponse["inventory_item"]
}

export const InventoryItemLocationLevelsSection = ({
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
          {t("inventory.locationLevels")}
        </h2>
        <HappileeButton variant="secondary" size="sm" asChild>
          <Link to="locations">{t("inventory.manageLocations")}</Link>
        </HappileeButton>
      </div>
      <ItemLocationListTable inventory_item_id={inventoryItem.id} />
    </div>
  )
}
