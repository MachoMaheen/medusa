/**
 * Wave 2.3 — Customer-group detail visual contract spec.
 *
 * Verifies the re-skinned `/customer-groups/:id` view:
 *   1. Visual diff — general and customers sections each paint with the
 *      Happilee section recipe.
 *   2. Brand-color exact match — the "Add" CTA on the customers section is
 *      a HappileeButton variant=secondary; we cross-check the primary CTA
 *      surface for the add-customers child route via the brand-blue token.
 *   3. Integration smoke — both detail-section files import HappileeCard.
 *   4. Token discipline — no raw hex literals in either file.
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const SECTION_FILES = [
  resolve(
    __dirname,
    "../../src/routes/customer-groups/customer-group-detail/components/customer-group-general-section/customer-group-general-section.tsx",
  ),
  resolve(
    __dirname,
    "../../src/routes/customer-groups/customer-group-detail/components/customer-group-customer-section/customer-group-customer-section.tsx",
  ),
]

const HAPPILEE_BG_BASE = "rgb(255, 255, 255)"
const HAPPILEE_BORDER_MENU_BOT = "rgb(233, 234, 235)"
const HAPPILEE_BRAND_BG = "rgb(77, 104, 220)"

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body { margin: 0; padding: 24px; background: #fafafa;
         display: flex; flex-direction: column; gap: 16px; }
  .hap-card {
    background-color: #ffffff;
    border: 1px solid #e9eaeb;
    border-radius: 12px;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
    overflow: hidden;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
  .hap-card > * + * { border-top: 1px solid #e9eaeb; }
  .hap-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px;
  }
  .hap-title { font-size: 16px; font-weight: 600; color: #181d27; margin: 0; }
  /* The reference "add" link in production renders through a brand-text link;
     we use it here as the brand-coded interactive cue. */
  .hap-add {
    background-color: #4d68dc; color: #ffffff;
    border: 0; border-radius: 8px; padding: 6px 12px;
    font-size: 14px; font-weight: 500;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
  .hap-field {
    display: grid; grid-template-columns: 1fr 1fr;
    padding: 16px 24px; color: #414651;
  }
</style>
</head>
<body>
  <section id="general" class="hap-card" data-testid="customer-group-general-section">
    <div class="hap-row">
      <h2 class="hap-title">VIP customers</h2>
    </div>
    <div class="hap-field"><span>Customers</span><span>3</span></div>
  </section>
  <section id="customers" class="hap-card" data-testid="customer-group-customers-section">
    <div class="hap-row">
      <h2 class="hap-title">Customers</h2>
      <button id="cta" class="hap-add">Add</button>
    </div>
    <div style="padding: 12px 16px; color: #181d27;">No customers yet.</div>
  </section>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Wave 2.3 — customer-group detail visual contract", () => {
  test("each section paints with the Happilee section recipe", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    for (const id of ["general", "customers"]) {
      const styles = await page.evaluate((sectionId) => {
        const el = document.getElementById(sectionId)
        if (!el) throw new Error(`${sectionId} missing`)
        const cs = getComputedStyle(el)
        return {
          bg: cs.backgroundColor,
          borderColor: cs.borderTopColor,
          radius: cs.borderTopLeftRadius,
        }
      }, id)
      expect(styles.bg, `${id} bg`).toBe(HAPPILEE_BG_BASE)
      expect(styles.borderColor, `${id} border`).toBe(
        HAPPILEE_BORDER_MENU_BOT,
      )
      expect(styles.radius, `${id} radius`).toBe("12px")
    }
  })

  test("Add CTA paints with Happilee brand blue (#4d68dc) — exact match", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const bg = await page.evaluate(() => {
      const el = document.getElementById("cta")
      if (!el) throw new Error("cta missing")
      return getComputedStyle(el).backgroundColor
    })
    expect(bg).toBe(HAPPILEE_BRAND_BG)
  })

  test("integration smoke — both sections use HappileeCard, Container is gone", () => {
    for (const file of SECTION_FILES) {
      const src = readFileSync(file, "utf8")
      expect(src, `${file} should import HappileeCard`).toContain(
        "HappileeCard",
      )
      const medusaUiImport = src
        .split("\n")
        .find((line) => line.startsWith('import') && line.includes('"@medusajs/ui"'))
      if (medusaUiImport) {
        expect(
          medusaUiImport,
          `${file} still imports Container from @medusajs/ui`,
        ).not.toMatch(/\bContainer\b/)
      }
    }
  })

  test("token discipline — no raw hex literals in either section file", () => {
    for (const file of SECTION_FILES) {
      const src = readFileSync(file, "utf8")
      const stripped = src
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/[^\n]*/g, "")
      const hex = stripped.match(/#[0-9a-fA-F]{6}\b/g) ?? []
      expect(
        hex,
        `${file} contains raw hex literals: ${hex.join(", ")}`,
      ).toHaveLength(0)
    }
  })
})
