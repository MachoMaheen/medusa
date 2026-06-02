/**
 * Wave 2.10 — Checkout re-skin visual contract.
 *
 * The four canonical regression checks per the Happilee Commerce re-skin
 * spec (docs/superpowers/specs/2026-06-02-medusa-happilee-design-handoff.md
 * §3, §4.4, §5):
 *
 *   (a) Token discipline — static scan of every Wave 2.10 source file for
 *       raw hex literals. Comments are stripped before scanning so docstrings
 *       that reference hex for human readers don't trip the check.
 *
 *   (b) Brand color exact match — the "Place order" button MUST render with
 *       exactly the canonical Happilee brand-solid surface (#4d68dc =
 *       rgb(77, 104, 220)).
 *
 *   (c) Inter font cascade — the body computed font-family must include
 *       "Inter" (case-insensitive).
 *
 *   (d) Step stepper renders — the 4-step list (Address / Shipping /
 *       Payment / Review) must be present in the DOM with the documented
 *       data-testid hooks.
 *
 * Static checks (a) run without a dev server. Browser checks (b)(c)(d)
 * require the storefront dev server to be running on the baseURL configured
 * in the (forthcoming) playwright.config.happilee.ts for the storefront. The
 * spec is the durable contract; the config is a project-level concern
 * tracked separately.
 */

import { test, expect } from "@playwright/test"
import * as fs from "node:fs"
import * as path from "node:path"

const REPO_STOREFRONT = path.resolve(__dirname, "../..")
const CHECKOUT_PATH = "/us/checkout"

// All Wave 2.10 source files that must be free of raw hex literals.
const RESKIN_SOURCE_FILES = [
  "src/app/[countryCode]/(checkout)/layout.tsx",
  "src/app/[countryCode]/(checkout)/checkout/page.tsx",
  "src/modules/checkout/templates/checkout-form/index.tsx",
  "src/modules/checkout/templates/checkout-summary/index.tsx",
  "src/modules/checkout/components/addresses/index.tsx",
  "src/modules/checkout/components/shipping/index.tsx",
  "src/modules/checkout/components/payment/index.tsx",
  "src/modules/checkout/components/review/index.tsx",
  "src/modules/checkout/components/payment-button/index.tsx",
  "src/modules/checkout/components/error-message/index.tsx",
  "src/modules/checkout/components/step-stepper/index.tsx",
  "src/modules/checkout/components/happilee-input/index.tsx",
] as const

function readSourceWithoutComments(relPath: string): string {
  const abs = path.join(REPO_STOREFRONT, relPath)
  const raw = fs.readFileSync(abs, "utf8")
  return raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
}

test.describe("Wave 2.10 — Checkout token discipline (static)", () => {
  for (const relPath of RESKIN_SOURCE_FILES) {
    test(`${relPath} contains no raw hex literals`, () => {
      const codeOnly = readSourceWithoutComments(relPath)
      const hexPattern = /#[0-9a-fA-F]{3,8}\b/g
      const matches = codeOnly.match(hexPattern) ?? []
      expect(matches, `Raw hex found in ${relPath}: ${matches.join(", ")}`).toEqual([])
    })
  }
})

test.describe("Wave 2.10 — Checkout brand-color exact match", () => {
  test("'Place order' button surface is rgb(77, 104, 220) (#4d68dc)", async ({
    page,
  }) => {
    await page.goto(CHECKOUT_PATH)

    const button = page.locator(
      "[data-testid='summary-place-order-button']"
    )
    await expect(button).toBeVisible()

    const bg = await button.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    )
    expect(bg.replace(/\s+/g, "")).toBe("rgb(77,104,220)")
  })
})

test.describe("Wave 2.10 — Inter font cascade", () => {
  test("checkout body uses Inter in the font-family stack", async ({ page }) => {
    await page.goto(CHECKOUT_PATH)
    const family = await page.evaluate(
      () => getComputedStyle(document.body).fontFamily
    )
    expect(family.toLowerCase()).toContain("inter")
  })
})

test.describe("Wave 2.10 — Step stepper renders all 4 steps", () => {
  test("stepper exposes Address, Shipping, Payment and Review steps", async ({
    page,
  }) => {
    await page.goto(CHECKOUT_PATH)

    const stepper = page.locator("[data-testid='checkout-step-stepper']")
    await expect(stepper).toBeVisible()

    const expectedSteps = ["address", "delivery", "payment", "review"] as const

    for (const id of expectedSteps) {
      await expect(
        page.locator(`[data-testid='checkout-step-${id}']`).first()
      ).toBeVisible()
    }

    // Active step must carry data-status='active' on exactly one entry.
    const activeCount = await page
      .locator("[data-testid^='checkout-step-'][data-status='active']")
      .count()
    expect(activeCount).toBe(1)
  })
})
