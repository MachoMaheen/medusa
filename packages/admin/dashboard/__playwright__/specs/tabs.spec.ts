/**
 * Wave 1.9 — HappileeTabs visual contract spec.
 *
 * Verifies the Happilee v3 tab signature on the dashboard:
 *   1. Container background is bg-secondary (#fafafa) with rounded-md (8px).
 *   2. Active trigger is white (#ffffff) with the shadow-hap-xs lift-off.
 *   3. Inactive triggers are transparent (rgba(0,0,0,0)).
 *   4. Inter is in the computed font family on triggers.
 *   5. The HappileeTabs source file contains no raw hex literals — every
 *      color must come from a token (Tailwind utility or CSS var).
 *
 * Strategy: We mount a HappileeTabs-shaped fragment via DOM injection onto
 * the running dashboard route so the page's compiled Tailwind layer is in
 * scope. This avoids requiring a dedicated story route while still asserting
 * against the real CSS bundle the user will see.
 */

import { promises as fs } from "node:fs"
import path from "node:path"
import { expect, test } from "@playwright/test"

// Resolve the component source from the spec location so the static-source
// check survives test relocation.
const HAPPILEE_TABS_SRC = path.resolve(
  __dirname,
  "../../src/components/common/happilee-tabs/happilee-tabs.tsx"
)

const TAB_FIXTURE_HTML = `
  <div data-testid="happilee-tabs-fixture" class="font-sans">
    <div
      data-testid="happilee-tabs-list"
      role="tablist"
      class="inline-flex w-fit items-center bg-ui-bg-subtle rounded-md p-1 gap-1 border border-transparent"
    >
      <button
        data-testid="happilee-tab-active"
        data-state="active"
        type="button"
        class="font-sans text-sm leading-5 text-ui-fg-subtle rounded-sm px-3.5 py-1.5 inline-flex items-center justify-center whitespace-nowrap transition-all outline-none data-[state=active]:bg-ui-bg-base data-[state=active]:text-ui-fg-base data-[state=active]:font-medium data-[state=active]:shadow-hap-xs"
      >Overview</button>
      <button
        data-testid="happilee-tab-inactive"
        data-state="inactive"
        type="button"
        class="font-sans text-sm leading-5 text-ui-fg-subtle rounded-sm px-3.5 py-1.5 inline-flex items-center justify-center whitespace-nowrap transition-all outline-none hover:bg-black/5"
      >Settings</button>
    </div>
  </div>
`

// Convert "rgb(r, g, b)" or "rgba(r, g, b, a)" to a normalized "rgb(r,g,b)" form
// so equality checks don't fail on whitespace formatting differences across
// browsers.
function normalizeRgb(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase()
}

test.describe("Wave 1.9 — HappileeTabs visual contract", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    // Inject the tab fixture so we can assert against the live Tailwind layer.
    await page.evaluate((html) => {
      const host = document.createElement("div")
      host.id = "__happilee_tabs_fixture_host__"
      host.style.position = "fixed"
      host.style.top = "0"
      host.style.left = "0"
      host.style.zIndex = "2147483647"
      host.innerHTML = html
      document.body.appendChild(host)
    }, TAB_FIXTURE_HTML)
  })

  test("container has #fafafa background and rounded-md (8px)", async ({
    page,
  }) => {
    const list = page.getByTestId("happilee-tabs-list")
    const styles = await list.evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        radius: cs.borderTopLeftRadius,
        padding: cs.paddingTop,
      }
    })
    // bg-ui-bg-subtle is overridden to "250 250 250" by happilee-tokens.css.
    expect(normalizeRgb(styles.bg)).toBe("rgb(250,250,250)")
    // rounded-md token = 8px.
    expect(styles.radius).toBe("8px")
    // p-1 = 4px.
    expect(styles.padding).toBe("4px")
  })

  test("active tab is white with shadow-hap-xs (lift off)", async ({ page }) => {
    const active = page.getByTestId("happilee-tab-active")
    const styles = await active.evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        shadow: cs.boxShadow,
        weight: cs.fontWeight,
      }
    })
    // bg-ui-bg-base is overridden to "255 255 255".
    expect(normalizeRgb(styles.bg)).toBe("rgb(255,255,255)")
    // shadow-hap-xs token value: "0 1px 2px 0 rgba(0,0,0,0.05)" — Chromium
    // normalizes it to "rgba(0, 0, 0, 0.05) 0px 1px 2px 0px".
    expect(styles.shadow).toContain("rgba(0, 0, 0, 0.05)")
    expect(styles.shadow).toContain("1px 2px")
    // font-medium = 500.
    expect(styles.weight).toBe("500")
  })

  test("inactive tab has transparent background", async ({ page }) => {
    const inactive = page.getByTestId("happilee-tab-inactive")
    const bg = await inactive.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    )
    // Transparent renders as rgba(0, 0, 0, 0) in every browser.
    expect(normalizeRgb(bg)).toBe("rgba(0,0,0,0)")
  })

  test("Inter is in the computed font family on tab triggers", async ({
    page,
  }) => {
    const active = page.getByTestId("happilee-tab-active")
    const family = await active.evaluate(
      (el) => getComputedStyle(el).fontFamily
    )
    expect(family.toLowerCase()).toContain("inter")
  })

  test("happilee-tabs.tsx source contains no raw hex literals", async () => {
    const source = await fs.readFile(HAPPILEE_TABS_SRC, "utf8")
    // Strip block AND line comments — the design contract docblock cites
    // token hex values for human reference; the runtime code must not.
    const codeOnly = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/.*$/gm, "$1")
    const hexLiterals = codeOnly.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []
    expect(hexLiterals).toEqual([])
  })
})
