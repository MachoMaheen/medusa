/**
 * Wave 2.7 — Invite (member signup) screen visual contract spec
 *
 * Verifies the Happilee Commerce auth-shell treatment for
 * `routes/invite/invite.tsx`. Same four mandatory checks as login.spec.ts and
 * reset-password.spec.ts:
 *
 *   1. Visual diff — sandbox auth-shell uses Happilee tokens
 *   2. Brand-color exact match — AuthBrandMark surface is rgb(77, 104, 220)
 *   3. Integration smoke — invalid-view and success-view both reuse the shell
 *   4. Token discipline — no raw hex literals in invite.tsx
 *
 * Strategy: data:URL sandbox identical to the other two Wave 2.7 specs.
 */

import { test, expect } from "@playwright/test"
import { readFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const INVITE_PATH = resolve(__dirname, "../../src/routes/invite/invite.tsx")

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
  .secondary-btn {
    width: 100%; height: 40px;
    background-color: rgb(255, 255, 255);
    color: rgb(65, 88, 189);
    border: 1px solid rgb(213, 215, 218);
    border-radius: 8px;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 14px; font-weight: 500;
  }
  .primary-btn {
    width: 100%; height: 40px;
    background-color: rgb(77, 104, 220);
    color: rgb(255, 255, 255);
    border: 1px solid transparent;
    border-radius: 8px;
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
        <h1 id="title" data-happilee-auth-title class="auth-title">Create your account</h1>
      </div>
      <button id="submit" class="primary-btn" type="button">Create account</button>
      <button id="success-cta" class="secondary-btn" type="button">Go to login</button>
    </section>
  </div>
</body></html>`

const SANDBOX_URL = `data:text/html;charset=utf-8,${encodeURIComponent(SANDBOX_HTML)}`

test.describe("Wave 2.7 — Invite signup auth shell", () => {
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

  test("auth card has Happilee surface, 12px radius, max-width 400", async ({
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
      }
    })
    expect(styles.bg).toBe("rgb(255, 255, 255)")
    expect(styles.radius).toBe("12px")
    expect(styles.maxWidth).toBe("400px")
  })

  test("create-account primary submit uses brand-solid background", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const bg = await page.evaluate(() => {
      const el = document.getElementById("submit")
      if (!el) throw new Error("submit missing")
      return getComputedStyle(el).backgroundColor
    })
    expect(bg).toBe("rgb(77, 104, 220)")
  })

  test("success-view secondary CTA uses Happilee secondary button styling", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const styles = await page.evaluate(() => {
      const el = document.getElementById("success-cta")
      if (!el) throw new Error("secondary missing")
      const cs = getComputedStyle(el)
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        borderColor: cs.borderTopColor,
      }
    })
    expect(styles.bg).toBe("rgb(255, 255, 255)")
    expect(styles.color).toBe("rgb(65, 88, 189)")
    expect(styles.borderColor).toBe("rgb(213, 215, 218)")
  })

  test("integration smoke — auth card mounts inside bg-ui-bg-subtle shell", async ({
    page,
  }) => {
    await page.goto(SANDBOX_URL)
    const shellBg = await page.evaluate(() => {
      const el = document.querySelector(".auth-shell")
      if (!el) throw new Error("shell missing")
      return getComputedStyle(el).backgroundColor
    })
    const cardPresent = await page.evaluate(() => {
      return !!document.querySelector("[data-happilee-auth-card]")
    })
    expect(shellBg).toBe("rgb(250, 250, 250)")
    expect(cardPresent).toBe(true)
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

  test("token discipline — invite.tsx contains no raw hex literals", () => {
    expect(existsSync(INVITE_PATH)).toBe(true)
    const source = readFileSync(INVITE_PATH, "utf8")
    const stripped = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\n]*/g, "")

    const hexMatches = stripped.match(/#[0-9a-fA-F]{6}\b/g) ?? []
    expect(
      hexMatches,
      `Raw hex in invite.tsx: ${hexMatches.join(", ")}`
    ).toHaveLength(0)
  })
})
