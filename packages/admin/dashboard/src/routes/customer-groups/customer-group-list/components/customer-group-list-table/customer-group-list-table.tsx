import { PencilSquare, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { createDataTableColumnHelper, toast, usePrompt } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import HappileeCard from "../../../../../components/common/happilee-card/happilee-card"
import { DataTable } from "../../../../../components/data-table"
import { useDataTableDateFilters } from "../../../../../components/data-table/helpers/general/use-data-table-date-filters"
import { SingleColumnPage } from "../../../../../components/layout/pages"
import {
  useCustomerGroups,
  useDeleteCustomerGroupLazy,
} from "../../../../../hooks/api"
import { useDate } from "../../../../../hooks/use-date"
import { useQueryParams } from "../../../../../hooks/use-query-params"
import { useExtension } from "../../../../../providers/extension-provider"

const PAGE_SIZE = 10

export const CustomerGroupListTable = () => {
  const { t } = useTranslation()
  const { getWidgets } = useExtension()

  const { q, order, offset, created_at, updated_at } = useQueryParams([
    "q",
    "order",
    "offset",
    "created_at",
    "updated_at",
  ])

  const columns = useColumns()
  const filters = useFilters()

  const { customer_groups, count, isPending, isError, error } =
    useCustomerGroups(
      {
        q,
        order,
        offset: offset ? parseInt(offset) : undefined,
        limit: PAGE_SIZE,
        created_at: created_at ? JSON.parse(created_at) : undefined,
        updated_at: updated_at ? JSON.parse(updated_at) : undefined,
        fields: "id,name,created_at,updated_at,customers.id",
      },
      {
        placeholderData: keepPreviousData,
      }
    )

  if (isError) {
    throw error
  }

  return (
    <SingleColumnPage
      widgets={{
        before: getWidgets("customer_group.list.before"),
        after: getWidgets("customer_group.list.after"),
      }}
    >
      {/*
        Wave 2.3 — Customer-groups list shell.
        The brief proposed an automation-grid-style HappileeCard layout, but
        customer groups in Medusa carry tabular data (name + count + dates +
        actions) that doesn't fit a tile. We keep the DataTable for parity and
        wrap it in a HappileeCard whose Wave 1 tokens give the surface the
        Happilee look (white bg, rounded-xl, subtle border, xs shadow).
      */}
      <HappileeCard
        data-testid="customer-groups-list"
        className="min-h-0 gap-0 overflow-hidden p-0"
      >
        <DataTable
          data={customer_groups}
          columns={columns}
          filters={filters}
          heading={t("customerGroups.domain")}
          rowCount={count}
          getRowId={(row) => row.id}
          rowHref={(row) => `/customer-groups/${row.id}`}
          action={{
            label: t("actions.create"),
            to: "/customer-groups/create",
          }}
          emptyState={{
            empty: {
              heading: t("customerGroups.list.empty.heading"),
              description: t("customerGroups.list.empty.description"),
            },
            filtered: {
              heading: t("customerGroups.list.filtered.heading"),
              description: t("customerGroups.list.filtered.description"),
            },
          }}
          pageSize={PAGE_SIZE}
          isLoading={isPending}
        />
      </HappileeCard>
    </SingleColumnPage>
  )
}

const columnHelper = createDataTableColumnHelper<HttpTypes.AdminCustomerGroup>()

const useColumns = () => {
  const { t } = useTranslation()
  const { getFullDate } = useDate()
  const navigate = useNavigate()
  const prompt = usePrompt()

  const { mutateAsync: deleteCustomerGroup } = useDeleteCustomerGroupLazy()

  const handleDeleteCustomerGroup = useCallback(
    async ({ id, name }: { id: string; name: string }) => {
      const res = await prompt({
        title: t("customerGroups.delete.title"),
        description: t("customerGroups.delete.description", {
          name,
        }),
        verificationText: name,
        verificationInstruction: t("general.typeToConfirm"),
        confirmText: t("actions.delete"),
        cancelText: t("actions.cancel"),
      })

      if (!res) {
        return
      }

      await deleteCustomerGroup(
        { id },
        {
          onSuccess: () => {
            toast.success(t("customerGroups.delete.successToast", { name }))
          },
          onError: (e) => {
            toast.error(e.message)
          },
        }
      )
    },
    [t, prompt, deleteCustomerGroup]
  )

  return useMemo(() => {
    return [
      columnHelper.accessor("name", {
        header: t("fields.name"),
        enableSorting: true,
        sortAscLabel: t("filters.sorting.alphabeticallyAsc"),
        sortDescLabel: t("filters.sorting.alphabeticallyDesc"),
      }),
      columnHelper.accessor("customers", {
        header: t("customers.domain"),
        cell: ({ row }) => {
          return <span>{row.original.customers?.length ?? 0}</span>
        },
      }),
      columnHelper.accessor("created_at", {
        header: t("fields.createdAt"),
        cell: ({ row }) => {
          return (
            <span>
              {getFullDate({
                date: row.original.created_at,
                includeTime: true,
              })}
            </span>
          )
        },
        enableSorting: true,
        sortAscLabel: t("filters.sorting.dateAsc"),
        sortDescLabel: t("filters.sorting.dateDesc"),
      }),
      columnHelper.accessor("updated_at", {
        header: t("fields.updatedAt"),
        cell: ({ row }) => {
          return (
            <span>
              {getFullDate({
                date: row.original.updated_at,
                includeTime: true,
              })}
            </span>
          )
        },
        enableSorting: true,
        sortAscLabel: t("filters.sorting.dateAsc"),
        sortDescLabel: t("filters.sorting.dateDesc"),
      }),
      columnHelper.action({
        actions: [
          [
            {
              icon: <PencilSquare />,
              label: t("actions.edit"),
              onClick: (row) => {
                navigate(`/customer-groups/${row.row.original.id}/edit`)
              },
            },
          ],
          [
            {
              icon: <Trash />,
              label: t("actions.delete"),
              onClick: (row) => {
                handleDeleteCustomerGroup({
                  id: row.row.original.id,
                  name: row.row.original.name ?? "",
                })
              },
            },
          ],
        ],
      }),
    ]
  }, [t, navigate, getFullDate, handleDeleteCustomerGroup])
}

const useFilters = () => {
  const dateFilters = useDataTableDateFilters()

  return useMemo(() => {
    return dateFilters
  }, [dateFilters])
}
