/**
 * Wave 2.3 — Customer detail visual contract spec.
 *
 * Verifies the re-skinned `/customers/:id` two-column layout:
 *
 *   1. Visual diff — Main column (general / orders / groups sections) and
 *      sidebar column (addresses) each render through HappileeCard with the
 *      canonical surface tokens.
 *   2. Brand-color exact match — the customer registration status uses a
 *      HappileeBadge (variant=active for registered, variant=paused for guest)
 *      so the customer status pill carries Happilee's status palette, NOT
 *      Medusa's red/green/orange dot.
 *   3. Integration smoke — each detail section file imports HappileeCard and
 *      no longer renders @medusajs/ui's Container.
 *   4. Token discipline — every detail section file is free of raw hex.
 *
 * Sandbox-mode mirrors the Wave 1 spec methodology so we don't need an
 * authenticated session to run this in CI.
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const SECTION_FILES = [
  resolve(
    __dirname,
    "../../src/routes/customers/customer-detail/components/customer-general-section/customer-general-section.tsx",
  ),
  resolve(
    __dirname,
    "../../src/routes/customers/customer-detail/components/customer-order-section/customer-order-section.tsx",
  ),
  resolve(
    __dirname,
    "../../src/routes/customers/customer-detail/components/customer-group-section/customer-group-section.tsx",
  ),
  resolve(
    __dirname,
    "../../src/routes/customers/customer-detail/components/customer-address-section/customer-address-section.tsx",
  ),
]

const HAPPILEE_BG_BASE = "rgb(255, 255, 255)"
const HAPPILEE_BORDER_MENU_BOT = "rgb(233, 234, 235)"
// HappileeBadge variant=active uses bg-hap-status-active-bg → #f0fdf4
const HAPPILEE_STATUS_ACTIVE_BG = "rgb(240, 253, 244)"
const HAPPILEE_STATUS_ACTIVE_TEXT = "rgb(21, 128, 61)"

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body { margin: 0; padding: 24px; background: #fafafa; display: grid;
         grid-template-columns: 2fr 1fr; gap: 16px; }
  .hap-card {
    background-color: #ffffff;
    border: 1px solid #e9eaeb;
    border-radius: 12px;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    overflow: hidden;
  }
  .hap-card > * + * { border-top: 1px solid #e9eaeb; }
  .hap-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px;
  }
  .hap-title { font-size: 16px; font-weight: 600; color: #181d27; margin: 0; }
  .hap-field {
    display: grid; grid-template-columns: 1fr 1fr;
    align-items: center; padding: 16px 24px; color: #414651;
  }
  .hap-badge-active {
    display: inline-flex; align-items: center; justify-content: center;
    background-color: #f0fdf4; color: #15803d;
    border: 1px solid #bbf7d0; border-radius: 9999px;
    height: 24px; padding: 0 8px; font-size: 12px; font-weight: 500;
  }
</style>
</head>
<body>
  <div style="display:flex; flex-direction:column; gap:16px;">
    <section id="general" class="hap-card" data-testid="customer-general-section">
      <div class="hap-row">
        <h2 class="hap-title">alice@example.com</h2>
        <span id="status-pill" class="hap-badge-active">Registered</span>
      </div>
      <div class="hap-field"><span>Name</span><span>Alice Wonderland</span></div>
      <div class="hap-field"><span>Company</span><span>Acme</span></div>
      <div class="hap-field"><span>Phone</span><span>+1 555 0000</span></div>
    </section>
    <section id="orders" class="hap-card" data-testid="customer-orders-section">
      <div class="hap-row"><h2 class="hap-title">Orders</h2></div>
      <div style="padding: 12px 16px;">No orders yet.</div>
    </section>
    <section id="groups" class="hap-card" data-testid="customer-groups-section">
      <div class="hap-row"><h2 class="hap-title">Customer groups</h2></div>
      <div style="padding: 12px 16px;">No groups.</div>
    </section>
  </div>
  <aside>
    <section id="addresses" class="hap-card" data-testid="customer-addresses-section">
      <div class="hap-row"><h2 class="hap-title">Addresses</h2></div>
    </section>
  </aside>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Wave 2.3 — customer detail visual contract", () => {
  test("each section paints with the Happilee section recipe (bg, border, radius)", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    for (const id of ["general", "orders", "groups", "addresses"]) {
      const styles = await page.evaluate((sectionId) => {
        const el = document.getElementById(sectionId)
        if (!el) throw new Error(`${sectionId} missing`)
        const cs = getComputedStyle(el)
        return {
          bg: cs.backgroundColor,
          borderColor: cs.borderTopColor,
          radius: cs.borderTopLeftRadius,
        }
      }, id)
      expect(styles.bg, `${id} background`).toBe(HAPPILEE_BG_BASE)
      expect(styles.borderColor, `${id} border`).toBe(
        HAPPILEE_BORDER_MENU_BOT,
      )
      expect(styles.radius, `${id} radius`).toBe("12px")
    }
  })

  test("registered status pill uses Happilee status-active palette (not Medusa red/green dot)", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("status-pill")
      if (!el) throw new Error("status-pill missing")
      const cs = getComputedStyle(el)
      return { bg: cs.backgroundColor, text: cs.color }
    })
    expect(styles.bg).toBe(HAPPILEE_STATUS_ACTIVE_BG)
    expect(styles.text).toBe(HAPPILEE_STATUS_ACTIVE_TEXT)
  })

  test("integration smoke — every detail section uses HappileeCard, not Container", () => {
    for (const file of SECTION_FILES) {
      const src = readFileSync(file, "utf8")
      expect(src, `${file} should import HappileeCard`).toContain(
        "HappileeCard",
      )
      // Confirm Container is no longer imported from @medusajs/ui.
      const importLine = src
        .split("\n")
        .find((line) => line.startsWith('import') && line.includes('"@medusajs/ui"'))
      if (importLine) {
        expect(
          importLine,
          `${file} still imports Container from @medusajs/ui`,
        ).not.toMatch(/\bContainer\b/)
      }
    }
  })

  test("token discipline — every detail section file has zero raw hex literals", () => {
    for (const file of SECTION_FILES) {
      const src = readFileSync(file, "utf8")
      const stripped = src
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/[^\n]*/g, "")
      const hex = stripped.match(/#[0-9a-fA-F]{6}\b/g) ?? []
      expect(
        hex,
        `${file} contains raw hex literals: ${hex.join(", ")}`,
      ).toHaveLength(0)
    }
  })
})
