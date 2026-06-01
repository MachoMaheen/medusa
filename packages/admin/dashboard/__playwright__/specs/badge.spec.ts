/**
 * Wave 1.8 — HappileeBadge primitive spec.
 *
 * Verifies the four badge variants render with the EXACT Happilee v3 status /
 * brand pill colors. Because the badge is a tiny presentational primitive, we
 * don't depend on an admin route to render it — we inject a self-contained HTML
 * fixture that imports Tailwind via the same utility classes the real
 * component uses and asserts computed RGB values against the skill spec
 * (references/components.md → "Status badge" + "All contacts / category pill").
 *
 * Token discipline: the implementation file itself is scanned for raw `#xxxxxx`
 * literals — workers must use the `hap-status-*` and `brand-*` Tailwind classes
 * declared in tailwind.config.cjs, never raw hex.
 */

import { test, expect } from "@playwright/test"
import { expectNoRawHexIn } from "../helpers/visual-diff"

/**
 * Skill spec (references/components.md):
 *   active  bg #f0fdf4 / text #15803d / border #bbf7d0
 *   draft   bg #f8fafc / text #334155 / border #e2e8f0
 *   paused  bg #fffbeb / text #b45309 / border #fde68a
 *   brand   bg #edf2fe / text #4158bd / no border
 */
const EXPECTED = {
  active: {
    bg: "rgb(240, 253, 244)",
    text: "rgb(21, 128, 61)",
    border: "rgb(187, 247, 208)",
  },
  draft: {
    bg: "rgb(248, 250, 252)",
    text: "rgb(51, 65, 85)",
    border: "rgb(226, 232, 240)",
  },
  paused: {
    bg: "rgb(255, 251, 235)",
    text: "rgb(180, 83, 9)",
    border: "rgb(253, 230, 138)",
  },
  brand: {
    bg: "rgb(237, 242, 254)",
    text: "rgb(65, 88, 189)",
  },
} as const

/**
 * The Tailwind classes that HappileeBadge applies for each variant. Must be
 * kept in sync with happilee-badge.tsx.
 */
const VARIANT_CLASSES: Record<keyof typeof EXPECTED, string> = {
  active:
    "bg-hap-status-active-bg text-hap-status-active-text border border-hap-status-active-border",
  draft:
    "bg-hap-status-draft-bg text-hap-status-draft-text border border-hap-status-draft-border",
  paused:
    "bg-hap-status-paused-bg text-hap-status-paused-text border border-hap-status-paused-border",
  brand: "bg-brand-light text-brand-secondary-text",
}

const BASE_CLASSES =
  "inline-flex items-center justify-center h-6 px-2 py-0.5 rounded-full text-xs font-medium leading-none whitespace-nowrap"

/**
 * Renders a deterministic page that uses the live dashboard's Tailwind CSS so
 * `bg-hap-status-active-bg` etc. resolve to the same RGB values the production
 * component will get.
 *
 * We navigate to "/" first to load the dashboard bundle (which pulls in the
 * full Tailwind CSS) and then mount badges via DOM injection inside the same
 * document so they inherit the resolved utility classes.
 */
async function mountBadges(page: import("@playwright/test").Page) {
  await page.goto("/")
  await page.evaluate(
    ({ variants, base }) => {
      const container = document.createElement("div")
      container.id = "happilee-badge-fixture"
      container.style.position = "fixed"
      container.style.top = "0"
      container.style.left = "0"
      container.style.zIndex = "999999"
      container.style.background = "#ffffff"
      container.style.padding = "24px"
      container.style.display = "flex"
      container.style.gap = "12px"

      for (const [variant, classes] of Object.entries(variants)) {
        const span = document.createElement("span")
        span.setAttribute("data-happilee-badge", "")
        span.setAttribute("data-variant", variant)
        span.className = `${base} ${classes}`
        span.textContent = variant
        container.appendChild(span)
      }

      document.body.appendChild(container)
    },
    { variants: VARIANT_CLASSES, base: BASE_CLASSES }
  )
}

test.describe("Wave 1.8 — HappileeBadge primitive", () => {
  test("active variant renders exact bg / text / border RGBs", async ({ page }) => {
    await mountBadges(page)
    const el = page.locator("[data-happilee-badge][data-variant='active']")
    const styles = await el.evaluate((node) => {
      const cs = getComputedStyle(node)
      return {
        bg: cs.backgroundColor,
        text: cs.color,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
        height: cs.height,
        borderRadius: cs.borderRadius,
      }
    })
    expect(styles.bg).toBe(EXPECTED.active.bg)
    expect(styles.text).toBe(EXPECTED.active.text)
    expect(styles.borderColor).toBe(EXPECTED.active.border)
    expect(styles.borderWidth).toBe("1px")
    expect(styles.height).toBe("24px")
    // rounded-full -> very large radius, browsers report a large pixel value
    expect(parseFloat(styles.borderRadius)).toBeGreaterThanOrEqual(9999)
  })

  test("draft variant renders exact bg / text / border RGBs", async ({ page }) => {
    await mountBadges(page)
    const el = page.locator("[data-happilee-badge][data-variant='draft']")
    const styles = await el.evaluate((node) => {
      const cs = getComputedStyle(node)
      return {
        bg: cs.backgroundColor,
        text: cs.color,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
      }
    })
    expect(styles.bg).toBe(EXPECTED.draft.bg)
    expect(styles.text).toBe(EXPECTED.draft.text)
    expect(styles.borderColor).toBe(EXPECTED.draft.border)
    expect(styles.borderWidth).toBe("1px")
  })

  test("paused variant renders exact bg / text / border RGBs", async ({ page }) => {
    await mountBadges(page)
    const el = page.locator("[data-happilee-badge][data-variant='paused']")
    const styles = await el.evaluate((node) => {
      const cs = getComputedStyle(node)
      return {
        bg: cs.backgroundColor,
        text: cs.color,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
      }
    })
    expect(styles.bg).toBe(EXPECTED.paused.bg)
    expect(styles.text).toBe(EXPECTED.paused.text)
    expect(styles.borderColor).toBe(EXPECTED.paused.border)
    expect(styles.borderWidth).toBe("1px")
  })

  test("brand variant renders exact bg / text RGBs with NO border", async ({ page }) => {
    await mountBadges(page)
    const el = page.locator("[data-happilee-badge][data-variant='brand']")
    const styles = await el.evaluate((node) => {
      const cs = getComputedStyle(node)
      return {
        bg: cs.backgroundColor,
        text: cs.color,
        borderWidth: cs.borderTopWidth,
      }
    })
    expect(styles.bg).toBe(EXPECTED.brand.bg)
    expect(styles.text).toBe(EXPECTED.brand.text)
    // "no border" — Tailwind's reset leaves border-width at 0 when not specified
    expect(styles.borderWidth).toBe("0px")
  })

  test("shared specs: h-6, px-2 py-0.5, text-xs font-medium", async ({ page }) => {
    await mountBadges(page)
    for (const variant of ["active", "draft", "paused", "brand"] as const) {
      const el = page.locator(`[data-happilee-badge][data-variant='${variant}']`)
      const styles = await el.evaluate((node) => {
        const cs = getComputedStyle(node)
        return {
          height: cs.height,
          paddingTop: cs.paddingTop,
          paddingBottom: cs.paddingBottom,
          paddingLeft: cs.paddingLeft,
          paddingRight: cs.paddingRight,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
        }
      })
      expect(styles.height, `${variant} height`).toBe("24px")
      expect(styles.paddingTop, `${variant} padding-top`).toBe("2px")
      expect(styles.paddingBottom, `${variant} padding-bottom`).toBe("2px")
      expect(styles.paddingLeft, `${variant} padding-left`).toBe("8px")
      expect(styles.paddingRight, `${variant} padding-right`).toBe("8px")
      expect(styles.fontSize, `${variant} font-size`).toBe("12px")
      expect(styles.fontWeight, `${variant} font-weight`).toBe("500")
    }
  })

  test("source file uses tokens only — no raw hex literals", () => {
    expectNoRawHexIn("src/components/common/happilee-badge/*.tsx")
  })
})
