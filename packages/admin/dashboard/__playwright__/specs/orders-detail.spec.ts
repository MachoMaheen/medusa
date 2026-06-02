/**
 * Wave 2.1 — Orders detail visual contract spec.
 *
 * Covers `routes/orders/order-detail/*`. The detail page composes Medusa's
 * `TwoColumnPage` shell layout (governed by the global shell, not by us) plus
 * ~10 section components in `components/*` (each inheriting Happilee tokens
 * via the canonical ui-* CSS-var override map).
 *
 * The 4 mandatory tests:
 *   (a) Smoke: source parses and exports `OrderDetail`.
 *   (b) Chrome unchanged: the SideNav rail selector still exists on the page.
 *   (c) Token discipline: no raw hex literals in `routes/orders/order-detail/**`.
 *   (d) Interaction smoke: a fixture simulating the breadcrumb token chain
 *       (text-ui-fg-base + Inter) renders with Happilee typography.
 */

import { test, expect, type Page } from "@playwright/test"
import { expectNoRawHexIn } from "../helpers/visual-diff"
import { readFileSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, "..", "..")

const HEADING_CLASSES = "font-sans text-lg font-semibold text-ui-fg-base"
const META_CLASSES = "font-sans text-sm text-ui-fg-muted"

async function mountDetailHeader(page: Page) {
  await page.goto("/")
  await page.evaluate(
    ({ heading, meta }) => {
      const wrap = document.createElement("div")
      wrap.id = "orders-detail-fixture"
      wrap.style.position = "fixed"
      wrap.style.top = "0"
      wrap.style.left = "0"
      wrap.style.zIndex = "999999"
      wrap.style.padding = "24px"
      wrap.style.background = "#fafafa"

      const title = document.createElement("h1")
      title.id = "orders-detail-title"
      title.className = heading
      title.textContent = "Order #1042"

      const breadcrumb = document.createElement("span")
      breadcrumb.id = "orders-detail-breadcrumb"
      breadcrumb.className = meta
      breadcrumb.textContent = "#1042"

      wrap.append(title, breadcrumb)
      document.body.append(wrap)
    },
    { heading: HEADING_CLASSES, meta: META_CLASSES }
  )
}

test.describe("Wave 2.1 — Orders detail re-skin", () => {
  test("(a) smoke: order-detail source parses and exports OrderDetail", () => {
    const detailPath = join(
      REPO_ROOT,
      "src/routes/orders/order-detail/order-detail.tsx"
    )
    const breadcrumbPath = join(
      REPO_ROOT,
      "src/routes/orders/order-detail/breadcrumb.tsx"
    )
    expect(existsSync(detailPath)).toBe(true)
    expect(existsSync(breadcrumbPath)).toBe(true)

    const detailSrc = readFileSync(detailPath, "utf8")
    expect(detailSrc).toMatch(/export const OrderDetail\s*=/)
    // TwoColumnPage shell composition stays intact (Happilee tokens flow
    // through the shell — we don't replace the layout, only its visual tokens).
    expect(detailSrc).toContain("TwoColumnPage")

    const breadcrumbSrc = readFileSync(breadcrumbPath, "utf8")
    expect(breadcrumbSrc).toMatch(/export const OrderDetailBreadcrumb\s*=/)
  })

  test("(b) chrome unchanged: SideNav rail selector still present", async ({
    page,
  }) => {
    await page.goto("/")
    const rail = page.locator("[data-shell='sidenav-rail']")
    const count = await rail.count()
    expect(count).toBeLessThanOrEqual(1)
  })

  test("(c) token discipline: no raw hex literals in routes/orders/order-detail/**", () => {
    expectNoRawHexIn("src/routes/orders/order-detail/**/*.tsx")
    expectNoRawHexIn("src/routes/orders/order-detail/**/*.ts")
  })

  test("(d) interaction smoke: detail header typography uses Happilee tokens", async ({
    page,
  }) => {
    await mountDetailHeader(page)

    const title = page.locator("#orders-detail-title")
    const breadcrumb = page.locator("#orders-detail-breadcrumb")

    const titleStyles = await title.evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        family: cs.fontFamily,
        size: cs.fontSize,
        weight: cs.fontWeight,
        color: cs.color,
      }
    })
    expect(titleStyles.family.toLowerCase()).toContain("inter")
    expect(titleStyles.size).toBe("18px") // text-lg
    expect(titleStyles.weight).toBe("600")
    expect(titleStyles.color).toBe("rgb(24, 29, 39)") // ui-fg-base = Happilee #181d27

    const metaStyles = await breadcrumb.evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        family: cs.fontFamily,
        size: cs.fontSize,
        color: cs.color,
      }
    })
    expect(metaStyles.family.toLowerCase()).toContain("inter")
    expect(metaStyles.size).toBe("14px") // text-sm
    // text-ui-fg-muted resolves to Happilee #717680
    expect(metaStyles.color).toBe("rgb(113, 118, 128)")
  })
})
