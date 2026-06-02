/**
 * Wave 2.6 — Shipping Profiles settings panel CTA contract.
 *
 * `shipping-profiles/shipping-profile-create/components/create-shipping-profile-form`
 * now uses HappileeButton on Cancel + Save.
 */

import { runSettingsPanelSpec } from "../helpers/settings-panel-spec"

runSettingsPanelSpec({
  panel: "Shipping Profiles",
  formRelPath:
    "routes/shipping-profiles/shipping-profile-create/components/create-shipping-profile-form/create-shipping-profile-form.tsx",
})
