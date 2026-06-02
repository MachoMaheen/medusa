/**
 * Wave 2.4 — Locations list route.
 *
 * Page chrome and sidebar links section are re-skinned to Happilee v3:
 *   - Main panel: rounded-xl white card surface (`bg-ui-bg-base`) with the
 *     global DataTable inside.
 *   - Sidebar: panel chrome carries the Happilee heading style; SidebarLinks
 *     remain (global primitive, out of scope here).
 *
 * Token discipline: routed through Medusa `ui-*` tokens; no raw hex literals.
 */
import { ShoppingBag, TruckFast } from "@medusajs/icons"
import { useTranslation } from "react-i18next"

import { useStockLocations } from "../../../hooks/api/stock-locations"
import { LOCATION_LIST_FIELDS } from "./constants"
import { useLocationListTableColumns } from "./use-location-list-table-columns"
import { useLocationListTableQuery } from "./use-location-list-table-query"

import { DataTable } from "../../../components/data-table"
import { SidebarLink } from "../../../components/common/sidebar-link/sidebar-link"
import { TwoColumnPage } from "../../../components/layout/pages"
import { useExtension } from "../../../providers/extension-provider"
import { keepPreviousData } from "@tanstack/react-query"

const PAGE_SIZE = 20
const PREFIX = "loc"

export function LocationList() {
  const { t } = useTranslation()

  const searchParams = useLocationListTableQuery({
    pageSize: PAGE_SIZE,
    prefix: PREFIX,
  })

  const {
    stock_locations: stockLocations = [],
    count,
    isError,
    error,
    isLoading,
  } = useStockLocations(
    {
      fields: LOCATION_LIST_FIELDS,
      ...searchParams,
    },
    {
      placeholderData: keepPreviousData,
    }
  )

  const columns = useLocationListTableColumns()
  const { getWidgets } = useExtension()

  if (isError) {
    throw error
  }

  return (
    <TwoColumnPage
      widgets={{
        after: getWidgets("location.list.after"),
        before: getWidgets("location.list.before"),
        sideAfter: getWidgets("location.list.side.after"),
        sideBefore: getWidgets("location.list.side.before"),
      }}
      showJSON
    >
      <TwoColumnPage.Main>
        <div
          data-happilee-page-shell=""
          className="bg-ui-bg-base border border-ui-border-menu-bot rounded-xl overflow-hidden font-sans flex flex-col divide-y divide-ui-border-menu-bot"
        >
          <DataTable
            data={stockLocations}
            columns={columns}
            rowCount={count}
            pageSize={PAGE_SIZE}
            getRowId={(row) => row.id}
            heading={t("stockLocations.domain")}
            subHeading={t("stockLocations.list.description")}
            emptyState={{
              empty: {
                heading: t("stockLocations.list.noRecordsMessage"),
                description: t("stockLocations.list.noRecordsMessageEmpty"),
              },
              filtered: {
                heading: t("stockLocations.list.noRecordsMessage"),
                description: t("stockLocations.list.noRecordsMessageFiltered"),
              },
            }}
            actions={[
              {
                label: t("actions.create"),
                to: "create",
              },
            ]}
            isLoading={isLoading}
            rowHref={(row) => `/settings/locations/${row.id}`}
            enableSearch={true}
            prefix={PREFIX}
            layout="fill"
          />
        </div>
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        <LinksSection />
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  )
}

const LinksSection = () => {
  const { t } = useTranslation()

  return (
    <div
      data-happilee-section=""
      className="bg-ui-bg-base border border-ui-border-menu-bot rounded-xl overflow-hidden font-sans"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-menu-bot">
        <h2 className="text-base font-semibold leading-6 text-ui-fg-base">
          {t("stockLocations.sidebar.header")}
        </h2>
      </div>

      <SidebarLink
        to="/settings/locations/shipping-profiles"
        labelKey={t("stockLocations.sidebar.shippingProfiles.label")}
        descriptionKey={t(
          "stockLocations.sidebar.shippingProfiles.description"
        )}
        icon={<ShoppingBag />}
      />
      <SidebarLink
        to="/settings/locations/shipping-option-types"
        labelKey={t("stockLocations.sidebar.shippingOptionTypes.label")}
        descriptionKey={t(
          "stockLocations.sidebar.shippingOptionTypes.description"
        )}
        icon={<TruckFast />}
      />
    </div>
  )
}
