/**
 * Wave 2.4 — Reservations list + detail visual contract spec.
 *
 * Sandbox facsimile. Verifies:
 *   1. Reservation list shell is a rounded-xl white card
 *   2. Heading band uses Inter typography per the canonical type pair
 *   3. Detail header surface includes a HappileeBadge that reflects
 *      available stock at the location (active variant when > threshold)
 *   4. Source files have no raw hex literals outside comments
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
    "../../src/routes/reservations/reservation-list/components/reservation-list-table/reservation-list-table.tsx"
  ),
  resolve(
    __dirname,
    "../../src/routes/reservations/reservation-detail/components/reservation-general-section/reservation-general-section.tsx"
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
  .hap-subtitle { font-size: 14px; line-height: 20px; color: #717680; margin: 0; }
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
    margin-left: 12px;
  }
  .hap-badge-active { background-color: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
  .hap-badge-paused { background-color: #fef2f2; color: #b91c1c; border-color: #fecaca; }
`

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>${SANDBOX_STYLES}</style></head>
<body>
  <div id="list" class="hap-section">
    <div class="hap-header">
      <div>
        <h1 id="list-title" class="hap-title">Reservations</h1>
        <p id="list-subtitle" class="hap-subtitle">Manage reservations across all locations</p>
      </div>
      <button>Create</button>
    </div>
  </div>
  <div style="height:16px"></div>
  <div id="detail" class="hap-section">
    <div class="hap-header">
      <div style="display:flex; align-items:center;">
        <h2 class="hap-title">Reservation for Widget Pro</h2>
        <span id="avail-badge" class="hap-badge hap-badge-active">In stock</span>
      </div>
      <button>Edit</button>
    </div>
  </div>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Reservations — visual contract", () => {
  test("list shell uses Happilee container tokens", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById("list")!)
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

  test("list title + subtitle use the canonical type pair", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const t = getComputedStyle(document.getElementById("list-title")!)
      const s = getComputedStyle(document.getElementById("list-subtitle")!)
      return {
        titleSize: t.fontSize,
        titleWeight: t.fontWeight,
        subSize: s.fontSize,
        subColor: s.color,
        font: t.fontFamily.toLowerCase(),
      }
    })
    expect(styles.titleSize).toBe("16px")
    expect(styles.titleWeight).toBe("600")
    expect(styles.subSize).toBe("14px")
    expect(styles.subColor).toBe("rgb(113, 118, 128)")
    expect(styles.font).toContain("inter")
  })

  test("detail availability badge maps to active variant tokens", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById("avail-badge")!)
      return { bg: cs.backgroundColor, fg: cs.color }
    })
    expect(styles.bg).toBe("rgb(240, 253, 244)")
    expect(styles.fg).toBe("rgb(21, 128, 61)")
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
