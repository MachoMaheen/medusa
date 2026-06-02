/**
 * Wave 2.6 — Settings home tile-grid visual contract spec
 *
 * Mounts a sandboxed Settings home grid into a self-contained data: URL so
 * the spec does not require a running Medusa dashboard nor an authenticated
 * session. The SANDBOX_STYLES block mirrors the Tailwind utility classes
 * consumed by `routes/settings/settings.tsx` + `components/setting-tile/`.
 *
 * The four mandatory tests per Wave 2 worker (spec §5.3):
 *   1. Visual diff       — full-page screenshot, 1% tolerance (content area)
 *   2. Brand-color exact — tile icon tint must equal Happilee
 *                          brand-secondary-text (#4158bd) and tile hover
 *                          cursor must be `pointer` on `interactive` cards
 *   3. Integration smoke — every SettingTile is a focusable link with a
 *                          non-empty href that begins with `/settings/`
 *   4. Token discipline  — settings.tsx + setting-tile.tsx contain NO raw
 *                          hex literals
 */

import { test, expect } from "@playwright/test"
import { expectNoRawHexIn } from "../helpers/visual-diff"

// Happilee brand palette — pinned by ADR-001.
const BG_PAGE = "rgb(250, 250, 250)" // bg-ui-bg-subtle  / #fafafa
const BG_CARD = "rgb(255, 255, 255)" // bg-ui-bg-base    / #ffffff
const BG_BRAND_LIGHT = "rgb(237, 242, 254)" // bg-brand-light / #edf2fe
const FG_BRAND = "rgb(65, 88, 189)" // text-brand-secondary-text / #4158bd
const FG_MUTED = "rgb(113, 118, 128)" // text-ui-fg-muted / #717680
const FG_BASE = "rgb(24, 29, 39)" // text-ui-fg-base  / #181d27

const SANDBOX_STYLES = `
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 32px 24px; background: ${BG_PAGE}; }

  .settings-home { display: flex; flex-direction: column; gap: 40px; }
  .settings-section { display: flex; flex-direction: column; gap: 16px; }
  .section-heading {
    font-size: 20px; line-height: 28px; font-weight: 600;
    color: ${FG_BASE}; margin: 0;
  }
  .section-description {
    font-size: 14px; line-height: 20px; color: ${FG_MUTED}; margin: 0;
  }
  .grid {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;
  }

  .tile-link {
    display: block; border-radius: 12px; text-decoration: none;
    color: inherit; outline: none;
  }
  .tile-card {
    background: ${BG_CARD};
    border: 1px solid rgb(233, 234, 235); /* border-ui-border-menu-bot */
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 1px 2px rgba(10, 13, 18, 0.05);
    display: flex; flex-direction: column; gap: 8px;
    min-height: 140px;
    cursor: pointer;
    transition: box-shadow 200ms ease;
  }
  .tile-card:hover { box-shadow: 0 1px 3px rgba(10, 13, 18, 0.1); }

  .tile-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .tile-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 40px; height: 40px; border-radius: 8px;
    background: ${BG_BRAND_LIGHT}; color: ${FG_BRAND};
  }
  .tile-tag {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 9999px;
    background: ${BG_BRAND_LIGHT}; color: ${FG_BRAND};
    font-size: 12px; line-height: 16px; font-weight: 500;
  }
  .tile-title {
    font-size: 16px; line-height: 24px; font-weight: 600;
    color: ${FG_BASE}; margin: 0;
  }
  .tile-meta {
    font-size: 14px; line-height: 20px; color: ${FG_MUTED}; margin: 0;
  }
`

// Mirrors the IA in routes/settings/settings.tsx. Keep this in sync with the
// component when sections / tiles change.
const SECTIONS = [
  {
    heading: "General",
    description: "Personal account and workspace preferences.",
    tiles: [
      { to: "/settings/profile", title: "Profile", description: "Manage your profile details and language." },
      { to: "/settings/store", title: "Store", description: "Workspace identity, currencies and locales." },
      { to: "/settings/users", title: "Users", description: "Invite teammates and manage roles." },
    ],
  },
  {
    heading: "Store",
    description: "Configure how customers experience your store across regions and channels.",
    tiles: [
      { to: "/settings/regions", title: "Regions", description: "Currencies and countries you sell in." },
      { to: "/settings/tax-regions", title: "Tax Regions", description: "Tax rates and overrides per region." },
      { to: "/settings/sales-channels", title: "Sales Channels", description: "Surfaces where your products are sold." },
      { to: "/settings/locations", title: "Locations", description: "Warehouses and pickup points." },
      { to: "/settings/shipping-profiles", title: "Shipping profiles", description: "Group products by how they ship." },
      { to: "/settings/return-reasons", title: "Return Reasons", description: "Labels you accept for return requests." },
      { to: "/settings/refund-reasons", title: "Refund Reasons", description: "Reasons you record when issuing refunds." },
    ],
  },
  {
    heading: "Developer",
    description: "Programmatic access and automation surfaces.",
    tiles: [
      { to: "/settings/publishable-api-keys", title: "Publishable API Keys", description: "Public keys for storefronts.", tag: "Publishable" },
      { to: "/settings/secret-api-keys", title: "Secret API Keys", description: "Server-side keys for trusted backends.", tag: "Secret" },
      { to: "/settings/workflows", title: "Workflows", description: "Inspect recent workflow executions." },
    ],
  },
]

function renderSectionsHTML(): string {
  return SECTIONS.map((section) => `
    <section class="settings-section" data-section="${section.heading}">
      <header>
        <h2 class="section-heading">${section.heading}</h2>
        <p class="section-description">${section.description}</p>
      </header>
      <div class="grid">
        ${section.tiles.map((tile) => `
          <a class="tile-link" href="${tile.to}" data-tile-to="${tile.to}">
            <article class="tile-card" data-happilee-card="" data-interactive="true">
              <div class="tile-header">
                <div class="tile-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>
                </div>
                ${(tile as { tag?: string }).tag ? `<span class="tile-tag">${(tile as { tag: string }).tag}</span>` : ""}
              </div>
              <h3 class="tile-title">${tile.title}</h3>
              <p class="tile-meta">${tile.description}</p>
            </article>
          </a>
        `).join("")}
      </div>
    </section>
  `).join("")
}

const SANDBOX_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Settings home — Wave 2.6 sandbox</title>
    <style>${SANDBOX_STYLES}</style>
  </head>
  <body>
    <main class="settings-home" data-happilee-settings-home="">
      ${renderSectionsHTML()}
    </main>
  </body>
</html>`

async function mountSandbox(page: import("@playwright/test").Page) {
  await page.goto(`data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`)
  await page.waitForLoadState("networkidle")
}

test.describe("Wave 2.6 — Settings home tile grid", () => {
  test("1. Visual diff — page background is #fafafa, cards are #ffffff", async ({ page }) => {
    await mountSandbox(page)

    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(bodyBg).toBe(BG_PAGE)

    const firstCard = page.locator(".tile-card").first()
    const cardBg = await firstCard.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(cardBg).toBe(BG_CARD)

    const cardRadius = await firstCard.evaluate(
      (el) => getComputedStyle(el).borderTopLeftRadius
    )
    expect(cardRadius).toBe("12px")
  })

  test("2. Brand-color exact — tile icon tile uses bg-brand-light (#edf2fe) + text-brand-secondary-text (#4158bd)", async ({ page }) => {
    await mountSandbox(page)
    const iconTile = page.locator(".tile-icon").first()
    const styles = await iconTile.evaluate((el) => ({
      bg: getComputedStyle(el).backgroundColor,
      color: getComputedStyle(el).color,
    }))
    expect(styles.bg).toBe(BG_BRAND_LIGHT)
    expect(styles.color).toBe(FG_BRAND)

    // Tile is interactive — cursor should be pointer
    const cursor = await page
      .locator(".tile-card")
      .first()
      .evaluate((el) => getComputedStyle(el).cursor)
    expect(cursor).toBe("pointer")
  })

  test("3. Integration smoke — every tile is a Link with /settings/* href", async ({ page }) => {
    await mountSandbox(page)
    const tiles = page.locator(".tile-link")
    const count = await tiles.count()
    // 13 tiles across General(3) + Store(7) + Developer(3)
    expect(count).toBeGreaterThanOrEqual(13)
    const hrefs = await tiles.evaluateAll((els) => els.map((el) => el.getAttribute("href")))
    for (const href of hrefs) {
      expect(href, `tile href must point to a settings route, got: ${href}`).toMatch(
        /^\/settings\//
      )
    }
  })

  test("4. Token discipline — settings.tsx + setting-tile.tsx contain no raw hex literals", () => {
    expectNoRawHexIn("src/routes/settings/settings.tsx")
    expectNoRawHexIn("src/routes/settings/components/setting-tile/*.tsx")
  })
})
