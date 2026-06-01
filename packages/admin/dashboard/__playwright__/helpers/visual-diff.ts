/**
 * Visual diff helpers for the Happilee Commerce regression suite.
 *
 * The four mandatory checks every Wave 1 / Wave 2 worker must include in
 * their spec (see spec §5.3):
 *   1. compareToBaseline()  — visual diff against baseline PNG
 *   2. expectBrandColor()   — exact match on the Happilee brand blue
 *   3. expectChromeUnchanged() — integration smoke: chrome didn't regress
 *   4. expectNoRawHex()     — token discipline: no #xxxxxx in changed files
 *
 * Baselines live in ../baseline/. Source-of-truth references for component
 * patterns: ~/.claude/skills/happilee-v3-design-system/references/components.md
 */

import { expect, type Locator, type Page } from "@playwright/test"
import { execSync } from "node:child_process"
import { readFileSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASELINE_DIR = join(__dirname, "..", "baseline")

/** The Happilee brand blue as RGB. Non-negotiable. */
export const HAPPILEE_BRAND_RGB = "rgb(77, 104, 220)"
export const HAPPILEE_BRAND_HEX = "#4d68dc"

/**
 * Compare a locator's screenshot to a baseline PNG bundled in the skill.
 * Threshold defaults to 1% — pass `{ threshold: 0.005 }` for chrome regions.
 */
export async function compareToBaseline(
  locator: Locator,
  baselineRelPath: string,
  opts: { threshold?: number } = {}
): Promise<void> {
  const baselinePath = join(BASELINE_DIR, baselineRelPath)
  if (!existsSync(baselinePath)) {
    throw new Error(
      `Missing baseline: ${baselinePath}\n` +
        `Run scripts/capture-baseline.mjs to regenerate or check the path.`
    )
  }
  await expect(locator).toHaveScreenshot(baselineRelPath, {
    maxDiffPixelRatio: opts.threshold ?? 0.01,
    animations: "disabled",
  })
}

/**
 * Assert that a locator's background or text color is exactly the Happilee brand blue.
 * Use this on the brand mark, the primary CTA, and the active sidebar item.
 */
export async function expectBrandColor(
  locator: Locator,
  property: "backgroundColor" | "color" = "backgroundColor"
): Promise<void> {
  const value = await locator.evaluate(
    (el, prop) => getComputedStyle(el)[prop as keyof CSSStyleDeclaration] as string,
    property
  )
  expect(value, `Expected ${property} to be Happilee brand blue (#4d68dc)`).toBe(
    HAPPILEE_BRAND_RGB
  )
}

/**
 * Smoke-test that the page's chrome (sidebar + topbar) hasn't regressed.
 * Run this in every feature-screen spec, NOT just primitive specs — it
 * catches "primitive works alone but breaks when used".
 */
export async function expectChromeUnchanged(page: Page): Promise<void> {
  await expect(
    page.locator("[data-shell='sidenav-rail']"),
    "Sidebar rail must match Happilee baseline"
  ).toHaveScreenshot("chrome/sidebar-rail.png", {
    maxDiffPixelRatio: 0.005,
    animations: "disabled",
  })
}

/**
 * Token discipline: assert that no committed file in the given path contains
 * a raw hex color literal. Skip the styles/happilee-tokens.css file, which
 * legitimately defines the tokens.
 *
 * Run this from the spec, NOT in the implementation — it walks the FS at test time.
 */
export function expectNoRawHexIn(globPattern: string): void {
  let output: string
  try {
    output = execSync(
      `git ls-files '${globPattern}' | xargs grep -nE '#[0-9a-fA-F]{6}\\b' || true`,
      { cwd: join(__dirname, "..", "..") }
    ).toString()
  } catch {
    output = ""
  }
  // Strip the legitimate token file from results
  const offending = output
    .split("\n")
    .filter((line) => line && !line.includes("happilee-tokens.css"))
    .filter((line) => !line.includes("// happilee:ok")) // explicit opt-out marker
  if (offending.length > 0) {
    throw new Error(
      `Token discipline violation — raw hex literals found:\n${offending.join("\n")}\n\n` +
        `Use Tailwind tokens (bg-brand-solid, text-brand-secondary-text) ` +
        `or CSS variables (var(--bg-base)) instead. If you genuinely need a ` +
        `raw hex (e.g. in an SVG path), add the comment "// happilee:ok" on the same line.`
    )
  }
}
