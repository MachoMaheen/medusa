"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

/**
 * Wave 2.8 — PDP tab list (collapsible Happilee accordion).
 *
 * Each row uses canonical-map tokens:
 *   - field label : text-xs font-semibold uppercase text-ui-fg-muted
 *   - field value : text-sm text-ui-fg-base
 *   - feature icon container : 32×32, bg-brand-light, text-brand-secondary-text
 *   - section gap : gap-lg
 */
type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Product Information",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Shipping & Returns",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full" data-testid="product-tabs">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-xxs">
    <span className="text-xs font-semibold uppercase tracking-wide text-ui-fg-muted">
      {label}
    </span>
    <span className="text-sm text-ui-fg-base">{value}</span>
  </div>
)

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="py-lg">
      <div className="grid grid-cols-2 gap-x-xl gap-y-lg">
        <Field label="Material" value={product.material || "-"} />
        <Field
          label="Country of origin"
          value={product.origin_country || "-"}
        />
        <Field label="Type" value={product.type ? product.type.value : "-"} />
        <Field
          label="Weight"
          value={product.weight ? `${product.weight} g` : "-"}
        />
        <Field
          label="Dimensions"
          value={
            product.length && product.width && product.height
              ? `${product.length}L x ${product.width}W x ${product.height}H`
              : "-"
          }
        />
      </div>
    </div>
  )
}

const InfoRow = ({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) => (
  <div className="flex items-start gap-md">
    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-brand-light text-brand-secondary-text shrink-0">
      {icon}
    </div>
    <div className="flex flex-col gap-xxs">
      <span className="text-sm font-semibold text-ui-fg-base">{title}</span>
      <p className="text-sm text-ui-fg-subtle max-w-sm leading-6">{body}</p>
    </div>
  </div>
)

const ShippingInfoTab = () => {
  return (
    <div className="py-lg">
      <div className="grid grid-cols-1 gap-y-lg">
        <InfoRow
          icon={<FastDelivery />}
          title="Fast delivery"
          body="Your package will arrive in 3-5 business days at your pick up location or in the comfort of your home."
        />
        <InfoRow
          icon={<Refresh />}
          title="Simple exchanges"
          body="Is the fit not quite right? No worries - we'll exchange your product for a new one."
        />
        <InfoRow
          icon={<Back />}
          title="Easy returns"
          body="Just return your product and we'll refund your money. No questions asked – we'll do our best to make sure your return is hassle-free."
        />
      </div>
    </div>
  )
}

export default ProductTabs
