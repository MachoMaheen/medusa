/**
 * Wave 2.6 — API Keys settings panel CTA contract.
 *
 * `api-key-management/api-key-management-edit/components/edit-api-key-form`
 * now uses HappileeButton on Cancel + Save.
 */

import { runSettingsPanelSpec } from "../helpers/settings-panel-spec"

runSettingsPanelSpec({
  panel: "API Keys",
  formRelPath:
    "routes/api-key-management/api-key-management-edit/components/edit-api-key-form/edit-api-key-form.tsx",
})
