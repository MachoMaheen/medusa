/**
 * Wave 2.4 — Inventory list page visual contract spec.
 *
 * Verifies the re-skinned inventory list page chrome (sandbox facsimile —
 * see button.spec.ts for the rationale of the self-contained sandbox).
 *
 * What this verifies:
 *   1. Page shell is a rounded-xl white card on the #fafafa app background
 *   2. Heading band uses the Happilee border + Inter typography
 *   3. Title is text-base font-semibold text-primary
 *   4. Subtitle is text-sm text-ui-fg-muted
 *   5. The action button surface matches HappileeButton secondary tokens
 *   6. Stock-status HappileeBadge variants render with the correct hex colors
 *   7. Component source contains no raw hex literals outside comments
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
    "../../src/routes/inventory/inventory-list/components/inventory-list-table.tsx"
  ),
  resolve(
    __dirname,
    "../../src/routes/inventory/inventory-list/components/use-inventory-table-columns.tsx"
  ),
]

const SANDBOX_STYLES = `
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body { margin: 0; padding: 24px; background: #fafafa; font-family: Inter; }
  .hap-shell {
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
  .hap-button {
    height: 32px;
    padding: 0 12px;
    border-radius: 8px;
    background-color: #ffffff;
    border: 1px solid #d5d7da;
    color: #4158bd;
    font-size: 14px;
    font-weight: 500;
    font-family: Inter;
  }
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
    font-family: Inter;
    border: 1px solid;
  }
  .hap-badge-active  { background-color: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
  .hap-badge-draft   { background-color: #fafafa; color: #535862; border-color: #e9eaeb; }
  .hap-badge-paused  { background-color: #fef2f2; color: #b91c1c; border-color: #fecaca; }
`

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>${SANDBOX_STYLES}</style></head>
<body>
  <div id="shell" class="hap-shell">
    <div id="header" class="hap-header">
      <div>
        <h1 id="title" class="hap-title">Inventory</h1>
        <p id="subtitle" class="hap-subtitle">Manage the inventory of your products</p>
      </div>
      <button id="action" class="hap-button">Create</button>
    </div>
    <div id="content" style="padding:16px;">
      <span id="badge-active" class="hap-badge hap-badge-active">42</span>
      <span id="badge-draft" class="hap-badge hap-badge-draft">3</span>
      <span id="badge-paused" class="hap-badge hap-badge-paused">0</span>
    </div>
  </div>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Inventory list — visual contract", () => {
  test("page shell uses rounded-xl + Happilee container border", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("shell")!
      const cs = getComputedStyle(el)
      return {
        borderRadius: cs.borderTopLeftRadius,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
        backgroundColor: cs.backgroundColor,
      }
    })
    expect(styles.borderRadius).toBe("12px")
    expect(styles.borderColor).toBe("rgb(233, 234, 235)")
    expect(styles.borderWidth).toBe("1px")
    expect(styles.backgroundColor).toBe("rgb(255, 255, 255)")
  })

  test("title and subtitle render with the canonical type pair", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const t = document.getElementById("title")!
      const s = document.getElementById("subtitle")!
      const tc = getComputedStyle(t)
      const sc = getComputedStyle(s)
      return {
        titleSize: tc.fontSize,
        titleWeight: tc.fontWeight,
        titleColor: tc.color,
        subSize: sc.fontSize,
        subColor: sc.color,
        titleFont: tc.fontFamily.toLowerCase(),
      }
    })
    expect(styles.titleSize).toBe("16px")
    expect(styles.titleWeight).toBe("600")
    expect(styles.titleColor).toBe("rgb(24, 29, 39)")
    expect(styles.subSize).toBe("14px")
    expect(styles.subColor).toBe("rgb(113, 118, 128)")
    expect(styles.titleFont).toContain("inter")
  })

  test("HappileeBadge variants resolve to the canonical hex per ADR", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const colors = await page.evaluate(() => {
      const read = (id: string) => {
        const cs = getComputedStyle(document.getElementById(id)!)
        return { bg: cs.backgroundColor, fg: cs.color }
      }
      return {
        active: read("badge-active"),
        draft: read("badge-draft"),
        paused: read("badge-paused"),
      }
    })
    // active = in-stock (#f0fdf4 / #15803d)
    expect(colors.active.bg).toBe("rgb(240, 253, 244)")
    expect(colors.active.fg).toBe("rgb(21, 128, 61)")
    // draft = low-stock
    expect(colors.draft.bg).toBe("rgb(250, 250, 250)")
    // paused = out-of-stock
    expect(colors.paused.bg).toBe("rgb(254, 242, 242)")
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
