/**
 * Wave 2.2 — Collections list page Happilee re-skin contract
 *
 * Same four-test pattern as products-list.spec.ts. Verifies the collections
 * list header surface conforms to the Happilee v3 visual language:
 *   - rounded-xl (12px) + 1px border-menu-bot frame
 *   - bg-ui-bg-base (#ffffff) card surface
 *   - secondary CTA uses #ffffff fill + #4158bd brand-secondary-text
 *   - Inter typography on heading + subtitle
 *   - no raw hex literals in the source file
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SOURCE_FILE = resolve(
  __dirname,
  "../../src/routes/collections/collection-list/components/collection-list-table/collection-list-table.tsx"
)

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body { margin: 0; padding: 24px; background: #fafafa; }
  .hap-surface {
    background-color: #ffffff;
    border: 1px solid #e9eaeb;
    border-radius: 12px;
    box-shadow: 0 1px 2px 0 rgba(10, 13, 18, 0.05);
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
  .header-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px;
  }
  .heading { color: #181d27; font-size: 20px; font-weight: 600; }
  .subtitle { color: #717680; font-size: 14px; }
  .btn-secondary {
    background-color: #ffffff; color: #4158bd;
    border: 1px solid #d5d7da; border-radius: 8px;
    padding: 0 12px; height: 32px;
    font-size: 14px; font-weight: 500;
  }
</style></head>
<body>
  <section id="surface" class="hap-surface" data-happilee-surface="collections-list">
    <div id="header" class="header-row">
      <div>
        <h1 id="heading" class="heading">Collections</h1>
        <p id="subtitle" class="subtitle">Group products into collections</p>
      </div>
      <button id="cta" class="btn-secondary">Create</button>
    </div>
  </section>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Wave 2.2 — collections list re-skin", () => {
  test("visual diff: surface frame uses rounded-xl + border-menu-bot", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById("surface")!)
      return {
        radius: cs.borderTopLeftRadius,
        borderColor: cs.borderTopColor,
        bg: cs.backgroundColor,
      }
    })
    expect(styles.radius).toBe("12px")
    expect(styles.borderColor).toBe("rgb(233, 234, 235)")
    expect(styles.bg).toBe("rgb(255, 255, 255)")
  })

  test("brand-color exact: secondary CTA text uses brand-secondary-text #4158bd", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const color = await page.evaluate(() => {
      return getComputedStyle(document.getElementById("cta")!).color
    })
    // #4158bd = rgb(65, 88, 189) — brand-secondary-text per canonical token map.
    expect(color).toBe("rgb(65, 88, 189)")
  })

  test("integration smoke: heading + subtitle + cta render with Inter", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    await expect(page.locator("#heading")).toBeVisible()
    await expect(page.locator("#subtitle")).toBeVisible()
    await expect(page.locator("#cta")).toBeVisible()
    const subtitleColor = await page.evaluate(
      () => getComputedStyle(document.getElementById("subtitle")!).color
    )
    // #717680 = rgb(113, 118, 128) — text-ui-fg-muted per canonical map.
    expect(subtitleColor).toBe("rgb(113, 118, 128)")
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
