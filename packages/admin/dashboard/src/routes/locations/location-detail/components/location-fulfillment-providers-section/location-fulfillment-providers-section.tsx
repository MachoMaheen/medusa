/**
 * Wave 2.4 — Location → Fulfillment providers sidebar section.
 *
 * Re-skinned chrome only. No raw hex literals — Medusa preset `ui-*` map
 * per `.agent-os/decisions/2026-06-02-canonical-token-map.md`.
 */
import { HandTruck, PencilSquare } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Fragment } from "react"
import { useTranslation } from "react-i18next"

import { ActionMenu } from "../../../../../components/common/action-menu"
import { NoRecords } from "../../../../../components/common/empty-table-content"
import { IconAvatar } from "../../../../../components/common/icon-avatar"
import { useFulfillmentProviders } from "../../../../../hooks/api"
import { formatProvider } from "../../../../../lib/format-provider"

type LocationsFulfillmentProvidersSectionProps = {
  location: HttpTypes.AdminStockLocation
}

function LocationsFulfillmentProvidersSection({
  location,
}: LocationsFulfillmentProvidersSectionProps) {
  const { t } = useTranslation()
  const { fulfillment_providers } = useFulfillmentProviders({
    stock_location_id: location.id,
    fields: "id",
    is_enabled: true,
  })

  return (
    <div
      data-happilee-section=""
      className="bg-ui-bg-base border border-ui-border-menu-bot rounded-xl overflow-hidden font-sans flex flex-col px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold leading-6 text-ui-fg-base">
          {t("stockLocations.fulfillmentProviders.header")}
        </h2>

        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t("actions.edit"),
                  to: "fulfillment-providers",
                  icon: <PencilSquare />,
                },
              ],
            },
          ]}
        />
      </div>

      {fulfillment_providers?.length ? (
        <div className="flex flex-col gap-y-4 pt-4">
          <div className="grid grid-cols-[28px_1fr] items-center gap-x-3 gap-y-3">
            {fulfillment_providers?.map((fulfillmentProvider) => {
              return (
                <Fragment key={fulfillmentProvider.id}>
                  <IconAvatar>
                    <HandTruck className="text-ui-fg-muted" />
                  </IconAvatar>

                  <div className="text-sm text-ui-fg-base">
                    {formatProvider(fulfillmentProvider.id)}
                  </div>
                </Fragment>
              )
            })}
          </div>
        </div>
      ) : (
        <NoRecords
          className="h-fit pb-2 pt-6 text-center"
          action={{
            label: t("stockLocations.fulfillmentProviders.action"),
            to: "fulfillment-providers",
          }}
          message={t("stockLocations.fulfillmentProviders.noProviders")}
        />
      )}
    </div>
  )
}

export default LocationsFulfillmentProvidersSection
