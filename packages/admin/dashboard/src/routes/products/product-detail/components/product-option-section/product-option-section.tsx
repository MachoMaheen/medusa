import { PencilSquare, Plus, Trash } from "@medusajs/icons"
import { Container, Heading, usePrompt } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { HappileeBadge } from "../../../../../components/common/happilee-badge/happilee-badge"
import { SectionRow } from "../../../../../components/common/section"
import { useDeleteProductOption } from "../../../../../hooks/api/products"
import { HttpTypes } from "@medusajs/types"

const OptionActions = ({
  product,
  option,
}: {
  product: HttpTypes.AdminProduct
  option: HttpTypes.AdminProductOption
}) => {
  const { t } = useTranslation()
  const { mutateAsync } = useDeleteProductOption(product.id, option.id)
  const prompt = usePrompt()

  const handleDelete = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("products.options.deleteWarning", {
        title: option.title,
      }),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await mutateAsync()
  }

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              label: t("actions.edit"),
              to: `options/${option.id}/edit`,
              icon: <PencilSquare />,
            },
          ],
        },
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
  )
}

type ProductOptionSectionProps = {
  product: HttpTypes.AdminProduct
}

export const ProductOptionSection = ({
  product,
}: ProductOptionSectionProps) => {
  const { t } = useTranslation()

  // Happilee re-skin — see canonical-token-map.md for class rationale.
  return (
    <Container
      data-happilee-surface="product-options"
      className="divide-y p-0 bg-ui-bg-base border border-ui-border-menu-bot rounded-xl shadow-hap-xs"
    >
      <div className="flex items-center justify-between px-6 py-4 font-sans">
        <Heading level="h2" className="text-ui-fg-base">
          {t("products.options.header")}
        </Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t("actions.create"),
                  to: "options/create",
                  icon: <Plus />,
                },
              ],
            },
          ]}
        />
      </div>

      {product.options?.map((option) => {
        return (
          <SectionRow
            title={option.title}
            key={option.id}
            value={option.values?.map((val) => {
              return (
                <HappileeBadge
                  key={val.value}
                  variant="brand"
                  className="flex min-w-[20px] items-center justify-center"
                >
                  {val.value}
                </HappileeBadge>
              )
            })}
            actions={<OptionActions product={product} option={option} />}
          />
        )
      })}
    </Container>
  )
}
