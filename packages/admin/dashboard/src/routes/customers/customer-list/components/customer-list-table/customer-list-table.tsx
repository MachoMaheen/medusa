import { PencilSquare } from "@medusajs/icons"
import { Heading } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { HttpTypes } from "@medusajs/types"
import {
  Action,
  ActionMenu,
} from "../../../../../components/common/action-menu"
import HappileeCard from "../../../../../components/common/happilee-card/happilee-card"
import { HappileeButton } from "../../../../../components/common/happilee-button/happilee-button"
import { PermissionGuard } from "../../../../../components/common/permission-guard"
import { _DataTable } from "../../../../../components/table/data-table"
import { useCustomers } from "../../../../../hooks/api/customers"
import { useCustomerTableColumns } from "../../../../../hooks/table/columns/use-customer-table-columns"
import { useCustomerTableFilters } from "../../../../../hooks/table/filters/use-customer-table-filters"
import { useCustomerTableQuery } from "../../../../../hooks/table/query/use-customer-table-query"
import { useDataTable } from "../../../../../hooks/use-data-table"
import { usePermissions } from "../../../../../providers/permissions-provider"

const PAGE_SIZE = 20

export const CustomerListTable = () => {
  const { t } = useTranslation()

  const { searchParams, raw } = useCustomerTableQuery({ pageSize: PAGE_SIZE })
  const { customers, count, isLoading, isError, error } = useCustomers(
    {
      ...searchParams,
    },
    {
      placeholderData: keepPreviousData,
    }
  )

  const filters = useCustomerTableFilters()
  const columns = useColumns()

  const { table } = useDataTable({
    data: customers ?? [],
    columns,
    count,
    enablePagination: true,
    getRowId: (row) => row.id,
    pageSize: PAGE_SIZE,
  })

  if (isError) {
    throw error
  }

  // Wave 2.3 — Customer list shell:
  //   The HappileeCard primitive paints the canonical Happilee surface
  //   (bg-ui-bg-base / border-ui-border-menu-bot / rounded-xl / shadow-hap-xs).
  //   The list view is a tall stacked frame, so we override the primitive's
  //   defaults that target the smaller automation-tile use-case:
  //     - p-0          : the inner data-table provides its own padding
  //     - min-h-0      : disable the 140px min-height (list is tall already)
  //     - gap-0        : sections are separated by Medusa's `divide-y` lines
  //     - divide-y     : 1px dividers between the heading band and the table
  //   All tokens trace back to the canonical map at
  //   `.agent-os/decisions/2026-06-02-canonical-token-map.md` — no raw hex.
  return (
    <HappileeCard className="divide-ui-border-menu-bot min-h-0 gap-0 divide-y overflow-hidden p-0">
      <div
        data-testid="customers-list-header"
        className="flex items-center justify-between px-6 py-4"
      >
        <Heading className="text-ui-fg-base">{t("customers.domain")}</Heading>
        <PermissionGuard resource="customer" operation="create">
          <Link to="/customers/create">
            <HappileeButton size="sm" variant="secondary">
              {t("actions.create")}
            </HappileeButton>
          </Link>
        </PermissionGuard>
      </div>
      <_DataTable
        table={table}
        columns={columns}
        pageSize={PAGE_SIZE}
        count={count}
        filters={filters}
        orderBy={[
          { key: "email", label: t("fields.email") },
          { key: "first_name", label: t("fields.firstName") },
          { key: "last_name", label: t("fields.lastName") },
          { key: "has_account", label: t("customers.hasAccount") },
          { key: "created_at", label: t("fields.createdAt") },
          { key: "updated_at", label: t("fields.updatedAt") },
        ]}
        isLoading={isLoading}
        navigateTo={(row) => row.original.id}
        search
        queryObject={raw}
        noRecords={{
          message: t("customers.list.noRecordsMessage"),
        }}
      />
    </HappileeCard>
  )
}

const CustomerActions = ({
  customer,
}: {
  customer: HttpTypes.AdminCustomer
}) => {
  const { t } = useTranslation()
  const { can } = usePermissions()

  const actions: Action[] = []

  if (can("customer", "update")) {
    actions.push({
      icon: <PencilSquare />,
      label: t("actions.edit"),
      to: `/customers/${customer.id}/edit`,
    })
  }

  if (!actions.length) {
    return null
  }

  return (
    <ActionMenu
      groups={[
        {
          actions,
        },
      ]}
    />
  )
}

const columnHelper = createColumnHelper<HttpTypes.AdminCustomer>()

const useColumns = () => {
  const columns = useCustomerTableColumns()

  return useMemo(
    () => [
      ...columns,
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => <CustomerActions customer={row.original} />,
      }),
    ],
    [columns]
  )
}
