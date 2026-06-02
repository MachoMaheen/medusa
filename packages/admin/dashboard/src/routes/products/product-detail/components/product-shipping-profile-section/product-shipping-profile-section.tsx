import { PencilSquare, ShoppingBag } from "@medusajs/icons"
import { Container, Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

import { SidebarLink } from "../../../../../components/common/sidebar-link/sidebar-link"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { ExtendedProduct } from "../../constants"

type ProductShippingProfileSectionProps = {
  product: ExtendedProduct
}

export const ProductShippingProfileSection = ({
  product,
}: ProductShippingProfileSectionProps) => {
  const { t } = useTranslation()

  const shippingProfile = product.shipping_profile

  // Happilee re-skin — see canonical-token-map.md for class rationale.
  return (
    <Container
      data-happilee-surface="product-shipping-profile"
      className="p-0 bg-ui-bg-base border border-ui-border-menu-bot rounded-xl shadow-hap-xs"
    >
      <div className="flex items-center justify-between px-6 py-4 font-sans">
        <Heading level="h2" className="text-ui-fg-base">
          {t("products.shippingProfile.header")}
        </Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t("actions.edit"),
                  to: "shipping-profile",
                  icon: <PencilSquare />,
                },
              ],
            },
          ]}
        />
      </div>

      {shippingProfile && (
        <SidebarLink
          to={`/settings/locations/shipping-profiles/${shippingProfile.id}`}
          labelKey={shippingProfile.name}
          descriptionKey={shippingProfile.type}
          icon={<ShoppingBag />}
        />
      )}
    </Container>
  )
}
