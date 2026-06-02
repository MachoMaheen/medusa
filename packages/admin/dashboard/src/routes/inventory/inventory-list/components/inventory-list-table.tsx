/**
 * Wave 2.4 — Inventory list page header.
 *
 * The page chrome is re-skinned to Happilee v3 — a rounded-xl white card
 * surface (`bg-ui-bg-base`) framing the page title, subtitle, and primary
 * action button. The underlying `_DataTable` is left intact because it is a
 * global primitive (out of scope for Wave 2.4 — see Wave 1 audit). The page
 * action button is swapped to `HappileeButton` (secondary variant) per
 * `references/components.md` § Buttons.
 *
 * Token discipline — every Tailwind class below traces back to either:
 *   - the Medusa preset `ui-*` tokens (pinned to Happilee values in
 *     `src/styles/happilee-tokens.css`) per
 *     `.agent-os/decisions/2026-06-02-canonical-token-map.md`
 *   - or `font-sans` / Tailwind spacing scale.
 * No raw hex literals appear in this file.
 */
import { RowSelectionState } from "@tanstack/react-table"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { _DataTable } from "../../../../components/table/data-table"
import { HappileeButton } from "../../../../components/common/happilee-button/happilee-button"
import { useInventoryItems } from "../../../../hooks/api/inventory"
import { useDataTable } from "../../../../hooks/use-data-table"
import { INVENTORY_ITEM_IDS_KEY } from "../../common/constants"
import { useInventoryTableColumns } from "./use-inventory-table-columns"
import { useInventoryTableFilters } from "./use-inventory-table-filters"
import { useInventoryTableQuery } from "./use-inventory-table-query"

const PAGE_SIZE = 20

export const InventoryListTable = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [selection, setSelection] = useState<RowSelectionState>({})

  const { searchParams, raw } = useInventoryTableQuery({
    pageSize: PAGE_SIZE,
  })

  const {
    inventory_items,
    count,
    isPending: isLoading,
    isError,
    error,
  } = useInventoryItems({
    ...searchParams,
  })

  const filters = useInventoryTableFilters()
  const columns = useInventoryTableColumns()

  const { table } = useDataTable({
    data: inventory_items,
    columns,
    count,
    enablePagination: true,
    getRowId: (row) => row.id,
    pageSize: PAGE_SIZE,
    enableRowSelection: true,
    rowSelection: {
      state: selection,
      updater: setSelection,
    },
  })

  if (isError) {
    throw error
  }

  return (
    <div
      data-happilee-page-shell=""
      className="bg-ui-bg-base border border-ui-border-menu-bot rounded-xl overflow-hidden font-sans"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-menu-bot">
        <div className="flex flex-col gap-1">
          <h1 className="text-base font-semibold leading-6 text-ui-fg-base">
            {t("inventory.domain")}
          </h1>
          <p className="text-sm leading-5 text-ui-fg-muted">
            {t("inventory.subtitle")}
          </p>
        </div>
        <HappileeButton variant="secondary" size="sm" asChild>
          <Link to="create">{t("actions.create")}</Link>
        </HappileeButton>
      </div>
      <_DataTable
        table={table}
        columns={columns}
        pageSize={PAGE_SIZE}
        count={count}
        isLoading={isLoading}
        pagination
        search
        filters={filters}
        queryObject={raw}
        orderBy={[
          { key: "title", label: t("fields.title") },
          { key: "sku", label: t("fields.sku") },
          { key: "stocked_quantity", label: t("fields.inStock") },
          { key: "reserved_quantity", label: t("inventory.reserved") },
        ]}
        navigateTo={(row) => `${row.id}`}
        commands={[
          {
            action: async (selection) => {
              navigate(
                `stock?${INVENTORY_ITEM_IDS_KEY}=${Object.keys(selection).join(
                  ","
                )}`
              )
            },
            label: t("inventory.stock.action"),
            shortcut: "i",
          },
        ]}
      />
    </div>
  )
}
