import { PencilSquare, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text, toast, usePrompt } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import {
  ActionGroup,
  ActionMenu,
} from "../../../../../components/common/action-menu"
import HappileeCard from "../../../../../components/common/happilee-card/happilee-card"
import { HappileeBadge } from "../../../../../components/common/happilee-badge/happilee-badge"
import { useDeleteCustomer } from "../../../../../hooks/api/customers"
import { useCustomerPermissions } from "../../../../../hooks/use-resource-permissions"

type CustomerGeneralSectionProps = {
  customer: HttpTypes.AdminCustomer
}

export const CustomerGeneralSection = ({
  customer,
}: CustomerGeneralSectionProps) => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const navigate = useNavigate()
  const { canUpdate, canDelete } = useCustomerPermissions()

  const { mutateAsync } = useDeleteCustomer(customer.id)

  const name = [customer.first_name, customer.last_name]
    .filter(Boolean)
    .join(" ")

  // Wave 2.3: map the original Medusa StatusBadge color → HappileeBadge variant.
  //   - has_account  →  "active"  (Happilee green status pill)
  //   - guest        →  "paused"  (Happilee amber status pill — the closest
  //                                semantic match to "not yet registered")
  const statusVariant: "active" | "paused" = customer.has_account
    ? "active"
    : "paused"
  const statusText = customer.has_account
    ? t("customers.fields.registered")
    : t("customers.fields.guest")

  const handleDelete = async () => {
    const res = await prompt({
      title: t("customers.delete.title"),
      description: t("customers.delete.description", {
        email: customer.email,
      }),
      verificationInstruction: t("general.typeToConfirm"),
      verificationText: customer.email,
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await mutateAsync(undefined, {
      onSuccess: () => {
        toast.success(
          t("customers.delete.successToast", {
            email: customer.email,
          })
        )

        navigate("/customers", { replace: true })
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  const groups: ActionGroup[] = []

  if (canUpdate) {
    groups.push({
      actions: [
        {
          label: t("actions.edit"),
          icon: <PencilSquare />,
          to: "edit",
        },
      ],
    })
  }

  if (canDelete) {
    groups.push({
      actions: [
        {
          label: t("actions.delete"),
          icon: <Trash />,
          onClick: handleDelete,
        },
      ],
    })
  }

  // Wave 2.3 — Section panel:
  //   HappileeCard with the same "tall section" overrides used by the customer
  //   list shell. Rows are separated by the canonical `divide-ui-border-menu-bot`
  //   so the inner field grid mirrors the original Medusa look while picking up
  //   the Happilee surface tokens.
  return (
    <HappileeCard
      data-testid="customer-general-section"
      className="divide-ui-border-menu-bot min-h-0 gap-0 divide-y overflow-hidden p-0"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <Heading className="text-ui-fg-base">{customer.email}</Heading>
        <div className="flex items-center gap-x-2">
          <HappileeBadge variant={statusVariant}>{statusText}</HappileeBadge>
          {groups.length > 0 && <ActionMenu groups={groups} />}
        </div>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("fields.name")}
        </Text>
        <Text size="small" leading="compact">
          {name || "-"}
        </Text>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("fields.company")}
        </Text>
        <Text size="small" leading="compact">
          {customer.company_name || "-"}
        </Text>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("fields.phone")}
        </Text>
        <Text size="small" leading="compact">
          {customer.phone || "-"}
        </Text>
      </div>
    </HappileeCard>
  )
}
