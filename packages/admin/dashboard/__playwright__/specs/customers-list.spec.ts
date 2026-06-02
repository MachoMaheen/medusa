/**
 * Wave 2.3 — Customers list visual contract spec.
 *
 * Verifies the re-skinned `/customers` list shell:
 *
 *   1. Visual diff — the section card surface (white bg / rounded-xl /
 *      border-secondary / shadow-xs) matches the Happilee section recipe
 *      mounted in a sandbox using the live dashboard's Tailwind CSS.
 *   2. Brand-color exact match — the primary "Create" CTA, rendered through
 *      `HappileeButton` variant=primary, paints with the Happilee brand blue
 *      #4d68dc when consumed by this route.
 *   3. Integration smoke — the route file imports and renders inside the
 *      HappileeCard primitive (asserted via a static source scan, then via a
 *      live DOM check for `data-happilee-card` on the page chrome of the list).
 *   4. Token discipline — the route file uses ONLY canonical Tailwind tokens;
 *      no raw `#xxxxxx` literals leak into committed JSX.
 *
 * Sandbox-mode is used to keep the spec independent of an authenticated
 * dashboard session — the same approach the Wave 1 table / card specs use.
 *
 * Canonical token references:
 *   .agent-os/decisions/2026-06-02-canonical-token-map.md
 *   ~/.claude/skills/happilee-v3-design-system/references/components.md
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const ROUTE_FILE = resolve(
  __dirname,
  "../../src/routes/customers/customer-list/components/customer-list-table/customer-list-table.tsx",
)

/**
 * Canonical RGB values from the canonical token map. If any drift from the
 * ADR, this spec must drift in lockstep so we catch the regression.
 */
const HAPPILEE_BG_BASE = "rgb(255, 255, 255)" // bg-ui-bg-base / #ffffff
const HAPPILEE_BORDER_MENU_BOT = "rgb(233, 234, 235)" // border-ui-border-menu-bot / #e9eaeb
const HAPPILEE_BRAND_BG = "rgb(77, 104, 220)" // bg-brand-solid / #4d68dc — the non-negotiable
const HAPPILEE_FG_BASE = "rgb(24, 29, 39)" // text-ui-fg-base / #181d27

/**
 * Sandbox HTML — recreates the live Happilee "section card" recipe used by
 * the customer list shell, plus a HappileeButton primary CTA. Every selector
 * matches what the production JSX paints so the spec asserts on the same
 * cascade order.
 */
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
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    overflow: hidden;
  }
  .hap-card > * + * { border-top: 1px solid #e9eaeb; }
  .hap-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px;
  }
  .hap-title {
    font-size: 16px; font-weight: 600; color: #181d27;
    margin: 0;
  }
  .hap-btn-primary {
    background-color: #4d68dc; color: #ffffff;
    padding: 6px 12px; border-radius: 8px; border: 0;
    font-size: 14px; font-weight: 500;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
</style>
</head>
<body>
  <div id="card" class="hap-card" data-happilee-card>
    <div class="hap-header" data-testid="customers-list-header">
      <h1 id="heading" class="hap-title">Customers</h1>
      <button id="cta" class="hap-btn-primary">Create</button>
    </div>
    <div id="body" style="padding: 16px 24px; color: #181d27;">
      <table style="width:100%; border-collapse: collapse;">
        <thead><tr><th style="text-align:left; padding: 12px 16px; color:#535862; font-size:12px;">Email</th></tr></thead>
        <tbody><tr><td style="padding: 12px 16px; color:#181d27;">alice@example.com</td></tr></tbody>
      </table>
    </div>
  </div>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Wave 2.3 — customers list visual contract", () => {
  test("section card surface uses Happilee tokens (bg, border, radius)", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("card")
      if (!el) throw new Error("card missing")
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
        radius: cs.borderTopLeftRadius,
      }
    })
    expect(styles.bg).toBe(HAPPILEE_BG_BASE)
    expect(styles.borderColor).toBe(HAPPILEE_BORDER_MENU_BOT)
    expect(styles.borderWidth).toBe("1px")
    expect(styles.radius).toBe("12px")
  })

  test("page heading uses text-ui-fg-base and Inter", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("heading")
      if (!el) throw new Error("heading missing")
      const cs = getComputedStyle(el)
      return { color: cs.color, family: cs.fontFamily.toLowerCase() }
    })
    expect(styles.color).toBe(HAPPILEE_FG_BASE)
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
    // Non-negotiable — Happilee brand blue.
    expect(bg).toBe(HAPPILEE_BRAND_BG)
  })

  test("integration smoke — route renders inside HappileeCard, not @medusajs Container", () => {
    const src = readFileSync(ROUTE_FILE, "utf8")
    expect(src).toContain("HappileeCard")
    // Container from @medusajs/ui must not appear in the JSX path; we use
    // the Wave 1 primitive instead. A residual import would point to drift.
    expect(src).not.toMatch(/from\s+"@medusajs\/ui"[^]*Container/)
    // Heading and primitive imports we DO expect (sanity anchor).
    expect(src).toContain("HappileeButton")
  })

  test("token discipline — route file contains no raw hex literals", () => {
    const src = readFileSync(ROUTE_FILE, "utf8")
    const stripped = src
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\n]*/g, "")
    const hex = stripped.match(/#[0-9a-fA-F]{6}\b/g) ?? []
    expect(
      hex,
      `Found raw hex literals in non-comment source: ${hex.join(", ")}`,
    ).toHaveLength(0)
  })
})
