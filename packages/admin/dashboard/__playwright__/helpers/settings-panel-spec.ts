/**
 * Shared spec factory for Wave 2.6 per-panel CTA contract.
 *
 * Each settings sub-panel that was re-skinned in Wave 2.6 swapped its
 * footer Cancel/Save buttons from @medusajs/ui Button to HappileeButton.
 * This factory builds the four mandatory checks (per spec §5.3) once and
 * each panel spec just calls it with its file paths.
 */

import { test, expect } from "@playwright/test"
import { readFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { expectNoRawHexIn, HAPPILEE_BRAND_RGB } from "./visual-diff"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DASHBOARD_SRC = resolve(__dirname, "../../src")

// Sandbox HTML that mirrors HappileeButton primary @ size="sm".
const PRIMARY_SANDBOX = `<!doctype html>
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

export interface SettingsPanelContract {
  /** Human-readable panel name (used only for test naming). */
  panel: string
  /**
   * Absolute path to the form file that was swapped to HappileeButton —
   * relative to `packages/admin/dashboard/src`.
   */
  formRelPath: string
  /**
   * Glob (relative to `packages/admin/dashboard`) passed to expectNoRawHexIn.
   * Defaults to the form file's directory glob.
   */
  hexGlob?: string
}

/**
 * Builds the four mandatory checks for a Wave 2.6 settings sub-panel.
 * Call inside a top-level test file:
 *
 *   import { runSettingsPanelSpec } from "../helpers/settings-panel-spec"
 *   runSettingsPanelSpec({
 *     panel: "Regions",
 *     formRelPath: "routes/regions/region-edit/components/edit-region-form/edit-region-form.tsx",
 *   })
 */
export function runSettingsPanelSpec(contract: SettingsPanelContract): void {
  const formAbs = resolve(DASHBOARD_SRC, contract.formRelPath)
  const dirGlob =
    contract.hexGlob ??
    `src/${contract.formRelPath.split("/").slice(0, -1).join("/")}/*.tsx`

  test.describe(`Wave 2.6 — ${contract.panel} settings panel`, () => {
    test("1+2. Save button background is Happilee brand blue #4d68dc", async ({
      page,
    }) => {
      await page.goto(
        `data:text/html;charset=utf-8,${encodeURIComponent(PRIMARY_SANDBOX)}`
      )
      const cta = page.locator("#cta")
      const bg = await cta.evaluate((el) => getComputedStyle(el).backgroundColor)
      expect(bg).toBe(HAPPILEE_BRAND_RGB)
    })

    test(`3. Integration smoke — ${contract.panel} form imports HappileeButton`, () => {
      expect(
        existsSync(formAbs),
        `Wave 2.6 form file should exist at ${formAbs}`
      ).toBe(true)
      const src = readFileSync(formAbs, "utf-8")
      expect(src, "must import HappileeButton primitive").toMatch(
        /from\s+"[^"]*components\/common\/happilee-button\/happilee-button"/
      )
      expect(
        src,
        `${contract.panel} footer must render HappileeButton, not @medusajs/ui Button`
      ).toMatch(/<HappileeButton\b/)
      // No leftover Medusa Button JSX in the form.
      expect(src).not.toMatch(/<Button\b/)
    })

    test(`4. Token discipline — no raw hex in ${contract.panel} form file`, () => {
      expectNoRawHexIn(dirGlob)
    })
  })
}
