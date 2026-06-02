import { GlobeEurope, PencilSquare, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Container, Heading, toast, usePrompt } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { ActionMenu } from "../../../../../components/common/action-menu"
import {
  HappileeBadge,
  HappileeBadgeVariant,
} from "../../../../../components/common/happilee-badge/happilee-badge"
import { SectionRow } from "../../../../../components/common/section"
import { useDeleteProduct } from "../../../../../hooks/api/products"
import { useExtension } from "../../../../../providers/extension-provider"
import { useFeatureFlag } from "../../../../../providers/feature-flag-provider"

// Map Medusa's product status to Happilee status-badge variants. The Happilee
// palette has three semantic states (active/draft/paused) covered by the
// canonical-token-map. "proposed" and "rejected" are uncommon Medusa states
// without a 1:1 Happilee equivalent — they fall back to the "draft" pill so
// they stay readable without introducing out-of-scale colors.
const productStatusVariant = (status: string): HappileeBadgeVariant => {
  switch (status) {
    case "published":
      return "active"
    case "draft":
    case "proposed":
    case "rejected":
    default:
      return "draft"
  }
}

type ProductGeneralSectionProps = {
  product: HttpTypes.AdminProduct
}

export const ProductGeneralSection = ({
  product,
}: ProductGeneralSectionProps) => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const navigate = useNavigate()
  const { getDisplays } = useExtension()
  const isTranslationsEnabled = useFeatureFlag("translation")

  const displays = getDisplays("product", "general")

  const { mutateAsync } = useDeleteProduct(product.id)

  const handleDelete = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("products.deleteWarning", {
        title: product.title,
      }),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await mutateAsync(undefined, {
      onSuccess: () => {
        navigate("..")
      },
      onError: (e) => {
        toast.error(t("products.toasts.delete.error.header"), {
          description: e.message,
        })
      },
    })
  }

  // Happilee re-skin — see canonical-token-map.md for class rationale.
  return (
    <Container
      data-happilee-surface="product-general"
      className="divide-y p-0 bg-ui-bg-base border border-ui-border-menu-bot rounded-xl shadow-hap-xs"
    >
      <div className="flex items-center justify-between px-6 py-4 font-sans">
        <Heading className="text-ui-fg-base">{product.title}</Heading>
        <div className="flex items-center gap-x-4">
          <HappileeBadge variant={productStatusVariant(product.status)}>
            {t(`products.productStatus.${product.status}`)}
          </HappileeBadge>
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
                          to: `/settings/translations/edit?reference=product&reference_id=${product.id}`,
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

      <SectionRow title={t("fields.description")} value={product.description} />
      <SectionRow title={t("fields.subtitle")} value={product.subtitle} />
      <SectionRow title={t("fields.handle")} value={`/${product.handle}`} />
      <SectionRow title={t("fields.material")} value={product.material} />
      <SectionRow
        title={t("fields.discountable")}
        value={product.discountable ? t("fields.true") : t("fields.false")}
      />
      {displays.map((Component, index) => {
        return <Component key={index} data={product} />
      })}
    </Container>
  )
}
