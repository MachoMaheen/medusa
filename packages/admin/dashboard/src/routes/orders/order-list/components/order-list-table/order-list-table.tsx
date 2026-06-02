/**
 * Wave 2.1 — OrderListTable re-skinned to Happilee v3.
 *
 * Layout grammar (spec §4.4):
 *   - Page header row: page title (Heading) on the left, secondary action
 *     (Export) on the right. Title font + color is governed by the canonical
 *     ui-* tokens (Heading already maps to text-ui-fg-base = #181d27).
 *   - Container surface: white card on the page bg-secondary (#fafafa) shell
 *     background — matches the Happilee "card floats over fafafa" rule.
 *   - Secondary CTA uses HappileeButton (secondary variant) — white surface,
 *     border-primary border, brand-secondary-text label.
 *   - Brand blue (#4d68dc) is reserved for the primary CTA + brand mark only;
 *     the Export action is intentionally NOT a primary fill.
 */
import { Container, Heading } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Link, Outlet, useLocation } from "react-router-dom"

import { HappileeButton } from "../../../../../components/common/happilee-button/happilee-button"
import { _DataTable } from "../../../../../components/table/data-table/data-table"
import { useOrders } from "../../../../../hooks/api/orders"
import { useOrderTableColumns } from "../../../../../hooks/table/columns/use-order-table-columns"
import { useOrderTableQuery } from "../../../../../hooks/table/query/use-order-table-query"
import { useDataTable } from "../../../../../hooks/use-data-table"

import { DEFAULT_FIELDS } from "../../const"
import { useOrderTableFilters } from "../../../../../hooks/table/filters"

const PAGE_SIZE = 20

export const OrderListTable = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const { searchParams, raw } = useOrderTableQuery({
    pageSize: PAGE_SIZE,
  })

  const { orders, count, isError, error, isLoading } = useOrders(
    {
      fields: DEFAULT_FIELDS,
      ...searchParams,
    },
    {
      placeholderData: keepPreviousData,
    }
  )

  const filters = useOrderTableFilters()
  const columns = useOrderTableColumns({})

  const { table } = useDataTable({
    data: orders ?? [],
    columns,
    enablePagination: true,
    count,
    pageSize: PAGE_SIZE,
  })

  if (isError) {
    throw error
  }

  return (
    <Container
      data-happilee-surface="orders-list"
      className="divide-y divide-ui-border-menu-bot rounded-xl border border-ui-border-menu-bot bg-ui-bg-base p-0 shadow-hap-xs"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <Heading className="font-sans text-lg font-semibold text-ui-fg-base">
          {t("orders.domain")}
        </Heading>
        <HappileeButton variant="secondary" size="sm" asChild>
          <Link to={`export${location.search}`}>{t("actions.export")}</Link>
        </HappileeButton>
      </div>
      <_DataTable
        columns={columns}
        table={table}
        pagination
        navigateTo={(row) => `/orders/${row.original.id}`}
        filters={filters}
        count={count}
        search
        isLoading={isLoading}
        pageSize={PAGE_SIZE}
        orderBy={[
          { key: "display_id", label: t("orders.fields.displayId") },
          { key: "created_at", label: t("fields.createdAt") },
          { key: "updated_at", label: t("fields.updatedAt") },
        ]}
        queryObject={raw}
        noRecords={{
          message: t("orders.list.noRecordsMessage"),
        }}
      />
      <Outlet />
    </Container>
  )
}
