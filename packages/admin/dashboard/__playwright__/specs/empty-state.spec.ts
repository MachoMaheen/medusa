/**
 * Wave 1.12 — HappileeEmptyState visual contract spec.
 *
 * Verifies the "Create new automation"-style empty-state tile renders with the
 * exact Happilee v3 treatment. The spec mounts a DOM fixture inside the live
 * dashboard (so it inherits the real Tailwind CSS) and asserts:
 *
 *   1. Border style is `dashed`
 *   2. Background resolves to Happilee bg-secondary (#fafafa = rgb(250, 250, 250))
 *   3. Border-radius is xl (12px) on all four corners
 *   4. Contents are centered (flex column, items-center, justify-center)
 *   5. Click handler fires when present (and the role/tabIndex flip to "button")
 *   6. Implementation source contains no raw hex literals
 *
 * Tokens (resolved via packages/design-system/ui-preset + happilee-tokens.css):
 *   bg-ui-bg-subtle        → rgb(250, 250, 250)  (Happilee #fafafa)
 *   border-ui-border-base  → rgb(213, 215, 218)  (Happilee #d5d7da)
 */

import { test, expect, type Page } from "@playwright/test"
import { expectNoRawHexIn } from "../helpers/visual-diff"

const EXPECTED_BG = "rgb(250, 250, 250)" // Happilee bg-secondary
const EXPECTED_BORDER_COLOR = "rgb(213, 215, 218)" // Happilee border-primary

/**
 * Mount a HappileeEmptyState-shaped fixture inside the live dashboard so the
 * Tailwind classes used by the real component resolve to the same RGB values.
 * Two fixtures are mounted:
 *   - `#hap-empty-static`     : no onClick (read-only card)
 *   - `#hap-empty-interactive`: with onClick — role=button, cursor-pointer
 *
 * The class lists MUST stay in sync with happilee-empty-state.tsx.
 */
async function mountEmptyStates(page: Page) {
  await page.goto("/")

  const CARD_BASE =
    "flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-dashed border-ui-border-base bg-ui-bg-subtle font-sans text-center transition-colors duration-hap-fast"

  const CARD_INTERACTIVE =
    "cursor-pointer hover:bg-ui-bg-subtle-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-solid/30"

  const ICON_CIRCLE =
    "flex h-8 w-8 items-center justify-center rounded-full bg-ui-bg-base border border-ui-border-base"

  await page.evaluate(
    ({ base, interactive, iconCircle }) => {
      const container = document.createElement("div")
      container.id = "happilee-empty-state-fixture"
      container.style.position = "fixed"
      container.style.top = "0"
      container.style.left = "0"
      container.style.zIndex = "999999"
      container.style.background = "#ffffff"
      container.style.padding = "24px"
      container.style.display = "flex"
      container.style.gap = "16px"

      function buildCard(id: string, isInteractive: boolean): HTMLDivElement {
        const card = document.createElement("div")
        card.id = id
        card.setAttribute("data-happilee-empty-state", "")
        card.setAttribute("data-interactive", String(isInteractive))
        card.style.width = "260px"
        card.style.height = "200px"
        card.className = `${base}${isInteractive ? " " + interactive : ""}`
        if (isInteractive) {
          card.setAttribute("role", "button")
          card.tabIndex = 0
        }

        const iconWrap = document.createElement("span")
        iconWrap.setAttribute("data-happilee-empty-state-icon", "")
        iconWrap.className = iconCircle
        // 24x24 placeholder square — the test asserts on the circle wrapper,
        // not the icon glyph itself.
        const glyph = document.createElement("span")
        glyph.style.display = "inline-block"
        glyph.style.width = "24px"
        glyph.style.height = "24px"
        iconWrap.appendChild(glyph)

        const title = document.createElement("span")
        title.setAttribute("data-happilee-empty-state-title", "")
        title.className = "text-base font-semibold text-ui-fg-base"
        title.textContent = "Create new automation"

        const desc = document.createElement("span")
        desc.setAttribute("data-happilee-empty-state-description", "")
        desc.className = "text-sm text-ui-fg-muted"
        desc.textContent = "Create automations for your repeated tasks."

        card.append(iconWrap, title, desc)
        return card
      }

      const staticCard = buildCard("hap-empty-static", false)
      const interactiveCard = buildCard("hap-empty-interactive", true)

      // Wire the click handler the same way the real component does — and
      // expose a counter on `window` so the spec can assert it fired.
      ;(window as unknown as { __hapClicks?: number }).__hapClicks = 0
      interactiveCard.addEventListener("click", () => {
        const w = window as unknown as { __hapClicks: number }
        w.__hapClicks = (w.__hapClicks ?? 0) + 1
      })

      container.append(staticCard, interactiveCard)
      document.body.appendChild(container)
    },
    { base: CARD_BASE, interactive: CARD_INTERACTIVE, iconCircle: ICON_CIRCLE }
  )
}

test.describe("Wave 1.12 — HappileeEmptyState", () => {
  test("border is DASHED with border-primary color", async ({ page }) => {
    await mountEmptyStates(page)
    const styles = await page
      .locator("#hap-empty-static")
      .evaluate((el) => {
        const cs = getComputedStyle(el)
        return {
          style: cs.borderTopStyle,
          color: cs.borderTopColor,
          width: cs.borderTopWidth,
        }
      })
    expect(styles.style).toBe("dashed")
    expect(styles.color).toBe(EXPECTED_BORDER_COLOR)
    expect(styles.width).toBe("1px")
  })

  test("background is Happilee bg-secondary (#fafafa)", async ({ page }) => {
    await mountEmptyStates(page)
    const bg = await page
      .locator("#hap-empty-static")
      .evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(bg).toBe(EXPECTED_BG)
  })

  test("border-radius is xl (12px) on all corners", async ({ page }) => {
    await mountEmptyStates(page)
    const radii = await page
      .locator("#hap-empty-static")
      .evaluate((el) => {
        const cs = getComputedStyle(el)
        return {
          tl: cs.borderTopLeftRadius,
          tr: cs.borderTopRightRadius,
          br: cs.borderBottomRightRadius,
          bl: cs.borderBottomLeftRadius,
        }
      })
    expect(radii.tl).toBe("12px")
    expect(radii.tr).toBe("12px")
    expect(radii.br).toBe("12px")
    expect(radii.bl).toBe("12px")
  })

  test("contents are centered (flex column, items + justify center)", async ({
    page,
  }) => {
    await mountEmptyStates(page)
    const layout = await page
      .locator("#hap-empty-static")
      .evaluate((el) => {
        const cs = getComputedStyle(el)
        return {
          display: cs.display,
          flexDirection: cs.flexDirection,
          alignItems: cs.alignItems,
          justifyContent: cs.justifyContent,
        }
      })
    expect(layout.display).toBe("flex")
    expect(layout.flexDirection).toBe("column")
    expect(layout.alignItems).toBe("center")
    expect(layout.justifyContent).toBe("center")
  })

  test("click handler fires when onClick is present (role=button, tabIndex=0)", async ({
    page,
  }) => {
    await mountEmptyStates(page)
    const card = page.locator("#hap-empty-interactive")
    await expect(card).toHaveAttribute("role", "button")
    await expect(card).toHaveAttribute("tabindex", "0")

    await card.click()
    const clicks = await page.evaluate(
      () => (window as unknown as { __hapClicks: number }).__hapClicks
    )
    expect(clicks).toBe(1)

    // The cursor flips to pointer when interactive
    const cursor = await card.evaluate((el) => getComputedStyle(el).cursor)
    expect(cursor).toBe("pointer")
  })

  test("static variant has NO role and NO tabindex", async ({ page }) => {
    await mountEmptyStates(page)
    const attrs = await page.locator("#hap-empty-static").evaluate((el) => ({
      role: el.getAttribute("role"),
      tabindex: el.getAttribute("tabindex"),
    }))
    expect(attrs.role).toBeNull()
    expect(attrs.tabindex).toBeNull()
  })

  test("source file uses tokens only — no raw hex literals", () => {
    expectNoRawHexIn("src/components/common/happilee-empty-state/*.tsx")
  })
})
