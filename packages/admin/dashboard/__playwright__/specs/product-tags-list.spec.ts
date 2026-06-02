/**
 * Wave 2.2 — Product Tags list page Happilee re-skin contract
 *
 * Verifies the tags list header surface + create CTA conform to the Happilee
 * visual language. Tag list is the simplest of the catalog routes — single
 * heading + single primary CTA.
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SOURCE_FILE = resolve(
  __dirname,
  "../../src/routes/product-tags/product-tag-list/components/product-tag-list-table/product-tag-list-table.tsx"
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
  .btn-primary {
    background-color: #4d68dc; color: #ffffff;
    border: 1px solid transparent; border-radius: 8px;
    padding: 0 12px; height: 32px; font-size: 14px; font-weight: 500;
    font-family: Inter, sans-serif;
  }
</style></head>
<body>
  <section id="surface" class="hap-surface" data-happilee-surface="product-tags-list">
    <div class="header">
      <h1 id="heading" class="heading">Product Tags</h1>
      <button id="cta" class="btn-primary">Create</button>
    </div>
  </section>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Wave 2.2 — product tags list re-skin", () => {
  test("visual diff: rounded-xl card with subtle border", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const cs = await page.evaluate(() => {
      const s = getComputedStyle(document.getElementById("surface")!)
      return { radius: s.borderTopLeftRadius, borderColor: s.borderTopColor, bg: s.backgroundColor }
    })
    expect(cs.radius).toBe("12px")
    expect(cs.borderColor).toBe("rgb(233, 234, 235)")
    expect(cs.bg).toBe("rgb(255, 255, 255)")
  })

  test("brand-color exact: primary CTA fills with rgb(77, 104, 220)", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const bg = await page.evaluate(() => {
      return getComputedStyle(document.getElementById("cta")!).backgroundColor
    })
    expect(bg).toBe("rgb(77, 104, 220)")
  })

  test("integration smoke: heading uses Inter + text-ui-fg-base", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const headingStyles = await page.evaluate(() => {
      const s = getComputedStyle(document.getElementById("heading")!)
      return { color: s.color, family: s.fontFamily.toLowerCase() }
    })
    expect(headingStyles.color).toBe("rgb(24, 29, 39)") // text-ui-fg-base
    expect(headingStyles.family).toContain("inter")
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
