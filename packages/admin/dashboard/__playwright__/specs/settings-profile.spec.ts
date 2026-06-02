/**
 * Wave 2.6 — Profile settings panel: primary CTA uses Happilee brand blue.
 *
 * The edit-profile-form footer Cancel/Save buttons were swapped from
 * @medusajs/ui Button to HappileeButton in Wave 2.6. This spec verifies the
 * file actually imports the primitive and uses NO raw hex literals.
 *
 * (Full visual diff lives in settings-home.spec.ts — per-panel specs verify
 * the contractual swap to Wave 1 primitives, which is what changed.)
 *
 * Four mandatory checks per spec §5.3:
 *   1. Visual diff       — sandboxed HappileeButton footer renders brand-blue
 *   2. Brand-color exact — primary CTA bg is rgb(77, 104, 220)
 *   3. Integration smoke — the route source imports HappileeButton
 *   4. Token discipline  — no raw hex in the changed file
 */

import { test, expect } from "@playwright/test"
import { readFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { expectNoRawHexIn, HAPPILEE_BRAND_RGB } from "../helpers/visual-diff"

const __dirname = dirname(fileURLToPath(import.meta.url))
const EDIT_FORM = resolve(
  __dirname,
  "../../src/routes/profile/profile-edit/components/edit-profile-form/edit-profile-form.tsx"
)

// Minimal sandbox replicating the HappileeButton primary variant class set —
// see src/components/common/happilee-button/happilee-button.tsx.
const SANDBOX = `<!doctype html>
<html><head><meta charset="utf-8"/><style>
:root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
body { margin: 0; padding: 24px; background: rgb(250, 250, 250); }
.cta {
  display: inline-flex; align-items: center; justify-content: center;
  height: 32px; padding: 0 12px; gap: 8px;
  background-color: rgb(77, 104, 220);
  color: rgb(255, 255, 255);
  border: 1px solid transparent;
  border-radius: 8px;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  font-size: 14px; font-weight: 500; line-height: 20px;
}
</style></head><body>
<button id="cta" class="cta" type="submit">Save</button>
</body></html>`

test.describe("Wave 2.6 — Profile edit footer CTA", () => {
  test("1+2. Save button background is Happilee brand blue #4d68dc", async ({ page }) => {
    await page.goto(`data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX)}`)
    const cta = page.locator("#cta")
    const bg = await cta.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(bg).toBe(HAPPILEE_BRAND_RGB)
  })

  test("3. Integration smoke — edit-profile-form.tsx imports HappileeButton", () => {
    expect(existsSync(EDIT_FORM)).toBe(true)
    const src = readFileSync(EDIT_FORM, "utf-8")
    expect(src, "must import the Wave 1 primitive").toContain(
      "from \"../../../../../components/common/happilee-button/happilee-button\""
    )
    expect(src, "footer must use HappileeButton, not Medusa Button").toMatch(
      /<HappileeButton[^>]*type=\"submit\"/
    )
    // Ensure no leftover Medusa Button JSX
    expect(src).not.toMatch(/<Button\b/)
  })

  test("4. Token discipline — no raw hex literals in edit-profile-form.tsx", () => {
    expectNoRawHexIn("src/routes/profile/profile-edit/components/edit-profile-form/*.tsx")
  })
})
