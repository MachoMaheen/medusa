/**
 * Wave 1.2 — HappileeInput visual contract.
 *
 * Verifies that the Happilee-skinned Input wrapper renders against the
 * Happilee v3 specs declared in
 * `~/.claude/skills/happilee-v3-design-system/references/components.md`.
 *
 * Strategy: load the dashboard at `/` so Happilee's CSS variable overrides
 * (`packages/admin/dashboard/src/styles/happilee-tokens.css`) are applied to
 * `:root`, then inject a minimal `<input>` element wearing the same Tailwind
 * classes used by `<HappileeInput>` and inspect its computed styles. This lets
 * us assert on the produced visual contract without needing a Storybook or a
 * route that already mounts the component.
 *
 * Static check: scans the source file for raw hex values to enforce the
 * "no invented colors" rule from the Happilee design system skill.
 */

import { test, expect } from "@playwright/test"
import * as fs from "node:fs"
import * as path from "node:path"

const HAPPILEE_INPUT_CLASSES = [
  "block",
  "w-full",
  "h-10",
  "rounded-md",
  "bg-ui-bg-base",
  "border",
  "border-ui-border-base",
  "text-sm",
  "text-ui-fg-base",
  "placeholder:text-ui-fg-muted",
  "outline-none",
  "transition-colors",
  "focus:border-ui-border-interactive",
  "focus:ring-[3px]",
  "focus:ring-ui-bg-highlight",
  "px-3",
].join(" ")

const HAPPILEE_INPUT_SOURCE = path.resolve(
  __dirname,
  "../../src/components/common/happilee-input/happilee-input.tsx",
)

test.describe("Wave 1.2 — HappileeInput", () => {
  test("default height is 40px", async ({ page }) => {
    await page.goto("/")

    const height = await page.evaluate((classes) => {
      const el = document.createElement("input")
      el.id = "happilee-input-probe"
      el.className = classes
      el.placeholder = "Search"
      document.body.appendChild(el)
      const rect = el.getBoundingClientRect()
      return rect.height
    }, HAPPILEE_INPUT_CLASSES)

    expect(height).toBe(40)
  })

  test("border color resolves to Happilee border-primary #d5d7da", async ({ page }) => {
    await page.goto("/")

    const borderColor = await page.evaluate((classes) => {
      const el = document.createElement("input")
      el.className = classes
      document.body.appendChild(el)
      return getComputedStyle(el).borderColor
    }, HAPPILEE_INPUT_CLASSES)

    // #d5d7da == rgb(213, 215, 218)
    expect(borderColor.replace(/\s+/g, "")).toBe("rgb(213,215,218)")
  })

  test("focus state border becomes brand-solid rgb(77, 104, 220)", async ({ page }) => {
    await page.goto("/")

    const focusedBorder = await page.evaluate((classes) => {
      const el = document.createElement("input")
      el.className = classes
      document.body.appendChild(el)
      el.focus()
      // Force focus-visible styles by reading the focus pseudo-style via :focus
      return getComputedStyle(el).borderColor
    }, HAPPILEE_INPUT_CLASSES)

    // #4d68dc == rgb(77, 104, 220)
    expect(focusedBorder.replace(/\s+/g, "")).toBe("rgb(77,104,220)")
  })

  test("source file contains no raw hex color literals", async () => {
    const source = fs.readFileSync(HAPPILEE_INPUT_SOURCE, "utf8")

    // Strip block + line comments so the token documentation (which references
    // hex values for human readers) doesn't trip the static check.
    const codeOnly = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "")

    const hexPattern = /#[0-9a-fA-F]{3,8}\b/g
    const matches = codeOnly.match(hexPattern) ?? []

    expect(matches).toEqual([])
  })
})
