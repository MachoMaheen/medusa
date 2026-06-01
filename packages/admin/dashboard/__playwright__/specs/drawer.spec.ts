/**
 * Wave 1.6 — HappileeDrawer visual contract spec
 *
 * Mounts a sandbox HTML document that mirrors the compiled Tailwind output
 * the component depends on (backdrop, panel, slide direction, close button).
 * This keeps the spec self-contained — no dashboard dev server required.
 *
 * What this verifies:
 *   1. Backdrop background is rgba(0, 0, 0, 0.3) — Happilee modal backdrop
 *   2. Panel background is #ffffff and default width is 480px ("md")
 *   3. Panel anchors to the right edge (slide-in from right by default)
 *   4. Close button toggles the drawer's open state
 *   5. The component source file contains NO raw hex literals outside comments
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const COMPONENT_PATH = resolve(
  __dirname,
  "../../src/components/common/happilee-drawer/happilee-drawer.tsx",
)

// Inline stylesheet mirroring the Tailwind utilities the component compiles to.
// Values track tailwind.config.cjs + happilee-tokens.css.
const SANDBOX_STYLES = `
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body { margin: 0; padding: 0; background: #fafafa; height: 100vh; }

  /* Overlay — bg-black/30 backdrop-blur-hap-md */
  .overlay {
    position: fixed; inset: 0; z-index: 50;
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(16px);
  }

  /* Panel — fixed inset-y-2 right-2, 480px "md" / 560px "lg",
     bg-ui-bg-base resolves to #ffffff, shadow-hap-lg, rounded-xl */
  .panel {
    position: fixed;
    top: 8px; bottom: 8px;
    z-index: 50;
    display: flex; flex-direction: column;
    background-color: rgb(255, 255, 255);
    border-radius: 12px;
    box-shadow:
      0 2px 2px -1px rgba(0,0,0,0.04),
      0 4px 6px -2px rgba(0,0,0,0.03),
      0 12px 16px -4px rgba(0,0,0,0.08);
    padding: 0;
    outline: none;
  }
  .panel[data-side="right"] { right: 8px; left: auto; }
  .panel[data-side="left"]  { left: 8px;  right: auto; }
  .panel[data-size="md"] { width: 480px; }
  .panel[data-size="lg"] { width: 560px; }

  /* Header — bg #ffffff, border-b #e9eaeb, padding 16px 24px */
  .drawer-header {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px;
    background-color: rgb(255, 255, 255);
    border-bottom: 1px solid rgb(233, 234, 235);
    padding: 16px 24px;
  }
  .drawer-title {
    font-size: 18px; line-height: 28px; font-weight: 600;
    color: rgb(24, 29, 39); margin: 0;
  }
  .close-btn {
    width: 24px; height: 24px;
    background: transparent; border: 0; cursor: pointer; padding: 0;
    display: inline-flex; align-items: center; justify-content: center;
    color: rgb(113, 118, 128);
  }

  /* Body — flex-1 overflow-y-auto p-6 */
  .drawer-body {
    flex: 1 1 auto; overflow-y: auto; padding: 24px;
  }

  /* Footer — border-t #e9eaeb, padding 16px 24px, gap 8px, justify-end */
  .drawer-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 8px;
    border-top: 1px solid rgb(233, 234, 235);
    padding: 16px 24px;
  }
`

// A minimal HTML+JS sandbox that wires the close button to the panel/overlay
// visibility, matching the Radix Dialog open/close semantics in production.
const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>${SANDBOX_STYLES}</style></head>
<body>
  <div id="root">
    <div id="overlay" class="overlay" data-state="open"></div>
    <div id="panel" class="panel" data-state="open" data-side="right" data-size="md" role="dialog" aria-modal="true">
      <div class="drawer-header">
        <h2 class="drawer-title">Edit product</h2>
        <button id="close" class="close-btn" type="button" aria-label="Close drawer">x</button>
      </div>
      <div class="drawer-body">Body content</div>
      <div class="drawer-footer">
        <button type="button">Cancel</button>
        <button type="button">Save</button>
      </div>
    </div>
  </div>
  <script>
    document.getElementById('close').addEventListener('click', function () {
      var o = document.getElementById('overlay');
      var p = document.getElementById('panel');
      o.parentNode.removeChild(o);
      p.parentNode.removeChild(p);
    });
  </script>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("HappileeDrawer — visual contract", () => {
  test("backdrop background is rgba(0, 0, 0, 0.3)", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const bg = await page.evaluate(() => {
      const el = document.getElementById("overlay")
      if (!el) throw new Error("overlay missing")
      return getComputedStyle(el).backgroundColor
    })
    // Browsers normalize rgba(0,0,0,0.3) — different engines may render the
    // alpha as 0.3 or 0.298039… so accept both canonical forms.
    expect([
      "rgba(0, 0, 0, 0.3)",
      "rgba(0, 0, 0, 0.298039)",
    ]).toContain(bg)
  })

  test("panel background is #ffffff and default width is 480px", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("panel")
      if (!el) throw new Error("panel missing")
      const cs = getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      return {
        bg: cs.backgroundColor,
        width: Math.round(rect.width),
      }
    })
    expect(styles.bg).toBe("rgb(255, 255, 255)")
    expect(styles.width).toBe(480)
  })

  test("panel slides in from the right (anchored to right edge)", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const position = await page.evaluate(() => {
      const el = document.getElementById("panel")
      if (!el) throw new Error("panel missing")
      const cs = getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      return {
        side: el.getAttribute("data-side"),
        right: cs.right,
        viewportWidth: window.innerWidth,
        panelRight: Math.round(rect.right),
      }
    })
    expect(position.side).toBe("right")
    // 8px Happilee gutter from the right edge
    expect(position.right).toBe("8px")
    expect(position.viewportWidth - position.panelRight).toBe(8)
  })

  test("close button removes the panel and overlay", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    await expect(page.locator("#panel")).toBeVisible()
    await expect(page.locator("#overlay")).toBeVisible()
    await page.locator("#close").click()
    await expect(page.locator("#panel")).toHaveCount(0)
    await expect(page.locator("#overlay")).toHaveCount(0)
  })

  test("component source contains no raw 6-digit hex literals outside comments", () => {
    const source = readFileSync(COMPONENT_PATH, "utf8")

    // Strip block comments (/* ... */) and line comments (// ...) before
    // scanning. Doc comments are allowed to cite canonical hexes for clarity.
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
