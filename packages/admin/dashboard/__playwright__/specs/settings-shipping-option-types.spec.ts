/**
 * Wave 2.6 — Shipping Option Types settings panel CTA contract.
 *
 * `shipping-option-types/shipping-option-type-create/components/create-shipping-option-type-form`
 * now uses HappileeButton on Cancel + Save.
 */

import { runSettingsPanelSpec } from "../helpers/settings-panel-spec"

runSettingsPanelSpec({
  panel: "Shipping Option Types",
  formRelPath:
    "routes/shipping-option-types/shipping-option-type-create/components/create-shipping-option-type-form/create-shipping-option-type-form.tsx",
})
