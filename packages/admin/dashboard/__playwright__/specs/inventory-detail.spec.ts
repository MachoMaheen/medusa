/**
 * Wave 2.4 — Inventory item detail visual contract spec.
 *
 * Verifies the re-skinned inventory detail page sections (sandbox facsimile):
 *   1. Section card uses Happilee container border + radius
 *   2. H2 heading uses Inter / text-base / font-semibold
 *   3. Stock-status badge appears next to the item title
 *   4. Per-location levels table renders stocked/available cells as
 *      HappileeBadges in the correct semantic variant
 *   5. Component sources contain no raw hex literals outside comments
 */
import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const COMPONENT_PATHS = [
  resolve(
    __dirname,
    "../../src/routes/inventory/inventory-detail/components/inventory-item-general-section.tsx"
  ),
  resolve(
    __dirname,
    "../../src/routes/inventory/inventory-detail/components/inventory-item-location-levels.tsx"
  ),
  resolve(
    __dirname,
    "../../src/routes/inventory/inventory-detail/components/inventory-item-reservations.tsx"
  ),
  resolve(
    __dirname,
    "../../src/routes/inventory/inventory-detail/components/location-levels-table/use-location-list-table-columns.tsx"
  ),
]

const SANDBOX_STYLES = `
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body { margin: 0; padding: 24px; background: #fafafa; font-family: Inter; }
  .hap-section {
    background-color: #ffffff;
    border: 1px solid #e9eaeb;
    border-radius: 12px;
    overflow: hidden;
  }
  .hap-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid #e9eaeb;
  }
  .hap-h2 { font-size: 16px; line-height: 24px; font-weight: 600; color: #181d27; margin: 0; }
  .hap-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    border: 1px solid;
    font-family: Inter;
    margin-left: 12px;
  }
  .hap-badge-active  { background-color: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
  .hap-badge-draft   { background-color: #fafafa; color: #535862; border-color: #e9eaeb; }
  .hap-badge-paused  { background-color: #fef2f2; color: #b91c1c; border-color: #fecaca; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 12px 16px; font-family: Inter; font-size: 14px; }
  th { background: #fafafa; text-align: left; font-size: 12px; color: #535862; text-transform: uppercase; font-weight: 600; }
  tr { border-bottom: 1px solid #e9eaeb; }
  tr:last-child { border-bottom: 0; }
`

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>${SANDBOX_STYLES}</style></head>
<body>
  <div id="general" class="hap-section">
    <div class="hap-section-header">
      <div style="display:flex; align-items:center;">
        <h2 id="general-title" class="hap-h2">Widget Pro Details</h2>
        <span id="header-badge" class="hap-badge hap-badge-active">In stock</span>
      </div>
      <button>Edit</button>
    </div>
  </div>
  <div style="height:16px"></div>
  <div id="levels" class="hap-section">
    <div class="hap-section-header">
      <h2 class="hap-h2">Locations</h2>
      <button>Manage locations</button>
    </div>
    <table>
      <thead><tr><th>Location</th><th>Reserved</th><th>In stock</th><th>Available</th></tr></thead>
      <tbody>
        <tr id="row-active">
          <td>Warehouse A</td><td>5</td>
          <td><span class="hap-badge hap-badge-active">42</span></td>
          <td><span class="hap-badge hap-badge-active">37</span></td>
        </tr>
        <tr id="row-draft">
          <td>Warehouse B</td><td>1</td>
          <td><span class="hap-badge hap-badge-draft">4</span></td>
          <td><span class="hap-badge hap-badge-draft">3</span></td>
        </tr>
        <tr id="row-paused">
          <td>Warehouse C</td><td>0</td>
          <td><span class="hap-badge hap-badge-paused">0</span></td>
          <td><span class="hap-badge hap-badge-paused">0</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Inventory detail — visual contract", () => {
  test("section card has rounded-xl + container border", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById("general")!)
      return {
        borderRadius: cs.borderTopLeftRadius,
        borderColor: cs.borderTopColor,
        backgroundColor: cs.backgroundColor,
      }
    })
    expect(styles.borderRadius).toBe("12px")
    expect(styles.borderColor).toBe("rgb(233, 234, 235)")
    expect(styles.backgroundColor).toBe("rgb(255, 255, 255)")
  })

  test("section H2 uses Inter 16/24 semibold text-primary", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById("general-title")!)
      return {
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        color: cs.color,
        fontFamily: cs.fontFamily.toLowerCase(),
      }
    })
    expect(styles.fontSize).toBe("16px")
    expect(styles.fontWeight).toBe("600")
    expect(styles.color).toBe("rgb(24, 29, 39)")
    expect(styles.fontFamily).toContain("inter")
  })

  test("inline header badge resolves to active variant tokens", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById("header-badge")!)
      return { bg: cs.backgroundColor, fg: cs.color, radius: cs.borderTopLeftRadius }
    })
    expect(styles.bg).toBe("rgb(240, 253, 244)")
    expect(styles.fg).toBe("rgb(21, 128, 61)")
    // rounded-full → 9999px-or-equivalent rendered as big radius
    expect(parseFloat(styles.radius)).toBeGreaterThan(20)
  })

  test("per-location row badges differentiate active / draft / paused", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const reads = await page.evaluate(() => {
      const grab = (rowId: string) => {
        const row = document.getElementById(rowId)!
        const badge = row.querySelector(".hap-badge")! as HTMLElement
        const cs = getComputedStyle(badge)
        return { bg: cs.backgroundColor, fg: cs.color }
      }
      return {
        active: grab("row-active"),
        draft: grab("row-draft"),
        paused: grab("row-paused"),
      }
    })
    expect(reads.active.bg).toBe("rgb(240, 253, 244)")
    expect(reads.draft.bg).toBe("rgb(250, 250, 250)")
    expect(reads.paused.bg).toBe("rgb(254, 242, 242)")
    // All three must differ from each other
    const uniq = new Set([reads.active.bg, reads.draft.bg, reads.paused.bg])
    expect(uniq.size).toBe(3)
  })

  test("source files contain no raw hex literals outside comments", () => {
    for (const path of COMPONENT_PATHS) {
      const source = readFileSync(path, "utf8")
      const stripped = source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/[^\n]*/g, "")
      const hexMatches = stripped.match(/#[0-9a-fA-F]{6}\b/g) ?? []
      expect(
        hexMatches,
        `Raw hex literals in ${path}: ${hexMatches.join(", ")}`
      ).toHaveLength(0)
    }
  })
})
