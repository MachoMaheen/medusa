import { PencilSquare, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Container, Copy, Heading, Text, usePrompt } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { ActionMenu } from "../../../../../components/common/action-menu"
import {
  HappileeBadge,
  HappileeBadgeVariant,
} from "../../../../../components/common/happilee-badge/happilee-badge"
import { useDeletePromotion } from "../../../../../hooks/api/promotions"
import { formatCurrency } from "../../../../../lib/format-currency"
import { formatPercentage } from "../../../../../lib/percentage-helpers"
import { getPromotionStatus } from "../../../../../lib/promotions"

/**
 * Map Medusa StatusBadge `color` keys onto HappileeBadge variants per the
 * canonical token map (ADR 001 — 2026-06-02). Happilee has three status
 * variants (active / draft / paused) plus a brand category pill — every
 * Medusa color key falls into one of those buckets.
 */
const STATUS_COLOR_TO_HAPPILEE: Record<string, HappileeBadgeVariant> = {
  green: "active",
  red: "paused",
  orange: "draft",
  grey: "draft",
  blue: "brand",
  purple: "brand",
}

type PromotionGeneralSectionProps = {
  promotion: HttpTypes.AdminPromotion
}

function getDisplayValue(promotion: HttpTypes.AdminPromotion) {
  const value = promotion.application_method?.value

  if (!value) {
    return null
  }

  if (promotion.application_method?.type === "fixed") {
    const currency = promotion.application_method?.currency_code

    if (!currency) {
      return null
    }

    return formatCurrency(value, currency)
  } else if (promotion.application_method?.type === "percentage") {
    return formatPercentage(value)
  }

  return null
}

export const PromotionGeneralSection = ({
  promotion,
}: PromotionGeneralSectionProps) => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const navigate = useNavigate()
  const { mutateAsync } = useDeletePromotion(promotion.id)

  const handleDelete = async () => {
    const confirm = await prompt({
      title: t("general.areYouSure"),
      description: t("promotions.deleteWarning", {
        code: promotion.code,
      }),
      verificationInstruction: t("general.typeToConfirm"),
      verificationText: promotion.code,
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
    })

    if (!confirm) {
      return
    }

    await mutateAsync(undefined, {
      onSuccess: () => {
        navigate("/promotions", { replace: true })
      },
    })
  }

  const [color, text] = getPromotionStatus(promotion)
  const displayValue = getDisplayValue(promotion)

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex flex-col">
          <Heading>{promotion.code}</Heading>
        </div>

        <div className="flex items-center gap-x-2">
          <HappileeBadge
            variant={STATUS_COLOR_TO_HAPPILEE[color] ?? "draft"}
            data-testid="promotion-status-badge"
          >
            {text}
          </HappileeBadge>
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    icon: <PencilSquare />,
                    label: t("actions.edit"),
                    to: `/promotions/${promotion.id}/edit`,
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

      <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
        <Text size="small" weight="plus" leading="compact">
          {t("promotions.fields.campaign")}
        </Text>

        <Text size="small" leading="compact" className="text-pretty">
          {promotion.is_automatic
            ? t("promotions.form.method.automatic.title")
            : t("promotions.form.method.code.title")}
        </Text>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <Text size="small" weight="plus" leading="compact">
          {t("fields.code")}
        </Text>

        <Copy content={promotion.code!} asChild>
          <HappileeBadge
            variant="brand"
            role="button"
            tabIndex={0}
            className="cursor-pointer text-pretty"
          >
            {promotion.code}
          </HappileeBadge>
        </Copy>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
        <Text size="small" weight="plus" leading="compact">
          {t("promotions.fields.type")}
        </Text>

        <Text size="small" leading="compact" className="text-pretty capitalize">
          {promotion.type}
        </Text>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
        <Text size="small" weight="plus" leading="compact">
          {t("promotions.fields.value")}
        </Text>

        <div className="flex items-center gap-x-2">
          <Text className="inline" size="small" leading="compact">
            {displayValue || "-"}
          </Text>
          {promotion?.application_method?.type === "fixed" && (
            <HappileeBadge variant="brand">
              {promotion?.application_method?.currency_code?.toUpperCase()}
            </HappileeBadge>
          )}
        </div>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
        <Text size="small" weight="plus" leading="compact">
          {t("promotions.fields.allocation")}
        </Text>

        <Text size="small" leading="compact" className="text-pretty capitalize">
          {promotion.application_method?.allocation!}
        </Text>
      </div>

      {promotion.application_method?.type === "fixed" && (
        <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
          <Text size="small" weight="plus" leading="compact">
            {t("promotions.fields.taxInclusive")}
          </Text>

          <div className="flex items-center gap-x-2">
            <Text className="inline" size="small" leading="compact">
              {promotion.is_tax_inclusive
                ? t("fields.true")
                : t("fields.false")}
            </Text>
          </div>
        </div>
      )}

      {typeof promotion.limit === "number" && (
        <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
          <Text size="small" weight="plus" leading="compact">
            Usage Limit
          </Text>

          <div className="flex items-center gap-x-2">
            <Text className="inline" size="small" leading="compact">
              {promotion.used || 0} / {promotion.limit}
            </Text>
          </div>
        </div>
      )}
    </Container>
  )
}
