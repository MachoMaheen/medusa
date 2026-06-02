import { GlobeEurope, PencilSquare, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Container, Heading, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { ActionMenu } from "../../../../../components/common/action-menu"
import {
  HappileeBadge,
  HappileeBadgeVariant,
} from "../../../../../components/common/happilee-badge/happilee-badge"
import { useDeleteProductCategoryAction } from "../../../common/hooks/use-delete-product-category-action"
import { getIsActiveProps, getIsInternalProps } from "../../../common/utils"
import { useFeatureFlag } from "../../../../../providers/feature-flag-provider"

// Map the Medusa StatusBadge color (`green | red | grey | orange`) returned by
// getIsActiveProps / getIsInternalProps into Happilee's three-variant scale.
// Green → active, anything muted (grey / orange) → draft, red → paused.
const happileeBadgeVariantFromColor = (
  color: string | undefined
): HappileeBadgeVariant => {
  switch (color) {
    case "green":
      return "active"
    case "red":
      return "paused"
    case "orange":
    case "grey":
    default:
      return "draft"
  }
}

type CategoryGeneralSectionProps = {
  category: HttpTypes.AdminProductCategory
}

export const CategoryGeneralSection = ({
  category,
}: CategoryGeneralSectionProps) => {
  const { t } = useTranslation()
  const isTranslationsEnabled = useFeatureFlag("translation")

  const activeProps = getIsActiveProps(category.is_active, t)
  const internalProps = getIsInternalProps(category.is_internal, t)

  const handleDelete = useDeleteProductCategoryAction(category)

  // Happilee re-skin — see canonical-token-map.md for class rationale.
  return (
    <Container
      data-happilee-surface="category-general"
      className="divide-y p-0 bg-ui-bg-base border border-ui-border-menu-bot rounded-xl shadow-hap-xs"
    >
      <div className="flex items-center justify-between px-6 py-4 font-sans">
        <Heading className="text-ui-fg-base">{category.name}</Heading>
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-x-2">
            <HappileeBadge variant={happileeBadgeVariantFromColor(activeProps.color)}>
              {activeProps.label}
            </HappileeBadge>
            <HappileeBadge variant={happileeBadgeVariantFromColor(internalProps.color)}>
              {internalProps.label}
            </HappileeBadge>
          </div>
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    label: t("actions.edit"),
                    icon: <PencilSquare />,
                    to: "edit",
                  },
                ],
              },
              ...(isTranslationsEnabled
                ? [
                    {
                      actions: [
                        {
                          label: t("translations.actions.manage"),
                          to: `/settings/translations/edit?reference=product_category&reference_id=${category.id}`,
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
                    icon: <Trash />,
                    onClick: handleDelete,
                  },
                ],
              },
            ]}
          />
        </div>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 gap-3 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("fields.description")}
        </Text>
        <Text size="small" leading="compact">
          {category.description || "-"}
        </Text>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 gap-3 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("fields.handle")}
        </Text>
        <Text size="small" leading="compact">
          /{category.handle}
        </Text>
      </div>
    </Container>
  )
}
