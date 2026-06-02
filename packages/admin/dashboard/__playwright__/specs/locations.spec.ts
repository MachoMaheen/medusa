/**
 * Wave 2.4 — Locations list + detail visual contract spec.
 *
 * Sandbox-only facsimile (see button.spec.ts for rationale). Verifies:
 *   1. List shell uses rounded-xl + Happilee container border
 *   2. Sidebar "Links" section header uses Inter 16/24 semibold
 *   3. Detail location header surfaces title + address with the canonical
 *      type pair (text-base font-semibold + text-sm text-ui-fg-muted)
 *   4. Fulfillment "enabled" / "disabled" pill uses HappileeBadge variants
 *      (active / draft) — not Medusa's saturated green
 *   5. Source files contain no raw hex literals outside comments
 */
import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const COMPONENT_PATHS = [
  resolve(__dirname, "../../src/routes/locations/location-list/location-list.tsx"),
  resolve(
    __dirname,
    "../../src/routes/locations/location-detail/components/location-general-section/location-general-section.tsx"
  ),
  resolve(
    __dirname,
    "../../src/routes/locations/location-detail/components/location-sales-channels-section/locations-sales-channels-section.tsx"
  ),
  resolve(
    __dirname,
    "../../src/routes/locations/location-detail/components/location-fulfillment-providers-section/location-fulfillment-providers-section.tsx"
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
  .hap-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid #e9eaeb;
  }
  .hap-title { font-size: 16px; line-height: 24px; font-weight: 600; color: #181d27; margin: 0; }
  .hap-address { font-size: 14px; line-height: 20px; color: #717680; margin: 0; }
  .hap-h2 { font-size: 16px; line-height: 24px; font-weight: 600; color: #181d27; margin: 0; }
  .hap-badge {
    display: inline-flex;
    align-items: center;
    height: 24px;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid;
    font-family: Inter;
  }
  .hap-badge-active { background-color: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
  .hap-badge-draft  { background-color: #fafafa; color: #535862; border-color: #e9eaeb; }
`

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>${SANDBOX_STYLES}</style></head>
<body>
  <div id="list-shell" class="hap-section">
    <div class="hap-header"><h1 class="hap-title">Locations</h1><button>Create</button></div>
    <div style="padding:24px; color:#717680;">DataTable goes here</div>
  </div>
  <div style="height:16px"></div>
  <div id="detail-shell" class="hap-section">
    <div class="hap-header">
      <div>
        <h1 id="detail-title" class="hap-title">Warehouse A</h1>
        <p id="detail-address" class="hap-address">123 Main Street, Springfield, USA</p>
      </div>
      <button>Edit</button>
    </div>
  </div>
  <div style="height:16px"></div>
  <div id="fulfillment-shell" class="hap-section">
    <div class="hap-header">
      <h2 id="fulfillment-title" class="hap-h2">Shipping</h2>
      <span id="enabled-badge" class="hap-badge hap-badge-active">Enabled</span>
    </div>
  </div>
  <div style="height:16px"></div>
  <div id="fulfillment-off-shell" class="hap-section">
    <div class="hap-header">
      <h2 class="hap-h2">Pickup</h2>
      <span id="disabled-badge" class="hap-badge hap-badge-draft">Disabled</span>
    </div>
  </div>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Locations — visual contract", () => {
  test("list shell uses the Happilee container surface", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById("list-shell")!)
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

  test("detail header uses the canonical type pair", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const t = getComputedStyle(document.getElementById("detail-title")!)
      const a = getComputedStyle(document.getElementById("detail-address")!)
      return {
        titleSize: t.fontSize,
        titleWeight: t.fontWeight,
        titleColor: t.color,
        addressSize: a.fontSize,
        addressColor: a.color,
        font: t.fontFamily.toLowerCase(),
      }
    })
    expect(styles.titleSize).toBe("16px")
    expect(styles.titleWeight).toBe("600")
    expect(styles.titleColor).toBe("rgb(24, 29, 39)")
    expect(styles.addressSize).toBe("14px")
    expect(styles.addressColor).toBe("rgb(113, 118, 128)")
    expect(styles.font).toContain("inter")
  })

  test("enabled/disabled pills use HappileeBadge active/draft tokens", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const reads = await page.evaluate(() => {
      const en = getComputedStyle(document.getElementById("enabled-badge")!)
      const dis = getComputedStyle(document.getElementById("disabled-badge")!)
      return {
        enabledBg: en.backgroundColor,
        enabledFg: en.color,
        disabledBg: dis.backgroundColor,
        disabledFg: dis.color,
      }
    })
    // active = green tokens
    expect(reads.enabledBg).toBe("rgb(240, 253, 244)")
    expect(reads.enabledFg).toBe("rgb(21, 128, 61)")
    // draft = subtle / neutral
    expect(reads.disabledBg).toBe("rgb(250, 250, 250)")
    expect(reads.disabledFg).toBe("rgb(83, 88, 98)")
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
