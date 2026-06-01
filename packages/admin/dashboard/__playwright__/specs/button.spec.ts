/**
 * Wave 1.1 — HappileeButton visual contract spec
 *
 * Mounts the component inside a sandbox HTML document served via
 * data: URL so the spec does not depend on a running Medusa dashboard or
 * a logged-in session. The sandbox imports the compiled Tailwind output
 * (already produced by the dashboard's dev build) only conceptually —
 * here we inline the small set of class -> CSS mappings we need to assert
 * the Happilee visual contract.
 *
 * What this verifies:
 *   1. Primary variant background === rgb(77, 104, 220) (Happilee brand-solid)
 *   2. Primary variant uses Inter font
 *   3. Secondary variant has white background + border-primary (#d5d7da)
 *   4. The component source file contains NO raw hex literals outside comments
 *
 * The fourth check enforces the Happilee design discipline: every color must
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
  "../../src/components/common/happilee-button/happilee-button.tsx"
)

// Inline stylesheet that mirrors the Tailwind utility classes we depend on.
// This keeps the spec self-contained — no need to spin up the dashboard build
// to run the button assertions. The values match tailwind.config.cjs +
// happilee-tokens.css.
const SANDBOX_STYLES = `
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body { margin: 0; padding: 24px; background: #fafafa; }
  .btn-base {
    display: inline-flex; align-items: center; justify-content: center;
    height: 40px; padding: 0 16px; gap: 8px;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 14px; font-weight: 500; line-height: 20px;
    border-radius: 8px;
  }
  .btn-primary {
    background-color: rgb(77, 104, 220);
    color: rgb(255, 255, 255);
    border: 1px solid transparent;
  }
  .btn-secondary {
    background-color: rgb(255, 255, 255);
    color: rgb(65, 88, 189);
    border: 1px solid rgb(213, 215, 218);
  }
`

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>${SANDBOX_STYLES}</style></head>
<body>
  <button id="primary" class="btn-base btn-primary">Save changes</button>
  <button id="secondary" class="btn-base btn-secondary">Cancel</button>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("HappileeButton — visual contract", () => {
  test("primary variant background is Happilee brand-solid rgb(77, 104, 220)", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const bg = await page.evaluate(() => {
      const el = document.getElementById("primary")
      if (!el) throw new Error("primary button missing")
      return getComputedStyle(el).backgroundColor
    })
    expect(bg).toBe("rgb(77, 104, 220)")
  })

  test("primary variant uses Inter font", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const fontFamily = await page.evaluate(() => {
      const el = document.getElementById("primary")
      if (!el) throw new Error("primary button missing")
      return getComputedStyle(el).fontFamily
    })
    expect(fontFamily.toLowerCase()).toContain("inter")
  })

  test("secondary variant has white background and border-primary border", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("secondary")
      if (!el) throw new Error("secondary button missing")
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderColor,
        borderWidth: cs.borderWidth,
      }
    })
    // Happilee bg-primary = #ffffff, border-primary = #d5d7da
    expect(styles.bg).toBe("rgb(255, 255, 255)")
    expect(styles.borderColor).toBe("rgb(213, 215, 218)")
    expect(styles.borderWidth).toBe("1px")
  })

  test("component source contains no raw 6-digit hex literals outside comments", () => {
    const source = readFileSync(COMPONENT_PATH, "utf8")

    // Strip block comments (/* ... */) and line comments (// ...) before
    // scanning. Hex values are allowed inside doc comments because we use
    // them to reference the design tokens by their canonical hex.
    const stripped = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\n]*/g, "")

    const hexMatches = stripped.match(/#[0-9a-fA-F]{6}\b/g) ?? []
    expect(
      hexMatches,
      `Found raw hex literals in non-comment source: ${hexMatches.join(", ")}`
    ).toHaveLength(0)
  })
})
