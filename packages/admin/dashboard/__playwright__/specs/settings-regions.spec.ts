/**
 * Wave 2.6 — Regions settings panel CTA contract.
 *
 * `regions/region-edit/components/edit-region-form` now uses HappileeButton
 * on Cancel + Save. This spec asserts the swap, brand-blue rendering, and
 * token discipline.
 */

import { runSettingsPanelSpec } from "../helpers/settings-panel-spec"

runSettingsPanelSpec({
  panel: "Regions",
  formRelPath:
    "routes/regions/region-edit/components/edit-region-form/edit-region-form.tsx",
})
