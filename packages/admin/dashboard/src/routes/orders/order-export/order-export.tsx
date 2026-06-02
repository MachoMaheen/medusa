/**
 * Wave 2.1 — Order Export drawer re-skinned to Happilee v3.
 *
 * RouteDrawer chrome is shell-managed (its surface, border, and shadow already
 * trace back to the canonical ui-* token map). We only need to:
 *   - apply Happilee typography to the drawer title (text-lg semibold ui-fg-base)
 *   - swap the action buttons to HappileeButton (primary fill for the
 *     confirmatory "Export" CTA — the only place brand-solid is allowed on
 *     this surface — and secondary for "Cancel").
 */
import { Heading, toast } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { HappileeButton } from "../../../components/common/happilee-button/happilee-button"
import { RouteDrawer, useRouteModal } from "../../../components/modals"
import { useExportOrders } from "../../../hooks/api"
import { useOrderTableQuery } from "../../../hooks/table/query"
import { ExportFilters } from "./components/export-filters"

export const OrderExport = () => {
  const { t } = useTranslation()

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading className="font-sans text-lg font-semibold text-ui-fg-base">
            {t("orders.export.header")}
          </Heading>
        </RouteDrawer.Title>
        <RouteDrawer.Description className="sr-only">
          {t("orders.export.description")}
        </RouteDrawer.Description>
      </RouteDrawer.Header>
      <OrderExportContent />
    </RouteDrawer>
  )
}

const OrderExportContent = () => {
  const { t } = useTranslation()
  const { searchParams } = useOrderTableQuery({})

  const { mutateAsync } = useExportOrders(searchParams)
  const { handleSuccess } = useRouteModal()

  const handleExportRequest = async () => {
    await mutateAsync(searchParams, {
      onSuccess: () => {
        toast.info(t("orders.export.success.title"), {
          description: t("orders.export.success.description"),
        })
        handleSuccess()
      },
      onError: (err) => {
        toast.error(err.message)
      },
    })
  }

  return (
    <>
      <RouteDrawer.Body>
        <ExportFilters />
      </RouteDrawer.Body>
      <RouteDrawer.Footer>
        <div className="flex items-center gap-x-2">
          <RouteDrawer.Close asChild>
            <HappileeButton variant="secondary" size="sm">
              {t("actions.cancel")}
            </HappileeButton>
          </RouteDrawer.Close>
          <HappileeButton
            variant="primary"
            size="sm"
            onClick={handleExportRequest}
          >
            {t("actions.export")}
          </HappileeButton>
        </div>
      </RouteDrawer.Footer>
    </>
  )
}
