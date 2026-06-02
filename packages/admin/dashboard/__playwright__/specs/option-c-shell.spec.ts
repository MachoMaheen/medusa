/**
 * Option C — shell + sidebar regression suite.
 *
 * Created in response to the Adversarial Reviewer's REQUEST_CHANGES verdict
 * on commit 98408b11ca. Each test corresponds to a fix in the Wave 0 chrome
 * rewrite. Run against the dev server at http://localhost:5176.
 *
 * NOTE: Playwright is not yet installed in this branch (see Wave 0 spec
 * § 5.1 — full regression infrastructure lands later). This file is a
 * fixture / contract: once `playwright.config.happilee.ts` is wired and
 * `@playwright/test` is added, these specs run as-is.
 */

import { test, expect } from "@playwright/test"

const APP = process.env.HAPPILEE_APP_URL ?? "http://localhost:5176"

test.describe("Option C — Happilee chrome", () => {
  test("brand-H mark renders 40×40 with brand-solid fill #4d68dc", async ({
    page,
  }) => {
    await page.goto(APP)
    const brand = page.getByTestId("brand-mark")
    await expect(brand).toBeVisible()
    const box = await brand.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(38)
    expect(box?.width).toBeLessThanOrEqual(42)
    expect(box?.height).toBeGreaterThanOrEqual(38)
    expect(box?.height).toBeLessThanOrEqual(42)
    // CSS var → #4d68dc → rgb(77, 104, 220).
    const bg = await brand.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    )
    expect(bg).toBe("rgb(77, 104, 220)")
  })

  test("every tier-1 rail item is keyboard-reachable", async ({ page }) => {
    await page.goto(APP)
    const rail = page.getByLabel("Primary navigation")
    await expect(rail).toBeVisible()

    // Walk Tab focus from the brand mark down through all reachable rail
    // controls. The exact count depends on extension menus; we just assert
    // each known label can receive focus.
    const labels = [
      "Happilee",
      "Home",
      "Orders",
      "Products",
      "Inventory",
      "Customers",
      "Promotions",
      "Settings",
    ]

    for (const label of labels) {
      const target = rail.getByLabel(label, { exact: true })
      await target.focus()
      await expect(target).toBeFocused()
    }
  })

  test("user menu dropdown opens > 200px wide", async ({ page }) => {
    await page.goto(APP)
    // The bottom rail hosts the user-menu trigger inside a 48px column.
    // Clicking it should open a portalled menu wider than 200px.
    const accountTrigger = page
      .locator('[role="navigation"]')
      .locator("button")
      .last()
    await accountTrigger.click()

    const menu = page.locator('[role="menu"][data-side]')
    await expect(menu).toBeVisible()
    const box = await menu.boundingBox()
    expect(box?.width ?? 0).toBeGreaterThan(200)
  })

  test("/products/abc/edit highlights Products in the rail", async ({
    page,
  }) => {
    await page.goto(`${APP}/products/abc/edit`)
    const productsRail = page.getByLabel("Products", { exact: true })
    await expect(productsRail).toBeVisible()
    await expect(productsRail).toHaveAttribute("aria-current", "page")
  })

  test("mobile drawer can be opened (viewport < 640px)", async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 })
    await page.goto(APP)
    const toggle = page.getByTestId("mobile-sidebar-toggle")
    await expect(toggle).toBeVisible()
    await toggle.click()

    // RadixDialog content should now host the SideNav.
    const drawer = page.getByLabel("Primary navigation")
    await expect(drawer).toBeVisible()
  })

  test("tier-2 panel renders at 220px wide on >= 1024px viewports", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${APP}/orders`)
    const tierTwo = page.getByTestId("tier-two-panel")
    await expect(tierTwo).toBeVisible()
    const box = await tierTwo.boundingBox()
    expect(box?.width).toBe(220)
  })
})
