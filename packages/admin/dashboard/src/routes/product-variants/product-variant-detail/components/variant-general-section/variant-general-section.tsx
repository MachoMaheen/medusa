import { Component, GlobeEurope, PencilSquare, Trash } from "@medusajs/icons"
import { Container, Heading, usePrompt } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { ActionMenu } from "../../../../../components/common/action-menu"
import { HappileeBadge } from "../../../../../components/common/happilee-badge/happilee-badge"
import { SectionRow } from "../../../../../components/common/section"
import { useDeleteVariant } from "../../../../../hooks/api/products"
import { useFeatureFlag } from "../../../../../providers/feature-flag-provider"
import { ExtendedVariant } from "../../constants"

type VariantGeneralSectionProps = {
  variant: ExtendedVariant
}

export function VariantGeneralSection({ variant }: VariantGeneralSectionProps) {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const navigate = useNavigate()
  const isTranslationsEnabled = useFeatureFlag("translation")

  const hasInventoryKit = (variant.inventory?.length ?? 0) > 1

  const { mutateAsync } = useDeleteVariant(variant.product_id!, variant.id)

  const handleDelete = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("products.variant.deleteWarning", {
        title: variant.title,
      }),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await mutateAsync(undefined, {
      onSuccess: () => {
        navigate("..", { replace: true })
      },
    })
  }

  // Happilee re-skin — see canonical-token-map.md for class rationale.
  return (
    <Container
      data-happilee-surface="variant-general"
      className="divide-y p-0 bg-ui-bg-base border border-ui-border-menu-bot rounded-xl shadow-hap-xs"
    >
      <div className="flex items-center justify-between px-6 py-4 font-sans">
        <div>
          <div className="flex items-center gap-2">
            <Heading className="text-ui-fg-base">{variant.title}</Heading>
            {hasInventoryKit && (
              <span className="text-ui-fg-muted font-normal">
                <Component />
              </span>
            )}
          </div>
          <span className="text-ui-fg-muted txt-small mt-2">
            {t("labels.productVariant")}
          </span>
        </div>
        <div className="flex items-center gap-x-4">
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    label: t("actions.edit"),
                    to: "edit",
                    icon: <PencilSquare />,
                  },
                ],
              },
              ...(isTranslationsEnabled
                ? [
                    {
                      actions: [
                        {
                          label: t("translations.actions.manage"),
                          to: `/settings/translations/edit?reference=product_variant&reference_id=${variant.id}`,
                          icon: <GlobeEurope />,
                        },
                      ],
                    },
                  ]
                : []),
              {
                actions: [
                  {
                    label: t("actions.delete"),
                    onClick: handleDelete,
                    icon: <Trash />,
                  },
                ],
              },
            ]}
          />
        </div>
      </div>

      <SectionRow title={t("fields.sku")} value={variant.sku} />
      {variant.options?.map((o) => (
        <SectionRow
          key={o.id}
          title={o.option?.title!}
          value={<HappileeBadge variant="brand">{o.value}</HappileeBadge>}
        />
      ))}
    </Container>
  )
}
