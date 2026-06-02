/**
 * Wave 2.4 — Location → Sales channels sidebar section.
 *
 * Re-skinned chrome only. No raw hex literals — all tokens route through the
 * Medusa preset `ui-*` map per
 * `.agent-os/decisions/2026-06-02-canonical-token-map.md`.
 */
import { Channels, PencilSquare } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

import { ActionMenu } from "../../../../../components/common/action-menu"
import { NoRecords } from "../../../../../components/common/empty-table-content"
import { IconAvatar } from "../../../../../components/common/icon-avatar"
import { ListSummary } from "../../../../../components/common/list-summary"
import { useSalesChannels } from "../../../../../hooks/api/sales-channels"

type LocationsSalesChannelsSectionProps = {
  location: HttpTypes.AdminStockLocation
}

function LocationsSalesChannelsSection({
  location,
}: LocationsSalesChannelsSectionProps) {
  const { t } = useTranslation()
  const { count } = useSalesChannels({ limit: 1, fields: "id" })

  const hasConnectedChannels = !!location.sales_channels?.length

  return (
    <div
      data-happilee-section=""
      className="bg-ui-bg-base border border-ui-border-menu-bot rounded-xl overflow-hidden font-sans flex flex-col px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold leading-6 text-ui-fg-base">
          {t("stockLocations.salesChannels.header")}
        </h2>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t("actions.edit"),
                  to: "sales-channels",
                  icon: <PencilSquare />,
                },
              ],
            },
          ]}
        />
      </div>
      {hasConnectedChannels ? (
        <div className="flex flex-col gap-y-4 pt-4">
          <div className="grid grid-cols-[28px_1fr] items-center gap-x-3">
            <IconAvatar>
              <Channels className="text-ui-fg-muted" />
            </IconAvatar>
            <ListSummary
              n={3}
              className="text-ui-fg-base"
              inline
              list={location.sales_channels?.map((sc) => sc.name) ?? []}
            />
          </div>
          <Text className="text-ui-fg-muted" size="small" leading="compact">
            {t("stockLocations.salesChannels.connectedTo", {
              count: location.sales_channels?.length,
              total: count,
            })}
          </Text>
        </div>
      ) : (
        <NoRecords
          className="h-fit pb-2 pt-6"
          action={{
            label: t("stockLocations.salesChannels.action"),
            to: "sales-channels",
          }}
          message={t("stockLocations.salesChannels.noChannels")}
        />
      )}
    </div>
  )
}

export default LocationsSalesChannelsSection
