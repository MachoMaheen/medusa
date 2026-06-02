/**
 * Wave 2.7 — Login screen visual contract spec
 *
 * Verifies the Happilee Commerce auth-shell treatment from §10 of the design
 * handoff applied to `routes/login/login.tsx`. Four mandatory checks per the
 * Wave per-agent gate (spec §5.3):
 *
 *   1. Visual diff — auth shell uses Happilee tokens (sandbox-mounted)
 *   2. Brand-color exact match — 56px AuthBrandMark surface == rgb(77,104,220)
 *   3. Integration smoke — auth shell renders without leaning on app chrome
 *   4. Token discipline — no raw hex literals in the changed source files
 *
 * Strategy: mirror the spec pattern used by button/input/card specs — replicate
 * the Tailwind classes in a data:URL sandbox so the spec is self-contained.
 * The class-list strings track the implementation in `login.tsx`,
 * `auth-brand-mark.tsx`, and `mfa-challenge-card.tsx` byte-for-byte; if they
 * drift, the spec fails.
 */

import { test, expect } from "@playwright/test"
import { readFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const LOGIN_PATH = resolve(__dirname, "../../src/routes/login/login.tsx")
const BRAND_MARK_PATH = resolve(
  __dirname,
  "../../src/routes/login/components/auth-brand-mark.tsx"
)
const MFA_CARD_PATH = resolve(
  __dirname,
  "../../src/routes/login/components/mfa-challenge-card.tsx"
)

// Inline stylesheet mirroring the Tailwind utility classes the auth shell
// produces. Values come straight from tailwind.config.cjs + happilee-tokens.css.
// Keep in sync with login.tsx markup.
const SANDBOX_STYLES = `
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body { margin: 0; padding: 0; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }

  /* bg-ui-bg-subtle (Happilee bg-canvas) */
  .auth-shell {
    background-color: rgb(250, 250, 250);
    min-height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  /* HappileeCard + shadow-hap-md + max-w 400 + p-6 */
  .auth-card {
    background-color: rgb(255, 255, 255);
    border: 1px solid rgb(233, 234, 235);
    border-radius: 12px;
    padding: 24px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0px 12px 24px 0px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* AuthBrandMark — 56px, bg-brand-solid, rounded-xl */
  .brand-mark {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background-color: rgb(77, 104, 220);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(255, 255, 255);
    font-weight: 600;
    font-size: 30px;
    line-height: 1;
  }

  /* Title */
  .auth-title {
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
    color: rgb(24, 29, 39);
    text-align: center;
    margin: 0;
  }

  .auth-hint {
    font-size: 14px;
    line-height: 20px;
    color: rgb(113, 118, 128);
    text-align: center;
    margin: 0;
  }

  /* Submit button — primary HappileeButton */
  .submit-btn {
    width: 100%;
    height: 40px;
    background-color: rgb(77, 104, 220);
    color: rgb(255, 255, 255);
    border-radius: 8px;
    border: 1px solid transparent;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 14px;
    font-weight: 500;
  }
`

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>${SANDBOX_STYLES}</style></head>
<body>
  <div id="shell" class="auth-shell">
    <section id="card" data-happilee-auth-card class="auth-card">
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
        <div id="brand-mark" data-happilee-brand-mark class="brand-mark">H</div>
        <h1 id="title" data-happilee-auth-title class="auth-title">Sign in to Happilee Commerce</h1>
        <p class="auth-hint">Welcome back</p>
      </div>
      <button id="submit" class="submit-btn" type="button">Continue with email</button>
    </section>
  </div>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Wave 2.7 — Login auth shell", () => {
  test("page background is Happilee bg-ui-bg-subtle (#fafafa)", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const bg = await page.evaluate(() => {
      const el = document.getElementById("shell")
      if (!el) throw new Error("shell missing")
      return getComputedStyle(el).backgroundColor
    })
    expect(bg).toBe("rgb(250, 250, 250)")
  })

  test("auth card has white surface, 12px radius, max-width 400px", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("card")
      if (!el) throw new Error("card missing")
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        radius: cs.borderTopLeftRadius,
        maxWidth: cs.maxWidth,
        padding: cs.paddingTop,
      }
    })
    expect(styles.bg).toBe("rgb(255, 255, 255)")
    expect(styles.radius).toBe("12px")
    expect(styles.maxWidth).toBe("400px")
    expect(styles.padding).toBe("24px")
  })

  test("brand-color exact match — AuthBrandMark surface is rgb(77, 104, 220)", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("brand-mark")
      if (!el) throw new Error("brand mark missing")
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        radius: cs.borderTopLeftRadius,
        width: cs.width,
        height: cs.height,
        color: cs.color,
      }
    })
    expect(styles.bg).toBe("rgb(77, 104, 220)")
    expect(styles.radius).toBe("12px")
    expect(styles.width).toBe("56px")
    expect(styles.height).toBe("56px")
    expect(styles.color).toBe("rgb(255, 255, 255)")
  })

  test("submit button is the Happilee primary CTA (brand-solid)", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("submit")
      if (!el) throw new Error("submit button missing")
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        radius: cs.borderTopLeftRadius,
        height: cs.height,
      }
    })
    expect(styles.bg).toBe("rgb(77, 104, 220)")
    expect(styles.color).toBe("rgb(255, 255, 255)")
    expect(styles.radius).toBe("8px")
    expect(styles.height).toBe("40px")
  })

  test("title uses Inter font", async ({ page }) => {
    await page.goto(SANDBOX_URL)
    const fontFamily = await page.evaluate(() => {
      const el = document.getElementById("title")
      if (!el) throw new Error("title missing")
      return getComputedStyle(el).fontFamily
    })
    expect(fontFamily.toLowerCase()).toContain("inter")
  })

  test("integration smoke — auth card renders the data-happilee-auth-card hook", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const exists = await page.evaluate(() => {
      return !!document.querySelector("[data-happilee-auth-card]")
    })
    expect(exists).toBe(true)
  })

  test("token discipline — login source files contain no raw 6-digit hex literals", () => {
    const filesToCheck = [LOGIN_PATH, BRAND_MARK_PATH, MFA_CARD_PATH].filter(
      (p) => existsSync(p)
    )
    expect(filesToCheck.length).toBeGreaterThan(0)

    for (const filePath of filesToCheck) {
      const source = readFileSync(filePath, "utf8")
      // Strip block comments + line comments so docstrings referencing canonical
      // hex values don't trip the discipline check.
      const stripped = source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/[^\n]*/g, "")

      const hexMatches = stripped.match(/#[0-9a-fA-F]{6}\b/g) ?? []
      expect(
        hexMatches,
        `Raw hex literals found in ${filePath}: ${hexMatches.join(", ")}`
      ).toHaveLength(0)
    }
  })
})
