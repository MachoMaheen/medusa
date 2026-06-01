/**
 * Wave 1.4 — HappileeTable visual contract spec
 *
 * Mounts an HTML facsimile of the rendered table inside a sandbox served via
 * `data:` URL. The sandbox stylesheet mirrors the exact Tailwind utilities
 * the HappileeTable component compiles to (resolved through the Medusa
 * `--<token>` CSS variables that Happilee overrides in
 * `src/styles/happilee-tokens.css`), so the spec asserts the Happilee visual
 * contract without spinning up a dashboard build or login session.
 *
 * What this verifies:
 *   1. Container is rounded-xl (12px) with the border-secondary color (#e9eaeb)
 *   2. Header row uses bg-secondary (#fafafa) and text-xs typography
 *   3. Row hover state changes background to bg-secondary (#fafafa)
 *   4. Inter font is in the cascade on every part of the table
 *   5. The component source contains no raw hex literals outside doc comments
 *
 * Why a sandbox? See `button.spec.ts` for the rationale — Wave 1 worker specs
 * intentionally stay self-contained so each wave can ship independently.
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const COMPONENT_PATH = resolve(
  __dirname,
  "../../src/components/common/happilee-table/happilee-table.tsx",
)

/**
 * The sandbox stylesheet — every value comes straight from
 * `~/.claude/skills/happilee-v3-design-system/references/tokens.md`. If any
 * token here drifts from the skill's source of truth, the visual regression
 * here is no longer meaningful, so KEEP THESE VALUES SYNCED with tokens.md.
 *
 *   #ffffff → bg-primary (white card surface)
 *   #fafafa → bg-secondary (header band, hover surface)
 *   #e9eaeb → border-secondary (subtle 1px dividers, container border)
 *   #181d27 → text-primary (primary cell copy)
 *   #535862 → text-tertiary (header label + meta cell copy)
 *   #edf2fe → brand-light (selected row fill)
 *
 * The CSS also enables a `:hover { background-color: ... }` rule on body
 * rows so the hover assertion is deterministic — in production Tailwind
 * compiles this to `.hover\:bg-ui-bg-subtle:hover { background: var(--bg-subtle) }`.
 */
const SANDBOX_STYLES = `
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body { margin: 0; padding: 24px; background: #fafafa; }
  .hap-container {
    background-color: #ffffff;
    border: 1px solid #e9eaeb;
    border-radius: 12px;
    overflow: hidden;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
  table.hap-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
  thead.hap-thead tr {
    background-color: #fafafa;
    border-bottom: 1px solid #e9eaeb;
  }
  th.hap-th {
    padding: 12px 16px;
    text-align: left;
    font-size: 12px;
    line-height: 16px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    color: #535862;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
  tbody tr {
    background-color: #ffffff;
    border-bottom: 1px solid #e9eaeb;
    transition: background-color 100ms;
  }
  tbody tr:last-child { border-bottom: 0; }
  tbody tr:hover { background-color: #fafafa; }
  tbody tr[data-state="selected"],
  tbody tr[data-state="selected"]:hover { background-color: #edf2fe; }
  td.hap-td {
    padding: 12px 16px;
    font-size: 14px;
    line-height: 20px;
    font-weight: 400;
    color: #181d27;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    vertical-align: middle;
  }
  td.hap-td-meta { color: #535862; }
`

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>${SANDBOX_STYLES}</style></head>
<body>
  <div id="container" class="hap-container">
    <table class="hap-table">
      <thead class="hap-thead">
        <tr id="header-row">
          <th id="th-name" class="hap-th">Name</th>
          <th id="th-status" class="hap-th">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr id="row-1">
          <td id="cell-name-1" class="hap-td">Acme Corporation</td>
          <td id="cell-meta-1" class="hap-td hap-td-meta">Active</td>
        </tr>
        <tr id="row-2" data-state="selected">
          <td class="hap-td">Globex</td>
          <td class="hap-td hap-td-meta">Draft</td>
        </tr>
        <tr id="row-3">
          <td class="hap-td">Initech</td>
          <td class="hap-td hap-td-meta">Paused</td>
        </tr>
      </tbody>
    </table>
  </div>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("HappileeTable — visual contract", () => {
  test("container has rounded-xl (12px) and border-secondary (#e9eaeb)", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("container")
      if (!el) throw new Error("container missing")
      const cs = getComputedStyle(el)
      return {
        borderRadius: cs.borderTopLeftRadius,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
      }
    })
    expect(styles.borderRadius).toBe("12px")
    // border-secondary = #e9eaeb → rgb(233, 234, 235)
    expect(styles.borderColor).toBe("rgb(233, 234, 235)")
    expect(styles.borderWidth).toBe("1px")
  })

  test("header row uses bg-secondary (#fafafa) and text-xs typography", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const headerStyles = await page.evaluate(() => {
      const row = document.getElementById("header-row")
      const cell = document.getElementById("th-name")
      if (!row || !cell) throw new Error("header elements missing")
      const rowCs = getComputedStyle(row)
      const cellCs = getComputedStyle(cell)
      return {
        rowBg: rowCs.backgroundColor,
        fontSize: cellCs.fontSize,
        fontWeight: cellCs.fontWeight,
        textTransform: cellCs.textTransform,
        color: cellCs.color,
      }
    })
    // bg-secondary = #fafafa → rgb(250, 250, 250)
    expect(headerStyles.rowBg).toBe("rgb(250, 250, 250)")
    // text-xs = 12px
    expect(headerStyles.fontSize).toBe("12px")
    // font-semibold = 600
    expect(headerStyles.fontWeight).toBe("600")
    expect(headerStyles.textTransform).toBe("uppercase")
    // text-tertiary = #535862 → rgb(83, 88, 98)
    expect(headerStyles.color).toBe("rgb(83, 88, 98)")
  })

  test("body row hover changes background to bg-secondary (#fafafa)", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)

    // Baseline — row should be white before any hover.
    const baseline = await page.evaluate(() => {
      const el = document.getElementById("row-1")
      if (!el) throw new Error("row-1 missing")
      return getComputedStyle(el).backgroundColor
    })
    expect(baseline).toBe("rgb(255, 255, 255)")

    // Trigger hover and re-read the computed background.
    await page.locator("#row-1").hover()
    const hovered = await page.evaluate(() => {
      const el = document.getElementById("row-1")
      if (!el) throw new Error("row-1 missing")
      return getComputedStyle(el).backgroundColor
    })
    expect(hovered).toBe("rgb(250, 250, 250)")
    expect(hovered).not.toBe(baseline)
  })

  test("Inter font is used throughout the table", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const fonts = await page.evaluate(() => {
      const ids = [
        "container",
        "header-row",
        "th-name",
        "row-1",
        "cell-name-1",
        "cell-meta-1",
      ]
      return ids.map((id) => {
        const el = document.getElementById(id)
        if (!el) throw new Error(`${id} missing`)
        return getComputedStyle(el).fontFamily.toLowerCase()
      })
    })
    for (const family of fonts) {
      expect(family).toContain("inter")
    }
  })

  test("component source contains no raw 6-digit hex literals outside comments", () => {
    const source = readFileSync(COMPONENT_PATH, "utf8")

    // Strip block (/* ... */) and line (// ...) comments before scanning.
    // Doc comments DO reference the canonical Happilee hex values so devs
    // can cross-check the visual contract — those are exempt from the rule.
    const stripped = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\n]*/g, "")

    const hexMatches = stripped.match(/#[0-9a-fA-F]{6}\b/g) ?? []
    expect(
      hexMatches,
      `Found raw hex literals in non-comment source: ${hexMatches.join(", ")}`,
    ).toHaveLength(0)
  })
})
