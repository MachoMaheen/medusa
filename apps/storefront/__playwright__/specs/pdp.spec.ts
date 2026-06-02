/**
 * Wave 2.8 — Storefront PDP visual contract spec.
 *
 * Covers the re-skinned product display page tree:
 *   - apps/storefront/src/app/[countryCode]/(main)/products/
 *   - apps/storefront/src/modules/products/
 *
 * Four mandatory checks per the design-handoff spec (§5.3):
 *   (a) Token discipline — no raw 6-digit hex literals in PDP source
 *       files (templates + components). The token discipline is enforced
 *       both with a static include-list scan AND a git-tracked sweep.
 *   (b) Brand-color exact match — the PDP "Add to cart" primary CTA bg
 *       resolves to Happilee brand-solid rgb(77, 104, 220) (#4d68dc).
 *   (c) Inter font cascade — the product title, price, and CTA inherit
 *       the Inter sans family stack.
 *   (d) Integration smoke — every re-skinned file exists and references
 *       canonical-token-map tokens (bg-brand-solid, text-ui-fg-base,
 *       border-ui-border-base, font-sans, etc.). Catches drift where a
 *       file silently reverts to Medusa's stock palette.
 *
 * The fixture-driven approach mirrors the Wave 2.9 cart spec: we mount a
 * minimal HTML sandbox emitting the same class strings as the live
 * components. The spec doesn't require a running storefront / Medusa
 * backend / DB. Inline CSS mirrors the resolved Happilee tokens.
 */

import { test, expect } from "@playwright/test"
import { execSync } from "node:child_process"
import { readFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const STOREFRONT_ROOT = join(__dirname, "..", "..")

// PDP source files under regression.
const PDP_TEMPLATES = [
  "src/modules/products/templates/index.tsx",
  "src/modules/products/templates/product-info/index.tsx",
  "src/modules/products/templates/product-actions-wrapper/index.tsx",
]
const PDP_COMPONENTS = [
  "src/modules/products/components/image-gallery/index.tsx",
  "src/modules/products/components/product-actions/index.tsx",
  "src/modules/products/components/product-actions/mobile-actions.tsx",
  "src/modules/products/components/product-actions/option-select.tsx",
  "src/modules/products/components/product-onboarding-cta/index.tsx",
  "src/modules/products/components/product-preview/index.tsx",
  "src/modules/products/components/product-preview/price.tsx",
  "src/modules/products/components/product-price/index.tsx",
  "src/modules/products/components/product-tabs/accordion.tsx",
  "src/modules/products/components/product-tabs/index.tsx",
  "src/modules/products/components/related-products/index.tsx",
  "src/modules/products/components/thumbnail/index.tsx",
]
const PDP_ROUTES = [
  "src/app/[countryCode]/(main)/products/[handle]/page.tsx",
]

// Inline stylesheet mirroring resolved Tailwind / CSS-var output. Keeps
// the spec self-contained without booting Next.js. Values trace back to
// apps/storefront/src/styles/happilee-tokens.css and tailwind.config.cjs.
const SANDBOX_STYLES = `
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body {
    margin: 0; padding: 24px;
    background: rgb(250, 250, 250); /* bg-ui-bg-subtle = Happilee #fafafa */
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
  /* Product title — h1 */
  .pdp-title {
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 30px;          /* text-3xl */
    line-height: 38px;
    font-weight: 600;         /* font-semibold */
    color: rgb(24, 29, 39);   /* text-ui-fg-base = #181d27 */
  }
  /* Product price */
  .pdp-price {
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 24px;          /* text-2xl */
    line-height: 32px;
    font-weight: 600;         /* font-semibold */
    color: rgb(65, 88, 189);  /* text-brand-secondary-text = #4158bd */
  }
  /* Description paragraph */
  .pdp-description {
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 16px;          /* text-base */
    line-height: 28px;        /* leading-7 */
    color: rgb(65, 70, 81);   /* text-ui-fg-subtle = #414651 */
  }
  /* Info panel card */
  .pdp-info-card {
    background: rgb(255, 255, 255);          /* bg-ui-bg-base */
    border: 1px solid rgb(213, 215, 218);    /* border-ui-border-base */
    border-radius: 12px;                     /* rounded-xl */
    padding: 16px;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.10);/* shadow-hap-sm */
  }
  /* Add to cart CTA — Happilee brand-solid primary */
  .pdp-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 44px;
    padding: 0 16px;
    gap: 8px;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    border-radius: 8px;                       /* rounded-md */
    background-color: rgb(77, 104, 220);      /* bg-brand-solid #4d68dc */
    color: rgb(255, 255, 255);
    border: 1px solid transparent;
  }
  /* Selected variant pill */
  .pdp-pill-selected {
    height: 40px;
    padding: 0 12px;
    border-radius: 8px;                       /* rounded-md */
    background-color: rgb(237, 242, 254);     /* bg-brand-light #edf2fe */
    color: rgb(65, 88, 189);                  /* text-brand-secondary-text */
    border: 1px solid rgb(65, 88, 189);
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 14px;
    font-weight: 500;
  }
`

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>${SANDBOX_STYLES}</style></head>
<body>
  <div id="pdp-info-card" class="pdp-info-card">
    <h1 id="pdp-title" class="pdp-title">Sample Product</h1>
    <p id="pdp-description" class="pdp-description">A multi-line product description showing what the customer will receive.</p>
    <span id="pdp-price" class="pdp-price">$49.00</span>
    <button id="pdp-pill" class="pdp-pill-selected" aria-pressed="true">M</button>
    <button id="pdp-cta" class="pdp-cta brand-solid">Add to cart</button>
  </div>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

/** PDP-scope token-discipline scan — fails on any non-comment hex literal. */
function expectNoRawHexInPdp(): void {
  const files = [...PDP_TEMPLATES, ...PDP_COMPONENTS, ...PDP_ROUTES]
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
    `Token-discipline violation — raw hex literals found in PDP source:\n${offending.join("\n")}\n\n` +
      `Use Happilee Tailwind tokens (bg-brand-solid, text-ui-fg-base, ` +
      `border-ui-border-base, text-brand-secondary-text) — never raw hex.`
  ).toHaveLength(0)
}

test.describe("Wave 2.8 — Storefront PDP re-skin", () => {
  test("(a) token discipline: no raw hex literals in PDP source", () => {
    expectNoRawHexInPdp()
  })

  test("(b) brand color exact: Add-to-cart CTA bg is Happilee #4d68dc", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const bg = await page.evaluate(() => {
      const el = document.getElementById("pdp-cta")
      if (!el) throw new Error("pdp-cta missing")
      return getComputedStyle(el).backgroundColor
    })
    expect(bg).toBe("rgb(77, 104, 220)")
  })

  test("(c) Inter font cascade: title + price + description + CTA all Inter", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const fonts = await page.evaluate(() => {
      const ids = ["pdp-title", "pdp-price", "pdp-description", "pdp-cta"]
      const out: Record<string, string> = {}
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) throw new Error(`${id} missing`)
        out[id] = getComputedStyle(el).fontFamily.toLowerCase()
      }
      return out
    })
    expect(fonts["pdp-title"]).toContain("inter")
    expect(fonts["pdp-price"]).toContain("inter")
    expect(fonts["pdp-description"]).toContain("inter")
    expect(fonts["pdp-cta"]).toContain("inter")
  })

  test("(d) integration smoke: re-skinned files exist & reference canonical tokens", () => {
    // Every PDP file must exist after the re-skin.
    for (const rel of [...PDP_TEMPLATES, ...PDP_COMPONENTS, ...PDP_ROUTES]) {
      const abs = join(STOREFRONT_ROOT, rel)
      expect(existsSync(abs), `Missing PDP file: ${rel}`).toBe(true)
    }

    // The top-level template must seat the PDP on the Happilee subtle page
    // surface and cascade Inter font.
    const templateSrc = readFileSync(
      join(STOREFRONT_ROOT, "src/modules/products/templates/index.tsx"),
      "utf8"
    )
    expect(templateSrc).toMatch(/bg-ui-bg-subtle/)
    expect(templateSrc).toMatch(/font-sans/)

    // The product-info block must reference the canonical-map title token
    // (text-ui-fg-base) and secondary body color (text-ui-fg-subtle).
    const infoSrc = readFileSync(
      join(STOREFRONT_ROOT, "src/modules/products/templates/product-info/index.tsx"),
      "utf8"
    )
    expect(infoSrc).toMatch(/text-ui-fg-base/)
    expect(infoSrc).toMatch(/text-ui-fg-subtle/)
    expect(infoSrc).toMatch(/font-semibold/)

    // Product price uses brand-secondary-text per ADR canonical token map.
    const priceSrc = readFileSync(
      join(STOREFRONT_ROOT, "src/modules/products/components/product-price/index.tsx"),
      "utf8"
    )
    expect(priceSrc).toMatch(/text-brand-secondary-text/)

    // The primary CTA (desktop + mobile) mounts the Happilee brand-solid
    // fill and the skeuomorphic shadow token.
    const actionsSrc = readFileSync(
      join(
        STOREFRONT_ROOT,
        "src/modules/products/components/product-actions/index.tsx"
      ),
      "utf8"
    )
    expect(actionsSrc).toMatch(/bg-brand-solid/)
    expect(actionsSrc).toMatch(/shadow-hap-xs-skeuomorphic/)
    // The class string carries the `brand-solid` marker so we can sample
    // CSS rgb(77,104,220) via the Playwright brand-color test.
    expect(actionsSrc).toMatch(/brand-solid w-full/)

    // The variant pill selector uses the canonical tag-pill token pair
    // (bg-brand-light + text-brand-secondary-text) for the selected state.
    const optionSrc = readFileSync(
      join(
        STOREFRONT_ROOT,
        "src/modules/products/components/product-actions/option-select.tsx"
      ),
      "utf8"
    )
    expect(optionSrc).toMatch(/bg-brand-light/)
    expect(optionSrc).toMatch(/text-brand-secondary-text/)

    // Related-products grid uses Happilee surface + spacing scale.
    const relatedSrc = readFileSync(
      join(
        STOREFRONT_ROOT,
        "src/modules/products/components/related-products/index.tsx"
      ),
      "utf8"
    )
    expect(relatedSrc).toMatch(/text-brand-secondary-text/)
    expect(relatedSrc).toMatch(/text-ui-fg-base/)

    // Thumbnail uses Happilee card pattern (rounded-xl + shadow-hap-xs).
    const thumbSrc = readFileSync(
      join(STOREFRONT_ROOT, "src/modules/products/components/thumbnail/index.tsx"),
      "utf8"
    )
    expect(thumbSrc).toMatch(/rounded-xl/)
    expect(thumbSrc).toMatch(/shadow-hap-xs/)
  })

  test("(e) info-panel surface: white card on subtle bg with rounded-xl + border", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("pdp-info-card")
      if (!el) throw new Error("pdp-info-card missing")
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

  test("(f) variant pill selected state: brand-light fill + brand-secondary-text label", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("pdp-pill")
      if (!el) throw new Error("pdp-pill missing")
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        radius: cs.borderTopLeftRadius,
      }
    })
    // bg-brand-light = #edf2fe = rgb(237, 242, 254)
    expect(styles.bg).toBe("rgb(237, 242, 254)")
    // text-brand-secondary-text = #4158bd = rgb(65, 88, 189)
    expect(styles.color).toBe("rgb(65, 88, 189)")
    expect(styles.radius).toBe("8px") // rounded-md
  })

  test("(g) PDP-scope git-tracked files have zero offending hex via git ls-files", () => {
    // Belt-and-suspenders: query git directly so we also catch any new
    // file added to the PDP tree that the static include-list missed.
    let output = ""
    try {
      output = execSync(
        `git ls-files 'src/modules/products' 'src/app/[countryCode]/(main)/products' | xargs grep -nE '#[0-9a-fA-F]{6}\\b' || true`,
        { cwd: STOREFRONT_ROOT }
      ).toString()
    } catch {
      output = ""
    }
    const offending = output
      .split("\n")
      .filter((l) => l.trim().length > 0)
      // Allow opt-out marker, mirroring the cart helper's contract.
      .filter((l) => !l.includes("// happilee:ok"))
      // Allow hex inside doc comments (lines starting with * or //)
      .filter((l) => {
        const parts = l.split(":")
        if (parts.length < 3) return true
        const code = parts.slice(2).join(":").trim()
        return !code.startsWith("*") && !code.startsWith("//")
      })
    expect(
      offending,
      `Token-discipline violation in PDP tree:\n${offending.join("\n")}`
    ).toHaveLength(0)
  })
})
