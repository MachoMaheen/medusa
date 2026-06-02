/**
 * Wave 2.4 — Reservation list page header.
 *
 * Re-skins the page chrome around the global `_DataTable`. Heading band
 * follows the canonical Happilee v3 card pattern (white surface, rounded-xl,
 * Inter typography) and the primary action becomes a HappileeButton.
 *
 * Token discipline: classes route through the Medusa `ui-*` preset (pinned
 * to Happilee values in `src/styles/happilee-tokens.css`). No raw hex.
 */
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { _DataTable } from "../../../../../components/table/data-table"
import { HappileeButton } from "../../../../../components/common/happilee-button/happilee-button"
import { useReservationItems } from "../../../../../hooks/api/reservations"
import { useDataTable } from "../../../../../hooks/use-data-table"
import { useReservationTableColumns } from "./use-reservation-table-columns"
import { useReservationTableFilters } from "./use-reservation-table-filters"
import { useReservationTableQuery } from "./use-reservation-table-query"

const PAGE_SIZE = 20

export const ReservationListTable = () => {
  const { t } = useTranslation()

  const { searchParams } = useReservationTableQuery({
    pageSize: PAGE_SIZE,
  })
  const { reservations, count, isPending, isError, error } =
    useReservationItems({
      ...searchParams,
    })

  const filters = useReservationTableFilters()
  const columns = useReservationTableColumns()

  const { table } = useDataTable({
    data: reservations || [],
    columns,
    count,
    enablePagination: true,
    getRowId: (row) => row.id,
    pageSize: PAGE_SIZE,
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
            {t("reservations.domain")}
          </h1>
          <p className="text-sm leading-5 text-ui-fg-muted">
            {t("reservations.subtitle")}
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
        isLoading={isPending}
        filters={filters}
        pagination
        navigateTo={(row) => row.id}
        search={false}
      />
    </div>
  )
}
