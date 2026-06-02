/**
 * Option B (56px rail) regression spec.
 *
 * Covers the three reviewer-mandated assertions:
 *   1. Sidebar container width is 56px (rail collapsed).
 *   2. Brand-H mark renders with backgroundColor rgb(77, 104, 220)
 *      — exactly the Happilee v3 brand-solid #4d68dc.
 *   3. Dropdown menus still work (regression guard for the H-6
 *      tooltip rule that was deleted in this fix).
 *
 * Wire-up:
 *   - Requires `@playwright/test` to be installed at the workspace root.
 *   - Requires the dev server to be running on http://localhost:5175
 *     (or set BASE_URL env var).
 *   - Add the playwright project to packages/admin/dashboard/package.json
 *     and run via `yarn workspace @medusajs/dashboard test:e2e`.
 */

import { expect, test } from "@playwright/test"

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5175"
const ADMIN_PATH = process.env.ADMIN_PATH ?? "/app"

test.describe("Option B rail — Happilee v3 56px shell", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}${ADMIN_PATH}`, { waitUntil: "networkidle" })
  })

  test("desktop sidebar container is exactly 56px wide", async ({ page }) => {
    // The shell-restyle.css selector is `[class~="w-[220px]"]:has(> aside)`.
    // We look for the element matching that locator and assert its
    // computed width is 56px (rail collapsed). Hover state is excluded
    // here — we read width before any mouse movement.
    const rail = page.locator('[class~="w-\\[220px\\]"]:has(> aside)').first()
    await rail.waitFor({ state: "visible", timeout: 10_000 })
    const width = await rail.evaluate(
      (el: HTMLElement) => parseFloat(getComputedStyle(el).width)
    )
    expect(width).toBe(56)
  })

  test("brand H mark renders with exact #4d68dc background", async ({
    page,
  }) => {
    // The workspace switcher grid trigger gets the brand-solid bg via
    // shell-restyle.css. We sample its computed bg color.
    const brandMark = page
      .locator(
        '[class~="w-\\[220px\\]"]:has(> aside) aside [class*="grid-cols-[24px_1fr_15px]"]'
      )
      .first()
    await brandMark.waitFor({ state: "visible", timeout: 10_000 })
    const bg = await brandMark.evaluate(
      (el: HTMLElement) => getComputedStyle(el).backgroundColor
    )
    // #4d68dc → rgb(77, 104, 220). Allow rgba() if alpha=1.
    expect(bg.replace(/\s+/g, "")).toMatch(
      /^rgba?\(77,104,220(?:,1)?\)$/
    )
  })

  test("dropdown menus still open and render content (H-6 deletion guard)", async ({
    page,
  }) => {
    // Open the user menu via the bottom UserBadge trigger (a button
    // inside the sticky bottom-0 band). After click the Radix
    // dropdown content portal must appear with width > 100px — proving
    // we didn't regress Radix poppers.
    const userButton = page
      .locator(
        '[class~="w-\\[220px\\]"]:has(> aside) aside .sticky.bottom-0 button'
      )
      .first()
    await userButton.waitFor({ state: "visible", timeout: 10_000 })
    await userButton.click()

    // Radix dropdown content has data-radix-popper-content-wrapper or
    // role=menu. Either is acceptable.
    const popper = page
      .locator(
        '[data-radix-popper-content-wrapper], [role="menu"][data-state="open"]'
      )
      .first()
    await popper.waitFor({ state: "visible", timeout: 5_000 })
    const popperBox = await popper.boundingBox()
    expect(popperBox?.width ?? 0).toBeGreaterThan(100)
  })
})
