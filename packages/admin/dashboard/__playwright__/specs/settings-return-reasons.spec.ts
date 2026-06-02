/**
 * Wave 2.6 — Return Reasons settings panel CTA contract.
 *
 * `return-reasons/return-reason-create/components/return-reason-create-form`
 * now uses HappileeButton on Cancel + Save.
 */

import { runSettingsPanelSpec } from "../helpers/settings-panel-spec"

runSettingsPanelSpec({
  panel: "Return Reasons",
  formRelPath:
    "routes/return-reasons/return-reason-create/components/return-reason-create-form/return-reason-create-form.tsx",
})
