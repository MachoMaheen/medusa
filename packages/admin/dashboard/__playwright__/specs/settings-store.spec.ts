/**
 * Wave 2.6 — Store settings panel CTA contract.
 *
 * Verifies that `store/store-edit/components/edit-store-form` ships the
 * Wave 1 HappileeButton primitive on Cancel + Save, that the rendered
 * primary CTA matches Happilee brand blue, and that the form file is
 * token-clean (no raw hex literals).
 */

import { runSettingsPanelSpec } from "../helpers/settings-panel-spec"

runSettingsPanelSpec({
  panel: "Store",
  formRelPath:
    "routes/store/store-edit/components/edit-store-form/edit-store-form.tsx",
})
