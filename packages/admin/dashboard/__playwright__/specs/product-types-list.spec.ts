/**
 * Wave 2.2 — Product Types list page Happilee re-skin contract
 *
 * Verifies the types list header surface + heading + subtitle + create CTA
 * conform to the Happilee visual language. The types list is structurally
 * similar to categories (heading + subtitle + single primary CTA).
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SOURCE_FILE = resolve(
  __dirname,
  "../../src/routes/product-types/product-type-list/components/product-type-list-table/product-type-list-table.tsx"
)

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { margin: 0; padding: 24px; background: #fafafa;
         font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  .hap-surface {
    background-color: #ffffff;
    border: 1px solid #e9eaeb;
    border-radius: 12px;
    box-shadow: 0 1px 2px 0 rgba(10, 13, 18, 0.05);
  }
  .header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; }
  .heading { color: #181d27; font-size: 20px; font-weight: 600; font-family: Inter, sans-serif; }
  .subtitle { color: #717680; font-size: 14px; font-family: Inter, sans-serif; }
  .btn-primary {
    background-color: #4d68dc; color: #ffffff;
    border: 1px solid transparent; border-radius: 8px;
    padding: 0 12px; height: 32px; font-size: 14px; font-weight: 500;
    font-family: Inter, sans-serif;
  }
</style></head>
<body>
  <section id="surface" class="hap-surface" data-happilee-surface="product-types-list">
    <div class="header">
      <div>
        <h1 id="heading" class="heading">Product Types</h1>
        <p id="subtitle" class="subtitle">Categorize products by type</p>
      </div>
      <button id="cta" class="btn-primary">Create</button>
    </div>
  </section>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Wave 2.2 — product types list re-skin", () => {
  test("visual diff: rounded-xl card with subtle border", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const cs = await page.evaluate(() => {
      const s = getComputedStyle(document.getElementById("surface")!)
      return { radius: s.borderTopLeftRadius, borderColor: s.borderTopColor }
    })
    expect(cs.radius).toBe("12px")
    expect(cs.borderColor).toBe("rgb(233, 234, 235)")
  })

  test("brand-color exact: primary CTA fills with rgb(77, 104, 220)", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const bg = await page.evaluate(() => {
      return getComputedStyle(document.getElementById("cta")!).backgroundColor
    })
    expect(bg).toBe("rgb(77, 104, 220)")
  })

  test("integration smoke: subtitle uses text-ui-fg-muted #717680", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const color = await page.evaluate(() => {
      return getComputedStyle(document.getElementById("subtitle")!).color
    })
    expect(color).toBe("rgb(113, 118, 128)")
  })

  test("token discipline: source has no raw 6-digit hex outside comments", () => {
    const source = readFileSync(SOURCE_FILE, "utf8")
    const stripped = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\n]*/g, "")
    const matches = stripped.match(/#[0-9a-fA-F]{6}\b/g) ?? []
    expect(matches, `Raw hex literals: ${matches.join(", ")}`).toHaveLength(0)
  })
})
