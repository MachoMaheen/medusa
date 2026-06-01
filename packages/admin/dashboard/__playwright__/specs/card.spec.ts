/**
 * Wave 1.11 — HappileeCard visual contract spec.
 *
 * Asserts that the Happilee "automation card" pattern renders with the EXACT
 * tokens from references/components.md (Card section):
 *
 *   bg            #ffffff (Happilee bg-primary)        → rgb(255, 255, 255)
 *   border-color  #e9eaeb (Happilee border-secondary)  → rgb(233, 234, 235)
 *                  — `#d5d7da` (border-primary) is also accepted because the
 *                    skill explicitly lists both border tokens as valid card
 *                    borders depending on context.
 *   border-radius xl (12px)                            → 12px
 *   padding       lg (12px) all                        → 12px
 *   gap           md (8px) between vertical sections   → 8px
 *   min-height    ~140px                               → 140px
 *   shadow        xs at rest, sm on hover (interactive)
 *   font          Inter, ui-sans-serif, system-ui, sans-serif
 *
 * Token discipline (5th check): the implementation file is grep'd for raw
 * `#rrggbb` literals. Every color MUST trace back to a Tailwind class declared
 * in tailwind.config.cjs or @medusajs/ui-preset.
 *
 * The fixture is mounted INSIDE the live dashboard so the same Tailwind CSS
 * that ships to production resolves the utility classes — this catches drift
 * between tailwind.config.cjs and the spec's expectations.
 */

import { test, expect, type Page } from "@playwright/test"
import { expectNoRawHexIn } from "../helpers/visual-diff"

const EXPECTED_BG = "rgb(255, 255, 255)" // Happilee bg-primary
const EXPECTED_BORDER_SECONDARY = "rgb(233, 234, 235)" // Happilee border-secondary
const EXPECTED_BORDER_PRIMARY = "rgb(213, 215, 218)" // Happilee border-primary

/**
 * Class lists below MUST stay in sync with happilee-card.tsx. We don't import
 * the React component (the spec is intentionally framework-free for speed),
 * instead we replicate the className strings 1:1 and let the live dashboard's
 * Tailwind stylesheet resolve them.
 */
const FRAME_BASE =
  "bg-ui-bg-base border border-ui-border-menu-bot rounded-xl p-3 shadow-hap-xs " +
  "flex flex-col gap-2 min-h-[140px] font-sans " +
  "transition-[box-shadow] duration-hap-normal"

const FRAME_INTERACTIVE =
  "cursor-pointer hover:shadow-hap-sm " +
  "focus-visible:outline-none focus-visible:shadow-hap-sm " +
  "focus-visible:ring-2 focus-visible:ring-brand-solid/30"

/**
 * Mount two card fixtures inside the live dashboard:
 *   - `#hap-card-static`      : non-interactive card (no hover lift)
 *   - `#hap-card-interactive` : interactive card (cursor-pointer + shadow lift)
 */
async function mountCards(page: Page) {
  await page.goto("/")
  await page.evaluate(
    ({ base, interactive }) => {
      const container = document.createElement("div")
      container.id = "happilee-card-fixture"
      container.style.position = "fixed"
      container.style.top = "0"
      container.style.left = "0"
      container.style.zIndex = "999999"
      container.style.padding = "24px"
      container.style.display = "flex"
      container.style.gap = "16px"
      // Page background matches the real shell so hover shadows land on the
      // correct surface contrast.
      container.style.background = "#fafafa"

      function buildCard(id: string, isInteractive: boolean): HTMLDivElement {
        const card = document.createElement("div")
        card.id = id
        card.setAttribute("data-happilee-card", "")
        card.setAttribute("data-interactive", String(isInteractive))
        card.style.width = "320px"
        card.className = `${base}${isInteractive ? " " + interactive : ""}`
        if (isInteractive) {
          card.setAttribute("role", "button")
          card.tabIndex = 0
        }

        // Header row (badge + actions slots)
        const header = document.createElement("div")
        header.setAttribute("data-happilee-card-header", "")
        header.className = "flex items-center justify-between gap-2"
        header.textContent = "Active   ⋯"

        // Title
        const title = document.createElement("h3")
        title.setAttribute("data-happilee-card-title", "")
        title.className =
          "text-base font-semibold leading-6 text-ui-fg-base truncate"
        title.textContent = "Welcome new contacts"

        // Meta stat line
        const meta = document.createElement("p")
        meta.setAttribute("data-happilee-card-meta", "")
        meta.className = "text-sm leading-5 text-ui-fg-muted"
        meta.textContent = "Runs: 15"

        // Footer (meta left, tag right)
        const footer = document.createElement("div")
        footer.setAttribute("data-happilee-card-footer", "")
        footer.className =
          "mt-auto flex items-center justify-between gap-2 text-xs leading-4 text-ui-fg-muted"
        footer.textContent = "Last edited: 01/06/2026"

        card.append(header, title, meta, footer)
        return card
      }

      container.appendChild(buildCard("hap-card-static", false))
      container.appendChild(buildCard("hap-card-interactive", true))
      document.body.appendChild(container)
    },
    { base: FRAME_BASE, interactive: FRAME_INTERACTIVE }
  )
}

test.describe("Wave 1.11 — HappileeCard primitive", () => {
  test("card has bg #ffffff, border #e9eaeb (or #d5d7da), and border-radius 12px", async ({
    page,
  }) => {
    await mountCards(page)
    const card = page.locator("#hap-card-static")
    const styles = await card.evaluate((node) => {
      const cs = getComputedStyle(node)
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
        radiusTL: cs.borderTopLeftRadius,
        radiusTR: cs.borderTopRightRadius,
        radiusBL: cs.borderBottomLeftRadius,
        radiusBR: cs.borderBottomRightRadius,
      }
    })
    expect(styles.bg).toBe(EXPECTED_BG)
    expect([EXPECTED_BORDER_SECONDARY, EXPECTED_BORDER_PRIMARY]).toContain(
      styles.borderColor
    )
    expect(styles.borderWidth).toBe("1px")
    expect(styles.radiusTL).toBe("12px")
    expect(styles.radiusTR).toBe("12px")
    expect(styles.radiusBL).toBe("12px")
    expect(styles.radiusBR).toBe("12px")
  })

  test("card padding lg (12px), gap-md (8px), min-height ~140px", async ({
    page,
  }) => {
    await mountCards(page)
    const card = page.locator("#hap-card-static")
    const styles = await card.evaluate((node) => {
      const cs = getComputedStyle(node)
      return {
        paddingTop: cs.paddingTop,
        paddingBottom: cs.paddingBottom,
        paddingLeft: cs.paddingLeft,
        paddingRight: cs.paddingRight,
        gap: cs.rowGap,
        minHeight: cs.minHeight,
      }
    })
    expect(styles.paddingTop).toBe("12px")
    expect(styles.paddingBottom).toBe("12px")
    expect(styles.paddingLeft).toBe("12px")
    expect(styles.paddingRight).toBe("12px")
    expect(styles.gap).toBe("8px")
    expect(styles.minHeight).toBe("140px")
  })

  test("hover state increases the shadow (interactive variant only)", async ({
    page,
  }) => {
    await mountCards(page)
    const card = page.locator("#hap-card-interactive")

    // Move the cursor off the fixture first so the rest-state shadow is
    // observed cleanly.
    await page.mouse.move(0, 0)
    // Force a paint frame before sampling rest-state shadow.
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))))

    const restShadow = await card.evaluate(
      (node) => getComputedStyle(node).boxShadow
    )

    await card.hover()
    // Wait for transition (200ms) to settle.
    await page.waitForTimeout(260)

    const hoverShadow = await card.evaluate(
      (node) => getComputedStyle(node).boxShadow
    )

    // Both shadows are non-empty rgba strings; the hover variant must be a
    // STRICTLY different (and stronger) shadow than the rest variant.
    expect(restShadow).not.toBe("none")
    expect(hoverShadow).not.toBe("none")
    expect(hoverShadow).not.toBe(restShadow)

    // Sanity: the hap-sm token uses 0.1 opacity vs hap-xs at 0.05, so the
    // hover string should contain the higher-opacity alpha somewhere.
    // Browsers serialize rgba(0,0,0,0.1) as "rgba(0, 0, 0, 0.1)". We assert on
    // the inequality above and additionally check the rest shadow includes the
    // xs alpha (0.05) to anchor the test to the actual token values.
    expect(restShadow).toContain("0.05")
  })

  test("card uses Inter font", async ({ page }) => {
    await mountCards(page)
    const card = page.locator("#hap-card-static")
    const fontFamily = await card.evaluate(
      (node) => getComputedStyle(node).fontFamily
    )
    expect(fontFamily.toLowerCase()).toContain("inter")
  })

  test("interactive card has cursor: pointer", async ({ page }) => {
    await mountCards(page)
    const card = page.locator("#hap-card-interactive")
    const cursor = await card.evaluate(
      (node) => getComputedStyle(node).cursor
    )
    expect(cursor).toBe("pointer")
  })

  test("source file uses tokens only — no raw hex literals", () => {
    expectNoRawHexIn("src/components/common/happilee-card/*.tsx")
  })
})
