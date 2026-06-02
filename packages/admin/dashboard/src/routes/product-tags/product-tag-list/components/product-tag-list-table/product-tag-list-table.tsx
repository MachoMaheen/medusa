import { GlobeEurope, PencilSquare, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Container, Heading } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLoaderData } from "react-router-dom"

import { ActionMenu } from "../../../../../components/common/action-menu"
import { HappileeButton } from "../../../../../components/common/happilee-button/happilee-button"
import { _DataTable } from "../../../../../components/table/data-table"
import { useProductTags } from "../../../../../hooks/api"
import { useProductTagTableColumns } from "../../../../../hooks/table/columns"
import { useProductTagTableFilters } from "../../../../../hooks/table/filters"
import { useProductTagTableQuery } from "../../../../../hooks/table/query"
import { useDataTable } from "../../../../../hooks/use-data-table"
import { useDeleteProductTagAction } from "../../../common/hooks/use-delete-product-tag-action"
import { productTagListLoader } from "../../loader"
import { useFeatureFlag } from "../../../../../providers/feature-flag-provider"

const PAGE_SIZE = 20

export const ProductTagListTable = () => {
  const { t } = useTranslation()
  const { searchParams, raw } = useProductTagTableQuery({
    pageSize: PAGE_SIZE,
  })

  const initialData = useLoaderData() as Awaited<
    ReturnType<typeof productTagListLoader>
  >

  const { product_tags, count, isPending, isError, error } = useProductTags(
    searchParams,
    {
      initialData,
      placeholderData: keepPreviousData,
    }
  )

  const columns = useColumns()
  const filters = useProductTagTableFilters()

  const { table } = useDataTable({
    data: product_tags,
    count,
    columns,
    getRowId: (row) => row.id,
    pageSize: PAGE_SIZE,
  })

  if (isError) {
    throw error
  }

  // Happilee re-skin — see canonical-token-map.md for class rationale.
  return (
    <Container
      data-happilee-surface="product-tags-list"
      className="divide-y px-0 py-0 bg-ui-bg-base border border-ui-border-menu-bot rounded-xl shadow-hap-xs"
    >
      <div className="flex items-center justify-between px-6 py-4 font-sans">
        <Heading className="text-ui-fg-base">
          {t("productTags.domain")}
        </Heading>
        <HappileeButton variant="primary" size="sm" asChild>
          <Link to="create">{t("actions.create")}</Link>
        </HappileeButton>
      </div>
      <_DataTable
        table={table}
        filters={filters}
        queryObject={raw}
        isLoading={isPending}
        columns={columns}
        pageSize={PAGE_SIZE}
        count={count}
        navigateTo={(row) => row.original.id}
        search
        pagination
        orderBy={[
          { key: "value", label: t("fields.value") },
          { key: "created_at", label: t("fields.createdAt") },
          { key: "updated_at", label: t("fields.updatedAt") },
        ]}
      />
    </Container>
  )
}

const ProductTagRowActions = ({
  productTag,
}: {
  productTag: HttpTypes.AdminProductTag
}) => {
  const { t } = useTranslation()
  const handleDelete = useDeleteProductTagAction({ productTag })
  const isTranslationsEnabled = useFeatureFlag("translation")

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              icon: <PencilSquare />,
              label: t("actions.edit"),
              to: `${productTag.id}/edit`,
            },
          ],
        },
        ...(isTranslationsEnabled
          ? [
              {
                actions: [
                  {
                    icon: <GlobeEurope />,
                    label: t("translations.actions.manage"),
                    to: `/settings/translations/edit?reference=product_tag&reference_id=${productTag.id}`,
                  },
                ],
              },
            ]
          : []),
        {
          actions: [
            {
              icon: <Trash />,
              label: t("actions.delete"),
              onClick: handleDelete,
            },
          ],
        },
      ]}
    />
  )
}

const columnHelper = createColumnHelper<HttpTypes.AdminProductTag>()

const useColumns = () => {
  const base = useProductTagTableColumns()

  return useMemo(
    () => [
      ...base,
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => <ProductTagRowActions productTag={row.original} />,
      }),
    ],
    [base]
  )
}
