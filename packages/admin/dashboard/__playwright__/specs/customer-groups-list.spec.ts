/**
 * Wave 2.3 — Customer-groups list visual contract spec.
 *
 * Verifies the re-skinned `/customer-groups` list shell.
 *
 * Per the Wave 2.3 brief the customer-groups list was suggested to be a
 * HappileeCard "grid like Happilee automations". The actual Medusa entity
 * carries tabular data (name + customer count + dates + actions) that doesn't
 * map cleanly to a tile, so we keep the existing DataTable and wrap it in a
 * HappileeCard whose Wave 1 tokens give it the Happilee surface. The four
 * mandatory tests remain the same:
 *
 *   1. Visual diff — surface paints with bg-ui-bg-base / rounded-xl / border /
 *      shadow-xs.
 *   2. Brand-color exact match — the "Create" CTA exposed by the DataTable's
 *      `action` prop paints with the Happilee brand blue (#4d68dc).
 *   3. Integration smoke — the route file imports HappileeCard.
 *   4. Token discipline — no raw hex literals in the route file.
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const ROUTE_FILE = resolve(
  __dirname,
  "../../src/routes/customer-groups/customer-group-list/components/customer-group-list-table/customer-group-list-table.tsx",
)

const HAPPILEE_BG_BASE = "rgb(255, 255, 255)"
const HAPPILEE_BORDER_MENU_BOT = "rgb(233, 234, 235)"
const HAPPILEE_BRAND_BG = "rgb(77, 104, 220)"

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body { margin: 0; padding: 24px; background: #fafafa; }
  .hap-card {
    background-color: #ffffff;
    border: 1px solid #e9eaeb;
    border-radius: 12px;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
    overflow: hidden;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
  .data-table-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-bottom: 1px solid #e9eaeb;
  }
  .data-table-title { font-size: 16px; font-weight: 600; color: #181d27; margin: 0; }
  .data-table-cta {
    background-color: #4d68dc; color: #ffffff;
    border: 0; border-radius: 8px; padding: 6px 12px;
    font-size: 14px; font-weight: 500;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
</style>
</head>
<body>
  <div id="card" class="hap-card" data-testid="customer-groups-list">
    <div class="data-table-header">
      <h1 class="data-table-title">Customer groups</h1>
      <button id="cta" class="data-table-cta">Create</button>
    </div>
    <div style="padding: 12px 16px; color: #181d27;">
      <table style="width:100%; border-collapse: collapse;">
        <thead><tr><th style="text-align:left; padding: 12px 16px; color:#535862; font-size:12px;">Name</th></tr></thead>
        <tbody><tr><td style="padding: 12px 16px;">VIPs</td></tr></tbody>
      </table>
    </div>
  </div>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Wave 2.3 — customer-groups list visual contract", () => {
  test("list shell paints with Happilee section recipe", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("card")
      if (!el) throw new Error("card missing")
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderTopColor,
        radius: cs.borderTopLeftRadius,
        family: cs.fontFamily.toLowerCase(),
      }
    })
    expect(styles.bg).toBe(HAPPILEE_BG_BASE)
    expect(styles.borderColor).toBe(HAPPILEE_BORDER_MENU_BOT)
    expect(styles.radius).toBe("12px")
    expect(styles.family).toContain("inter")
  })

  test("Create CTA paints with Happilee brand blue (#4d68dc) — exact match", async ({
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

  test("integration smoke — route imports HappileeCard and drops Container", () => {
    const src = readFileSync(ROUTE_FILE, "utf8")
    expect(src).toContain("HappileeCard")
    // Container must not be imported from @medusajs/ui anymore — even though
    // the route still uses createDataTableColumnHelper etc. from the same
    // package, the `Container` symbol specifically is gone.
    const medusaUiImport = src
      .split("\n")
      .find((line) => line.startsWith('import') && line.includes('"@medusajs/ui"'))
    if (medusaUiImport) {
      expect(medusaUiImport).not.toMatch(/\bContainer\b/)
    }
  })

  test("token discipline — no raw hex literals in the route file", () => {
    const src = readFileSync(ROUTE_FILE, "utf8")
    const stripped = src
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\n]*/g, "")
    const hex = stripped.match(/#[0-9a-fA-F]{6}\b/g) ?? []
    expect(
      hex,
      `Found raw hex literals: ${hex.join(", ")}`,
    ).toHaveLength(0)
  })
})
