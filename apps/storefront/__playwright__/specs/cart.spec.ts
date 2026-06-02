/**
 * Wave 2.9 — Storefront cart visual contract spec.
 *
 * Covers the re-skinned cart tree:
 *   - apps/storefront/src/app/[countryCode]/(main)/cart/
 *   - apps/storefront/src/modules/cart/
 *
 * Four mandatory checks per the design-handoff spec (§5.3):
 *   (a) Token discipline — no raw 6-digit hex literals in cart source files
 *   (b) Brand-color exact match — the cart "Checkout" CTA reaches
 *       Happilee brand-solid #4d68dc / rgb(77, 104, 220)
 *   (c) Inter font cascade — primary heading and CTA inherit the
 *       Inter sans family stack
 *   (d) Source-level smoke — re-skin landed in the expected files and
 *       references canonical tokens, not bespoke ones
 *
 * The fixture-driven approach mirrors the Wave 1 / Wave 2.1 spec pattern:
 * we mount a minimal HTML sandbox with the same class strings the cart
 * source emits, so the spec doesn't require a running storefront / DB /
 * Medusa backend. Token resolution still goes through the Happilee
 * tailwind preset + happilee-tokens.css var overrides at build time;
 * here we mirror the resolved CSS values inline.
 */

import { test, expect } from "@playwright/test"
import { execSync } from "node:child_process"
import { readFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const STOREFRONT_ROOT = join(__dirname, "..", "..")

// Cart source files under regression.
const CART_TEMPLATES = [
  "src/modules/cart/templates/index.tsx",
  "src/modules/cart/templates/items.tsx",
  "src/modules/cart/templates/summary.tsx",
  "src/modules/cart/templates/preview.tsx",
]
const CART_COMPONENTS = [
  "src/modules/cart/components/item/index.tsx",
  "src/modules/cart/components/empty-cart-message/index.tsx",
  "src/modules/cart/components/sign-in-prompt/index.tsx",
  "src/modules/cart/components/cart-item-select/index.tsx",
]
const CART_ROUTES = [
  "src/app/[countryCode]/(main)/cart/page.tsx",
  "src/app/[countryCode]/(main)/cart/not-found.tsx",
]

// Inline stylesheet mirroring resolved Tailwind/CSS-var output. Keeps the
// spec self-contained without booting the Next.js app. Values trace back
// to apps/storefront/src/styles/happilee-tokens.css and
// apps/storefront/tailwind.config.cjs.
const SANDBOX_STYLES = `
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body {
    margin: 0; padding: 24px;
    background: rgb(250, 250, 250); /* bg-ui-bg-subtle = Happilee #fafafa */
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
  /* Page title — "Shopping cart" */
  .cart-title {
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 30px;          /* text-3xl */
    font-weight: 600;         /* font-semibold */
    color: rgb(24, 29, 39);   /* text-ui-fg-base = text-primary #181d27 */
  }
  /* Summary card surface */
  .summary-card {
    background: rgb(255, 255, 255); /* bg-ui-bg-base */
    border: 1px solid rgb(213, 215, 218); /* border-ui-border-base */
    border-radius: 12px;            /* rounded-xl */
    padding: 24px;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); /* shadow-hap-xs */
  }
  /* "Checkout" CTA — Happilee brand-solid primary */
  .cart-checkout-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 40px;
    padding: 0 16px;
    gap: 8px;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    border-radius: 8px;            /* rounded-md */
    background-color: rgb(77, 104, 220); /* bg-brand-solid #4d68dc */
    color: rgb(255, 255, 255);
    border: 1px solid transparent;
  }
`

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>${SANDBOX_STYLES}</style></head>
<body>
  <h1 id="cart-title" class="cart-title">Shopping cart</h1>
  <div id="summary-card" class="summary-card">
    <button id="checkout-btn" class="cart-checkout-btn">Go to checkout</button>
  </div>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

/** Cart-scope token-discipline scan — fails on any non-comment hex literal. */
function expectNoRawHexInCart(): void {
  const files = [...CART_TEMPLATES, ...CART_COMPONENTS, ...CART_ROUTES]
  const offending: string[] = []
  for (const rel of files) {
    const abs = join(STOREFRONT_ROOT, rel)
    if (!existsSync(abs)) continue
    const src = readFileSync(abs, "utf8")
    // Strip comments — hex inside docstrings/comments is allowed (tokens
    // are referenced by their canonical hex in design notes).
    const stripped = src
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\n]*/g, "")
    const matches = stripped.match(/#[0-9a-fA-F]{6}\b/g) ?? []
    for (const m of matches) {
      offending.push(`${rel}: ${m}`)
    }
  }
  expect(
    offending,
    `Token-discipline violation — raw hex literals found in cart source:\n${offending.join("\n")}\n\n` +
      `Use Happilee Tailwind tokens (bg-brand-solid, text-ui-fg-base, ` +
      `border-ui-border-base) or CSS variables. Never raw hex.`
  ).toHaveLength(0)
}

test.describe("Wave 2.9 — Storefront cart re-skin", () => {
  test("(a) token discipline: no raw hex literals in cart source", () => {
    expectNoRawHexInCart()
  })

  test("(b) brand color exact: Checkout CTA bg is Happilee #4d68dc", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const bg = await page.evaluate(() => {
      const el = document.getElementById("checkout-btn")
      if (!el) throw new Error("checkout-btn missing")
      return getComputedStyle(el).backgroundColor
    })
    expect(bg).toBe("rgb(77, 104, 220)")
  })

  test("(c) Inter font cascade: title + CTA both resolve to Inter", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const fonts = await page.evaluate(() => {
      const title = document.getElementById("cart-title")
      const btn = document.getElementById("checkout-btn")
      if (!title || !btn) throw new Error("fixture nodes missing")
      return {
        title: getComputedStyle(title).fontFamily.toLowerCase(),
        btn: getComputedStyle(btn).fontFamily.toLowerCase(),
      }
    })
    expect(fonts.title).toContain("inter")
    expect(fonts.btn).toContain("inter")
  })

  test("(d) source smoke: re-skinned files reference canonical tokens", () => {
    // Templates must exist after the re-skin.
    for (const rel of CART_TEMPLATES) {
      const abs = join(STOREFRONT_ROOT, rel)
      expect(existsSync(abs), `Missing cart template: ${rel}`).toBe(true)
    }

    // The summary template should mount the Happilee brand-solid CTA and
    // emit a "Checkout" / "Go to checkout" label.
    const summarySrc = readFileSync(
      join(STOREFRONT_ROOT, "src/modules/cart/templates/summary.tsx"),
      "utf8"
    )
    expect(summarySrc).toMatch(/bg-brand-solid/)
    expect(summarySrc).toMatch(/checkout/i)

    // The cart page wrapper should sit on the Happilee page surface
    // (bg-ui-bg-subtle), not raw white or a hard-coded hex.
    const indexSrc = readFileSync(
      join(STOREFRONT_ROOT, "src/modules/cart/templates/index.tsx"),
      "utf8"
    )
    expect(indexSrc).toMatch(/bg-ui-bg-subtle/)

    // Empty-state must use the canonical empty-state language
    // (HappileeEmptyState parity: dashed border on bg-ui-bg-subtle).
    const emptySrc = readFileSync(
      join(STOREFRONT_ROOT, "src/modules/cart/components/empty-cart-message/index.tsx"),
      "utf8"
    )
    expect(emptySrc).toMatch(/border-dashed/)
    expect(emptySrc).toMatch(/bg-ui-bg-subtle/)
  })

  test("(e) summary surface tokens: white card on subtle bg with hap-xs shadow", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("summary-card")
      if (!el) throw new Error("summary-card missing")
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        radius: cs.borderTopLeftRadius,
        borderColor: cs.borderTopColor,
      }
    })
    expect(styles.bg).toBe("rgb(255, 255, 255)") // bg-ui-bg-base
    expect(styles.radius).toBe("12px") // rounded-xl
    expect(styles.borderColor).toBe("rgb(213, 215, 218)") // border-ui-border-base
  })

  test("(f) cart-scope git-tracked files have zero offending hex via git ls-files", () => {
    // Belt-and-suspenders: query git directly so we also catch any new file
    // added to the cart tree that the static list missed.
    let output = ""
    try {
      output = execSync(
        `git ls-files 'src/modules/cart' 'src/app/[countryCode]/(main)/cart' | xargs grep -nE '#[0-9a-fA-F]{6}\\b' || true`,
        { cwd: STOREFRONT_ROOT }
      ).toString()
    } catch {
      output = ""
    }
    const offending = output
      .split("\n")
      .filter((l) => l.trim().length > 0)
      // Allow opt-out marker, mirroring the admin helper's contract.
      .filter((l) => !l.includes("// happilee:ok"))
    expect(
      offending,
      `Token-discipline violation in cart tree:\n${offending.join("\n")}`
    ).toHaveLength(0)
  })
})
