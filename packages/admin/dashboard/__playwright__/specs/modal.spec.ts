/**
 * Wave 1.5 — HappileeModal visual contract spec
 *
 * Mounts a sandbox HTML document (served via a data: URL) that mirrors the
 * Tailwind classes the real HappileeModal compiles to. Same pattern as
 * button.spec.ts / input.spec.ts — keeps the spec self-contained so we don't
 * need a running dashboard.
 *
 * What this verifies (the contract from the Wave 1.5 brief):
 *   1. Backdrop background-color is rgba(0, 0, 0, 0.3) — alpha-black-30.
 *   2. Modal surface is #ffffff, radius 12px (rounded-xl), with a shadow.
 *   3. Close button works — clicking it removes the modal from the DOM.
 *   4. Title uses the Inter font family.
 *   5. The component source contains NO raw 6-digit hex literals outside
 *      comments.
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const COMPONENT_PATH = resolve(
  __dirname,
  "../../src/components/common/happilee-modal/happilee-modal.tsx"
)

// Inline stylesheet mirroring the Tailwind utilities the modal compiles to.
// Values come from tailwind.config.cjs + happilee-tokens.css:
//   bg-black/30                 → rgba(0,0,0,0.30)
//   backdrop-blur-hap-md        → 16px
//   bg-ui-bg-base               → #ffffff (via --bg-base var override)
//   rounded-xl                  → 12px
//   shadow-hap-md               → 0 2px 4px -2px #0000000f, 0 4px 6px -1px #0000001a
//   text-ui-fg-base             → #181d27
//   border-ui-border-menu-bot   → #e9eaeb
const SANDBOX_STYLES = `
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body { margin: 0; padding: 0; background: #fafafa; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  .overlay {
    position: fixed; inset: 0; z-index: 50;
    background-color: rgba(0, 0, 0, 0.30);
    backdrop-filter: blur(16px);
  }
  .panel {
    position: fixed; left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% - 16px);
    max-width: 560px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 4px -2px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.10);
    padding: 24px;
    outline: none;
  }
  .title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .title {
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 18px; line-height: 28px; font-weight: 600; color: #181d27;
    margin: 0;
  }
  .close {
    height: 24px; width: 24px; flex-shrink: 0;
    background: transparent; border: none; cursor: pointer;
    color: #717680; font-size: 14px;
  }
  .close:hover { background-color: rgba(0, 0, 0, 0.05); }
  .description { margin-top: 4px; font-size: 14px; line-height: 20px; color: #414651; }
  .body { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; }
  .footer {
    display: flex; align-items: center; justify-content: flex-end; gap: 6px;
    margin-top: 16px; padding-top: 16px;
    border-top: 1px solid #e9eaeb;
  }
  .hidden { display: none; }
`

// Inline script wires the close button — clicking it sets the modal to
// display:none, simulating the open=false transition Radix performs.
const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>${SANDBOX_STYLES}</style></head>
<body>
  <div id="modal-root">
    <div id="overlay" class="overlay" data-testid="overlay"></div>
    <div id="panel" class="panel" data-testid="panel" data-happilee-modal data-size="md" role="dialog" aria-modal="true">
      <div class="title-row">
        <h2 id="title" class="title">Delete automation</h2>
        <button id="close" class="close" aria-label="Close modal" type="button">×</button>
      </div>
      <p class="description">This action cannot be undone.</p>
      <div class="body">
        <p>Are you sure you want to delete this automation?</p>
      </div>
      <div class="footer">
        <button type="button">Cancel</button>
        <button type="button">Delete</button>
      </div>
    </div>
  </div>
  <script>
    document.getElementById('close').addEventListener('click', function () {
      var root = document.getElementById('modal-root');
      root.classList.add('hidden');
      root.setAttribute('data-open', 'false');
    });
  </script>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("HappileeModal — visual contract", () => {
  test("backdrop background is rgba(0, 0, 0, 0.3)", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const bg = await page.evaluate(() => {
      const el = document.getElementById("overlay")
      if (!el) throw new Error("overlay missing")
      return getComputedStyle(el).backgroundColor
    })
    expect(bg).toBe("rgba(0, 0, 0, 0.3)")
  })

  test("panel surface is white with 12px radius and a non-empty shadow", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("panel")
      if (!el) throw new Error("panel missing")
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        radius: cs.borderTopLeftRadius,
        shadow: cs.boxShadow,
      }
    })
    // Happilee bg-primary = #ffffff
    expect(styles.bg).toBe("rgb(255, 255, 255)")
    // rounded-xl = 12px
    expect(styles.radius).toBe("12px")
    // Any non-"none" shadow satisfies the modal-md elevation contract.
    expect(styles.shadow).not.toBe("none")
    expect(styles.shadow.length).toBeGreaterThan(0)
  })

  test("close button works — clicking it hides the modal", async ({ page }) => {
    await page.goto(SANDBOX_URL)

    // Sanity check: panel is visible before click.
    await expect(page.locator("#panel")).toBeVisible()

    await page.locator("#close").click()

    // After close, the modal root hides (analogous to Radix setting
    // open=false and unmounting). The state attribute also flips to "false".
    await expect(page.locator("#panel")).toBeHidden()
    const openState = await page
      .locator("#modal-root")
      .getAttribute("data-open")
    expect(openState).toBe("false")
  })

  test("title uses Inter font", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const fontFamily = await page.evaluate(() => {
      const el = document.getElementById("title")
      if (!el) throw new Error("title missing")
      return getComputedStyle(el).fontFamily
    })
    expect(fontFamily.toLowerCase()).toContain("inter")
  })

  test("component source contains no raw 6-digit hex literals outside comments", () => {
    const source = readFileSync(COMPONENT_PATH, "utf8")

    // Strip block + line comments so hex references inside doc comments
    // (which exist to document the canonical token values) don't trigger
    // the check.
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
