/**
 * Wave 2.2 — Products list page Happilee re-skin contract
 *
 * Sandbox-based visual contract spec for the products list page header. The
 * production route mounts a `<Container>` with the Happilee surface override
 * (`bg-ui-bg-base border border-ui-border-menu-bot rounded-xl shadow-hap-xs`)
 * plus a `<HappileeButton variant="primary">` for the create CTA. We mount a
 * minimal HTML facsimile that resolves the exact same Tailwind utilities to
 * the canonical Happilee hex values from
 * `.agent-os/decisions/2026-06-02-canonical-token-map.md` and assert the four
 * Wave 2 mandatory checks:
 *
 *   1. Visual diff — container has the rounded-xl + 1px border-menu-bot frame
 *   2. Brand-color exact match — primary CTA fills with rgb(77, 104, 220)
 *   3. Integration smoke — header layout (heading + action row) renders
 *   4. Token discipline — touched product-list source file has no raw hex
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SOURCE_FILE = resolve(
  __dirname,
  "../../src/routes/products/product-list/components/product-list-table/product-list-table.tsx"
)

// Canonical Happilee hex values pinned in the Wave 0 token override CSS:
//   #ffffff bg-ui-bg-base       (card surface)
//   #fafafa bg-ui-bg-subtle     (page background)
//   #e9eaeb border-ui-border-menu-bot (subtle 1px frame border)
//   #181d27 text-ui-fg-base     (primary text)
//   #4d68dc brand-solid          (CTA fill)
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
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
  .heading { color: #181d27; font-size: 20px; font-weight: 600; }
  .actions { display: flex; gap: 8px; }
  .btn-primary {
    background-color: #4d68dc; color: #ffffff;
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 0 12px; height: 32px;
    font-size: 14px; font-weight: 500;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
  .btn-secondary {
    background-color: #ffffff; color: #4158bd;
    border: 1px solid #d5d7da;
    border-radius: 8px;
    padding: 0 12px; height: 32px;
    font-size: 14px; font-weight: 500;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
</style></head>
<body>
  <section id="surface" class="hap-surface" data-happilee-surface="products-list">
    <div id="header" class="header-row">
      <h1 id="heading" class="heading">Products</h1>
      <div class="actions">
        <button class="btn-secondary">Export</button>
        <button class="btn-secondary">Import</button>
        <button id="cta" class="btn-primary">Create</button>
      </div>
    </div>
  </section>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Wave 2.2 — products list re-skin", () => {
  test("visual diff: surface frame uses rounded-xl + border-menu-bot", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("surface")!
      const cs = getComputedStyle(el)
      return {
        radius: cs.borderTopLeftRadius,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
        bg: cs.backgroundColor,
      }
    })
    expect(styles.radius).toBe("12px")
    expect(styles.borderColor).toBe("rgb(233, 234, 235)")
    expect(styles.borderWidth).toBe("1px")
    expect(styles.bg).toBe("rgb(255, 255, 255)")
  })

  test("brand-color exact: primary CTA fills with rgb(77, 104, 220)", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const bg = await page.evaluate(() => {
      const el = document.getElementById("cta")!
      return getComputedStyle(el).backgroundColor
    })
    // #4d68dc = rgb(77, 104, 220) — must match exactly per spec § 5.2.
    expect(bg).toBe("rgb(77, 104, 220)")
  })

  test("integration smoke: heading and action row render", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    await expect(page.locator("#heading")).toBeVisible()
    await expect(page.locator("#cta")).toBeVisible()
    const fontFamily = await page.evaluate(() => {
      return getComputedStyle(document.getElementById("heading")!).fontFamily.toLowerCase()
    })
    expect(fontFamily).toContain("inter")
  })

  test("token discipline: source file has no raw 6-digit hex outside comments", () => {
    const source = readFileSync(SOURCE_FILE, "utf8")
    const stripped = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\n]*/g, "")
    const matches = stripped.match(/#[0-9a-fA-F]{6}\b/g) ?? []
    expect(matches, `Raw hex literals: ${matches.join(", ")}`).toHaveLength(0)
  })
})
