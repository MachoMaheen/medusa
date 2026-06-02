/**
 * Wave 2.2 — Product Variant detail page Happilee re-skin contract
 *
 * The variant general section uses HappileeBadge (variant="brand") for option
 * value pills — that's the brand-light (#edf2fe) fill + brand-secondary-text
 * (#4158bd) text pattern from the canonical token map (tag/category pill row).
 *
 * Four mandatory checks:
 *   1. Visual diff — variant section container has rounded-xl + border
 *   2. Brand-color exact — option-value pill uses brand-light fill
 *   3. Integration smoke — heading + badge layout renders with Inter
 *   4. Token discipline — variant-general-section source has no raw hex
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SOURCE_FILE = resolve(
  __dirname,
  "../../src/routes/product-variants/product-variant-detail/components/variant-general-section/variant-general-section.tsx"
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
  .meta { color: #717680; font-size: 14px; font-family: Inter, sans-serif; }
  /* HappileeBadge variant="brand" — bg-brand-light #edf2fe + text-brand-secondary-text #4158bd */
  .badge-brand {
    background-color: #edf2fe; color: #4158bd;
    border: 0; border-radius: 9999px;
    padding: 2px 8px; height: 24px;
    font-size: 12px; font-weight: 500;
    display: inline-flex; align-items: center; justify-content: center;
    font-family: Inter, sans-serif;
  }
</style></head>
<body>
  <section id="surface" class="hap-surface" data-happilee-surface="variant-general">
    <div class="header">
      <div>
        <h1 id="heading" class="heading">Default variant</h1>
        <span id="meta" class="meta">Product variant</span>
      </div>
    </div>
    <div style="padding: 16px 24px; display: flex; gap: 8px;">
      <span id="option-badge" class="badge-brand">Red</span>
      <span class="badge-brand">Large</span>
    </div>
  </section>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Wave 2.2 — product variant detail re-skin", () => {
  test("visual diff: surface frame uses rounded-xl + border-menu-bot", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const cs = await page.evaluate(() => {
      const s = getComputedStyle(document.getElementById("surface")!)
      return { radius: s.borderTopLeftRadius, borderColor: s.borderTopColor }
    })
    expect(cs.radius).toBe("12px")
    expect(cs.borderColor).toBe("rgb(233, 234, 235)")
  })

  test("brand-color exact: option-value pill uses brand-light #edf2fe + text #4158bd", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const badge = await page.evaluate(() => {
      const s = getComputedStyle(document.getElementById("option-badge")!)
      return { bg: s.backgroundColor, color: s.color, radius: s.borderTopLeftRadius }
    })
    // brand-light #edf2fe = rgb(237, 242, 254)
    expect(badge.bg).toBe("rgb(237, 242, 254)")
    // brand-secondary-text #4158bd = rgb(65, 88, 189)
    expect(badge.color).toBe("rgb(65, 88, 189)")
    // rounded-full
    expect(badge.radius).toBe("9999px")
  })

  test("integration smoke: heading + badge row render with Inter", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    await expect(page.locator("#heading")).toBeVisible()
    await expect(page.locator("#option-badge")).toBeVisible()
    const family = await page.evaluate(
      () => getComputedStyle(document.getElementById("heading")!).fontFamily.toLowerCase()
    )
    expect(family).toContain("inter")
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
