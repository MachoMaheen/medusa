import { PencilSquare, Trash } from "@medusajs/icons"
import { AdminCampaignResponse } from "@medusajs/types"
import { Container, Heading, Text, toast, usePrompt } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { ActionMenu } from "../../../../../components/common/action-menu"
import {
  HappileeBadge,
  HappileeBadgeVariant,
} from "../../../../../components/common/happilee-badge/happilee-badge"
import { useDeleteCampaign } from "../../../../../hooks/api/campaigns"
import { currencies } from "../../../../../lib/data/currencies"
import {
  campaignStatus,
  statusColor,
} from "../../../common/utils/campaign-status"

/**
 * Canonical map of campaign status → HappileeBadge variant. Mirrors the map
 * used by the promotion general section so the two domains read consistently.
 */
const STATUS_COLOR_TO_HAPPILEE: Record<string, HappileeBadgeVariant> = {
  green: "active",
  red: "paused",
  orange: "draft",
  grey: "draft",
}

type CampaignGeneralSectionProps = {
  campaign: AdminCampaignResponse["campaign"]
}

export const CampaignGeneralSection = ({
  campaign,
}: CampaignGeneralSectionProps) => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const navigate = useNavigate()
  const { mutateAsync } = useDeleteCampaign(campaign.id)

  const handleDelete = async () => {
    const res = await prompt({
      title: t("campaigns.delete.title"),
      description: t("campaigns.delete.description", {
        name: campaign.name,
      }),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await mutateAsync(undefined, {
      onSuccess: () => {
        toast.success(
          t("campaigns.delete.successToast", {
            name: campaign.name,
          })
        )

        navigate("/campaigns", { replace: true })
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  const status = campaignStatus(campaign)

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>{campaign.name}</Heading>

        <div className="flex items-center gap-x-4">
          <HappileeBadge
            variant={STATUS_COLOR_TO_HAPPILEE[statusColor(status)] ?? "draft"}
            data-testid="campaign-status-badge"
          >
            {t(`campaigns.status.${status}`)}
          </HappileeBadge>

          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    icon: <PencilSquare />,
                    label: t("actions.edit"),
                    to: `/campaigns/${campaign.id}/edit`,
                  },
                ],
              },
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
        </div>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("campaigns.fields.identifier")}
        </Text>

        <Text size="small" leading="compact">
          {campaign.campaign_identifier}
        </Text>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("fields.description")}
        </Text>

        <Text size="small" leading="compact">
          {campaign.description || "-"}
        </Text>
      </div>

      {campaign?.budget && campaign.budget.type === "spend" && (
        <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
          <Text size="small" leading="compact" weight="plus">
            {t("fields.currency")}
          </Text>

          <div className="flex items-center gap-x-2">
            <HappileeBadge variant="brand">
              {campaign?.budget.currency_code}
            </HappileeBadge>
            <Text className="inline" size="small" leading="compact">
              {currencies[campaign?.budget.currency_code?.toUpperCase()]?.name}
            </Text>
          </div>
        </div>
      )}
    </Container>
  )
}
