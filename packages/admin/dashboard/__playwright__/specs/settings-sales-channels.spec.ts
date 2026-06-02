/**
 * Wave 2.6 — Sales Channels settings panel CTA contract.
 *
 * `sales-channels/sales-channel-edit/components/edit-sales-channel-form`
 * now uses HappileeButton on Cancel + Save.
 */

import { runSettingsPanelSpec } from "../helpers/settings-panel-spec"

runSettingsPanelSpec({
  panel: "Sales Channels",
  formRelPath:
    "routes/sales-channels/sales-channel-edit/components/edit-sales-channel-form/edit-sales-channel-form.tsx",
})
