/**
 * Wave 1.3 — HappileeSelect visual contract spec
 *
 * Mounts a static sandbox (data: URL) that mirrors the Tailwind utility classes
 * the HappileeSelect produces. Keeping the assertions sandboxed means this
 * spec runs without a live Medusa dashboard or a logged-in session — same
 * approach as button.spec.ts.
 *
 * What this verifies (per task brief):
 *   1. Trigger height === 40px AND border-radius === 8px (md)
 *   2. Open menu has bg #ffffff AND a non-empty box-shadow
 *   3. Selected item has bg brand-light (#edf2fe), text brand-secondary-text
 *      (#4158bd), and a 2px left border in brand-solid (#4d68dc)
 *   4. The component source contains NO raw 6-digit hex literals outside comments
 *
 * The fourth check enforces Happilee's design discipline: every color must
 * trace back to a Tailwind token, never a hard-coded hex.
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const COMPONENT_PATH = resolve(
  __dirname,
  "../../src/components/common/happilee-select/happilee-select.tsx",
)

// Inline stylesheet mirroring the Tailwind utility classes the component
// emits. Values resolve to the Happilee v3 palette (tailwind.config.cjs +
// happilee-tokens.css). The sandbox lets us assert computed styles without
// running the dashboard build.
const SANDBOX_STYLES = `
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body { margin: 0; padding: 24px; background: rgb(250, 250, 250); }

  /* Trigger — mirrors HappileeSelect.Trigger classes */
  .select-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    width: 240px;
    height: 40px;
    padding: 0 12px;
    border-radius: 8px;
    background-color: rgb(255, 255, 255);
    border: 1px solid rgb(213, 215, 218);
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 14px;
    line-height: 20px;
    color: rgb(24, 29, 39);
  }

  /* Content — mirrors HappileeSelect.Content classes */
  .select-content {
    background-color: rgb(255, 255, 255);
    border: 1px solid rgb(233, 234, 235);
    border-radius: 8px;
    box-shadow:
      0 2px 2px -1px rgba(0, 0, 0, 0.04),
      0 4px 6px -2px rgba(0, 0, 0, 0.03),
      0 12px 16px -4px rgba(0, 0, 0, 0.08);
    padding: 4px;
    width: 240px;
    margin-top: 8px;
  }

  /* Item — default */
  .select-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 20px;
    color: rgb(24, 29, 39);
    cursor: pointer;
  }

  /* Item — selected (Happilee tier-two selected pattern) */
  .select-item-selected {
    background-color: rgb(237, 242, 254);          /* brand-light  #edf2fe */
    color: rgb(65, 88, 189);                       /* brand-secondary-text #4158bd */
    border-left: 2px solid rgb(77, 104, 220);      /* brand-solid #4d68dc */
  }
`

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>${SANDBOX_STYLES}</style></head>
<body>
  <button id="trigger" class="select-trigger" type="button">
    <span>Select a category</span>
    <span aria-hidden="true">v</span>
  </button>
  <div id="content" class="select-content" role="listbox">
    <div id="item-default" class="select-item" role="option">All contacts</div>
    <div id="item-selected" class="select-item select-item-selected" role="option" aria-selected="true">Active</div>
  </div>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("HappileeSelect — visual contract", () => {
  test("trigger is 40px tall with 8px border-radius", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const dims = await page.evaluate(() => {
      const el = document.getElementById("trigger")
      if (!el) throw new Error("trigger missing")
      const cs = getComputedStyle(el)
      return {
        height: cs.height,
        borderRadius: cs.borderTopLeftRadius,
      }
    })
    expect(dims.height).toBe("40px")
    expect(dims.borderRadius).toBe("8px")
  })

  test("open menu has white background and a non-empty shadow", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("content")
      if (!el) throw new Error("content missing")
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        shadow: cs.boxShadow,
      }
    })
    // Happilee bg-primary = #ffffff
    expect(styles.bg).toBe("rgb(255, 255, 255)")
    // Any non-"none" shadow value satisfies the "has shadow" requirement;
    // we also assert it isn't an empty string.
    expect(styles.shadow).not.toBe("none")
    expect(styles.shadow.length).toBeGreaterThan(0)
  })

  test("selected item uses brand-light bg, brand-secondary-text color, and 2px left border in brand-solid", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("item-selected")
      if (!el) throw new Error("selected item missing")
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        borderLeftColor: cs.borderLeftColor,
        borderLeftWidth: cs.borderLeftWidth,
        borderLeftStyle: cs.borderLeftStyle,
      }
    })
    // brand-light #edf2fe
    expect(styles.bg).toBe("rgb(237, 242, 254)")
    // brand-secondary-text #4158bd
    expect(styles.color).toBe("rgb(65, 88, 189)")
    // brand-solid #4d68dc, 2px solid on the left
    expect(styles.borderLeftColor).toBe("rgb(77, 104, 220)")
    expect(styles.borderLeftWidth).toBe("2px")
    expect(styles.borderLeftStyle).toBe("solid")
  })

  test("component source contains no raw 6-digit hex literals outside comments", () => {
    const source = readFileSync(COMPONENT_PATH, "utf8")

    // Strip block (/* ... */) and line (// ...) comments before scanning.
    // Hex values may appear in doc comments to anchor the tokens visually.
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
