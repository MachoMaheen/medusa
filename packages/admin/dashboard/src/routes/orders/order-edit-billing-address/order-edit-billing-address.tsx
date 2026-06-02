import { Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"

import { RouteDrawer } from "../../../components/modals"
import { useOrder } from "../../../hooks/api"
import { DEFAULT_FIELDS } from "../order-detail/constants"
import { EditOrderBillingAddressForm } from "./components/edit-order-billing-address-form"

export const OrderEditBillingAddress = () => {
  const { t } = useTranslation()
  const params = useParams()

  const { order, isPending, isError, error } = useOrder(params.id!, {
    fields: DEFAULT_FIELDS,
  })

  if (!isPending && isError) {
    throw error
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        {/* Wave 2.1 — Happilee drawer-title typography. */}
        <Heading className="font-sans text-lg font-semibold text-ui-fg-base">
          {t("orders.edit.billingAddress.title")}
        </Heading>
      </RouteDrawer.Header>

      {order && <EditOrderBillingAddressForm order={order} />}
    </RouteDrawer>
  )
}
