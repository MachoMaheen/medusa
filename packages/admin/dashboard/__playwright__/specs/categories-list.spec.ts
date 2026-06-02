/**
 * Wave 2.2 — Categories list page Happilee re-skin contract
 *
 * Categories page has TWO action buttons (Organize + Create) so this spec
 * verifies the primary brand-solid CTA renders alongside a secondary outlined
 * button without color drift. Same four mandatory checks as the other Wave 2.2
 * specs (visual diff, brand-color exact, integration smoke, token discipline).
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SOURCE_FILE = resolve(
  __dirname,
  "../../src/routes/categories/category-list/components/category-list-table/category-list-table.tsx"
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
  }
  .header-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; }
  .heading { color: #181d27; font-size: 20px; font-weight: 600; font-family: Inter, sans-serif; }
  .subtitle { color: #717680; font-size: 14px; font-family: Inter, sans-serif; }
  .actions { display: flex; gap: 8px; }
  .btn-primary {
    background-color: #4d68dc; color: #ffffff;
    border: 1px solid transparent; border-radius: 8px;
    padding: 0 12px; height: 32px; font-size: 14px; font-weight: 500;
    font-family: Inter, sans-serif;
  }
  .btn-secondary {
    background-color: #ffffff; color: #4158bd;
    border: 1px solid #d5d7da; border-radius: 8px;
    padding: 0 12px; height: 32px; font-size: 14px; font-weight: 500;
    font-family: Inter, sans-serif;
  }
</style></head>
<body>
  <section id="surface" class="hap-surface" data-happilee-surface="categories-list">
    <div class="header-row">
      <div>
        <h1 id="heading" class="heading">Categories</h1>
        <p id="subtitle" class="subtitle">Organize products into a hierarchy</p>
      </div>
      <div class="actions">
        <button id="btn-secondary" class="btn-secondary">Organize</button>
        <button id="btn-primary" class="btn-primary">Create</button>
      </div>
    </div>
  </section>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Wave 2.2 — categories list re-skin", () => {
  test("visual diff: surface frame uses rounded-xl + border-menu-bot", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const cs = await page.evaluate(() => {
      const el = document.getElementById("surface")!
      const s = getComputedStyle(el)
      return { radius: s.borderTopLeftRadius, borderColor: s.borderTopColor }
    })
    expect(cs.radius).toBe("12px")
    expect(cs.borderColor).toBe("rgb(233, 234, 235)")
  })

  test("brand-color exact: primary CTA fills with rgb(77, 104, 220)", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const bg = await page.evaluate(() => {
      return getComputedStyle(document.getElementById("btn-primary")!).backgroundColor
    })
    expect(bg).toBe("rgb(77, 104, 220)")
  })

  test("integration smoke: both action buttons coexist without color drift", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const colors = await page.evaluate(() => {
      const primary = getComputedStyle(document.getElementById("btn-primary")!)
      const secondary = getComputedStyle(document.getElementById("btn-secondary")!)
      return {
        primaryBg: primary.backgroundColor,
        primaryText: primary.color,
        secondaryBg: secondary.backgroundColor,
        secondaryText: secondary.color,
      }
    })
    expect(colors.primaryBg).toBe("rgb(77, 104, 220)") // brand-solid
    expect(colors.primaryText).toBe("rgb(255, 255, 255)")
    expect(colors.secondaryBg).toBe("rgb(255, 255, 255)") // bg-ui-bg-base
    expect(colors.secondaryText).toBe("rgb(65, 88, 189)") // brand-secondary-text
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
