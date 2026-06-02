/**
 * Wave 2.6 — Refund Reasons settings panel CTA contract.
 *
 * `refund-reasons/refund-reason-create/components/refund-reason-create-form`
 * now uses HappileeButton on Cancel + Save.
 */

import { runSettingsPanelSpec } from "../helpers/settings-panel-spec"

runSettingsPanelSpec({
  panel: "Refund Reasons",
  formRelPath:
    "routes/refund-reasons/refund-reason-create/components/refund-reason-create-form/refund-reason-create-form.tsx",
})
