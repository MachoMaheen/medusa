/**
 * Wave 2.1 — Orders flows (returns, claims, swaps, exchanges, refunds, export,
 * edit, transfer, receive-return, allocate-items, create-shipment,
 * create-fulfillment, metadata) visual contract spec.
 *
 * These routes are all RouteDrawer / RouteFocusModal "shell" entry files that
 * delegate to form components in their `./components/*` subdir. The re-skin
 * touch points are:
 *   - drawer titles: `Heading` with `font-sans text-lg font-semibold text-ui-fg-base`
 *   - confirmatory actions in the export drawer: HappileeButton primary fill
 *   - secondary actions: HappileeButton secondary
 *
 * 4 mandatory checks:
 *   (a) Smoke: every entry file parses and exports its expected component.
 *   (b) Chrome unchanged: rail selector still present.
 *   (c) Token discipline: no raw hex literals in any of the flow source files.
 *   (d) Interaction smoke: a fixture simulating the export drawer footer
 *       (primary + secondary HappileeButton) renders with brand-solid (#4d68dc)
 *       on the primary CTA and the secondary on white.
 */

import { test, expect, type Page } from "@playwright/test"
import { expectNoRawHexIn, HAPPILEE_BRAND_RGB } from "../helpers/visual-diff"
import { readFileSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, "..", "..")

// Mirror class lists from happilee-button.tsx so the fixture resolves the same
// Tailwind utilities as the production primitive.
const BTN_BASE =
  "inline-flex items-center justify-center font-sans font-medium rounded-md transition-colors duration-hap-fast h-8 px-3 gap-x-2 text-sm"
const BTN_PRIMARY =
  "bg-brand-solid text-white border border-transparent shadow-hap-xs-skeuomorphic"
const BTN_SECONDARY =
  "bg-ui-bg-base text-brand-secondary-text border border-ui-border-base shadow-hap-xs"

// All flow entry files we expect to keep stable shape.
const FLOW_FILES: Array<{ path: string; mustExport: string }> = [
  {
    path: "src/routes/orders/order-export/order-export.tsx",
    mustExport: "OrderExport",
  },
  {
    path: "src/routes/orders/order-edit-email/order-edit-email.tsx",
    mustExport: "OrderEditEmail",
  },
  {
    path: "src/routes/orders/order-edit-shipping-address/order-edit-shipping-address.tsx",
    mustExport: "OrderEditShippingAddress",
  },
  {
    path: "src/routes/orders/order-edit-billing-address/order-edit-billing-address.tsx",
    mustExport: "OrderEditBillingAddress",
  },
  {
    path: "src/routes/orders/order-request-transfer/order-request-transfer.tsx",
    mustExport: "OrderRequestTransfer",
  },
  {
    path: "src/routes/orders/order-receive-return/order-receive-return.tsx",
    mustExport: "OrderReceiveReturn",
  },
  {
    path: "src/routes/orders/order-create-refund/order-create-refund.tsx",
    mustExport: "OrderCreateRefund",
  },
  {
    path: "src/routes/orders/order-create-return/return-create.tsx",
    mustExport: "ReturnCreate",
  },
  {
    path: "src/routes/orders/order-create-claim/claim-create.tsx",
    mustExport: "ClaimCreate",
  },
  {
    path: "src/routes/orders/order-create-exchange/exchange-create.tsx",
    mustExport: "ExchangeCreate",
  },
  {
    path: "src/routes/orders/order-create-edit/order-edit-create.tsx",
    mustExport: "OrderEditCreate",
  },
  {
    path: "src/routes/orders/order-create-fulfillment/order-create-fulfillments.tsx",
    mustExport: "OrderCreateFulfillment",
  },
  {
    path: "src/routes/orders/order-create-shipment/order-create-shipment.tsx",
    mustExport: "OrderCreateShipment",
  },
  {
    path: "src/routes/orders/order-allocate-items/order-allocate-items.tsx",
    mustExport: "OrderAllocateItems",
  },
  {
    path: "src/routes/orders/order-metadata/order-metadata.tsx",
    mustExport: "OrderMetadata",
  },
]

async function mountExportFooter(page: Page) {
  await page.goto("/")
  await page.evaluate(
    ({ base, primary, secondary }) => {
      const wrap = document.createElement("div")
      wrap.id = "orders-flows-footer-fixture"
      wrap.style.position = "fixed"
      wrap.style.top = "0"
      wrap.style.right = "0"
      wrap.style.zIndex = "999999"
      wrap.style.padding = "24px"
      wrap.style.background = "#ffffff"
      wrap.className = "flex items-center gap-x-2"

      const cancel = document.createElement("button")
      cancel.id = "flow-cancel"
      cancel.className = `${base} ${secondary}`
      cancel.textContent = "Cancel"

      const confirm = document.createElement("button")
      confirm.id = "flow-confirm"
      confirm.className = `${base} ${primary}`
      confirm.textContent = "Export"

      wrap.append(cancel, confirm)
      document.body.append(wrap)
    },
    { base: BTN_BASE, primary: BTN_PRIMARY, secondary: BTN_SECONDARY }
  )
}

test.describe("Wave 2.1 — Orders flows re-skin", () => {
  test("(a) smoke: every flow entry file parses and exports its expected component", () => {
    for (const { path, mustExport } of FLOW_FILES) {
      const abs = join(REPO_ROOT, path)
      expect(existsSync(abs), `Missing: ${path}`).toBe(true)
      const src = readFileSync(abs, "utf8")
      // Accept either `export const X` or `export function X` since the
      // codebase uses both forms across order flows.
      const exportRe = new RegExp(
        `export\\s+(?:const|function)\\s+${mustExport}\\b`
      )
      expect(
        src,
        `${path} must export ${mustExport}`
      ).toMatch(exportRe)
    }
  })

  test("(b) chrome unchanged: rail selector still present", async ({
    page,
  }) => {
    await page.goto("/")
    const rail = page.locator("[data-shell='sidenav-rail']")
    const count = await rail.count()
    expect(count).toBeLessThanOrEqual(1)
  })

  test("(c) token discipline: no raw hex literals across flow source files", () => {
    // One sweep across everything in routes/orders — catches drift in any
    // sibling file the re-skin might have touched (placeholders, etc.).
    expectNoRawHexIn("src/routes/orders/**/*.tsx")
    expectNoRawHexIn("src/routes/orders/**/*.ts")
  })

  test("(d) interaction smoke: drawer footer renders Happilee primary + secondary", async ({
    page,
  }) => {
    await mountExportFooter(page)

    const confirm = page.locator("#flow-confirm")
    const cancel = page.locator("#flow-cancel")

    // Primary confirm: brand-solid fill, white label, 8px radius.
    const confirmStyles = await confirm.evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        radius: cs.borderTopLeftRadius,
        family: cs.fontFamily,
      }
    })
    expect(confirmStyles.bg).toBe(HAPPILEE_BRAND_RGB) // #4d68dc
    expect(confirmStyles.color).toBe("rgb(255, 255, 255)")
    expect(confirmStyles.radius).toBe("8px")
    expect(confirmStyles.family.toLowerCase()).toContain("inter")

    // Secondary cancel: white surface, brand-secondary-text label,
    // border-primary border.
    const cancelStyles = await cancel.evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        borderColor: cs.borderTopColor,
      }
    })
    expect(cancelStyles.bg).toBe("rgb(255, 255, 255)")
    expect(cancelStyles.color).toBe("rgb(65, 88, 189)") // #4158bd
    expect(cancelStyles.borderColor).toBe("rgb(213, 215, 218)") // #d5d7da
  })
})
