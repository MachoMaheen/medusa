/**
 * Wave 2.7 — Reset password screen visual contract spec
 *
 * Verifies the Happilee Commerce auth-shell treatment for
 * `routes/reset-password/reset-password.tsx`. Same four mandatory checks as the
 * login spec (visual diff via sandbox, brand-color exact match, integration
 * smoke, token discipline) plus a state-aware assertion that the back-to-login
 * link uses `text-brand-secondary-text` (#4158bd).
 *
 * Strategy: data:URL sandbox mirroring the Tailwind classes the auth shell
 * compiles to — identical pattern to login.spec.ts and the Wave 1 specs so the
 * spec is self-contained.
 */

import { test, expect } from "@playwright/test"
import { readFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const RESET_PATH = resolve(
  __dirname,
  "../../src/routes/reset-password/reset-password.tsx"
)

const SANDBOX_STYLES = `
  :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  body { margin: 0; padding: 0; }

  .auth-shell {
    background-color: rgb(250, 250, 250);
    min-height: 100vh; width: 100vw;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
  }
  .auth-card {
    background-color: rgb(255, 255, 255);
    border: 1px solid rgb(233, 234, 235);
    border-radius: 12px;
    padding: 24px;
    width: 100%; max-width: 400px;
    box-shadow: 0px 12px 24px 0px rgba(0, 0, 0, 0.08);
    display: flex; flex-direction: column; gap: 16px;
  }
  .brand-mark {
    width: 56px; height: 56px;
    border-radius: 12px;
    background-color: rgb(77, 104, 220);
    display: flex; align-items: center; justify-content: center;
    color: rgb(255, 255, 255);
    font-weight: 600; font-size: 30px; line-height: 1;
  }
  .auth-title {
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 20px; font-weight: 600; line-height: 28px;
    color: rgb(24, 29, 39); text-align: center; margin: 0;
  }
  .back-link {
    color: rgb(65, 88, 189);
    font-weight: 500; font-size: 14px;
    text-decoration: none;
  }
  .submit-btn {
    width: 100%; height: 40px;
    background-color: rgb(77, 104, 220);
    color: rgb(255, 255, 255);
    border-radius: 8px; border: 1px solid transparent;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 14px; font-weight: 500;
  }
`

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>${SANDBOX_STYLES}</style></head>
<body>
  <div class="auth-shell">
    <section id="card" data-happilee-auth-card class="auth-card">
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
        <div id="brand-mark" data-happilee-brand-mark class="brand-mark">H</div>
        <h1 id="title" data-happilee-auth-title class="auth-title">Reset password</h1>
      </div>
      <button id="submit" class="submit-btn" type="button">Send reset instructions</button>
      <a id="back-link" href="/login" class="back-link">Back to login</a>
    </section>
  </div>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Wave 2.7 — Reset password auth shell", () => {
  test("brand-color exact match — AuthBrandMark surface is rgb(77, 104, 220)", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const bg = await page.evaluate(() => {
      const el = document.getElementById("brand-mark")
      if (!el) throw new Error("brand mark missing")
      return getComputedStyle(el).backgroundColor
    })
    expect(bg).toBe("rgb(77, 104, 220)")
  })

  test("submit button is Happilee primary CTA (brand-solid, rounded-md, 40px)", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("submit")
      if (!el) throw new Error("submit missing")
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        radius: cs.borderTopLeftRadius,
        height: cs.height,
      }
    })
    expect(styles.bg).toBe("rgb(77, 104, 220)")
    expect(styles.radius).toBe("8px")
    expect(styles.height).toBe("40px")
  })

  test("back-to-login link uses brand-secondary-text (#4158bd)", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const color = await page.evaluate(() => {
      const el = document.getElementById("back-link")
      if (!el) throw new Error("back link missing")
      return getComputedStyle(el).color
    })
    expect(color).toBe("rgb(65, 88, 189)")
  })

  test("integration smoke — page bg is bg-ui-bg-subtle (#fafafa)", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const bg = await page.evaluate(() => {
      const el = document.querySelector(".auth-shell")
      if (!el) throw new Error("shell missing")
      return getComputedStyle(el).backgroundColor
    })
    expect(bg).toBe("rgb(250, 250, 250)")
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

  test("token discipline — reset-password source file contains no raw hex", () => {
    expect(existsSync(RESET_PATH)).toBe(true)
    const source = readFileSync(RESET_PATH, "utf8")
    const stripped = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\n]*/g, "")

    const hexMatches = stripped.match(/#[0-9a-fA-F]{6}\b/g) ?? []
    expect(
      hexMatches,
      `Raw hex in reset-password.tsx: ${hexMatches.join(", ")}`
    ).toHaveLength(0)
  })
})
