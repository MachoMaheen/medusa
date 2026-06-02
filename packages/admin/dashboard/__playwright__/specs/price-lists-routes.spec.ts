/**
 * Wave 2.5 — Price Lists routes visual contract spec.
 *
 * Verifies the price-list list + detail screens consume HappileeBadge for the
 * status pill and stay clear of raw hex per the canonical token map.
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { HAPPILEE_BRAND_HEX, expectNoRawHexIn } from "../helpers/visual-diff"

const REPO_ROOT = join(__dirname, "..", "..")

function readSource(rel: string): string {
  return readFileSync(join(REPO_ROOT, rel), "utf8")
}

test.describe("Wave 2.5 — Price Lists routes contract", () => {
  test("brand-color constant is pinned to #4d68dc", () => {
    expect(HAPPILEE_BRAND_HEX).toBe("#4d68dc")
  })

  test("price-list general section swaps StatusBadge → HappileeBadge", () => {
    const src = readSource(
      "src/routes/price-lists/price-list-detail/components/price-list-general-section/price-list-general-section.tsx"
    )
    expect(src).toContain("HappileeBadge")
    expect(src).not.toContain("StatusBadge")
    expect(src).toContain('data-testid="price-list-status-badge"')
  })

  test("price-list list header uses the Happilee testid + canonical divider token", () => {
    const src = readSource(
      "src/routes/price-lists/price-list-list/components/price-list-list-table/price-list-list-table.tsx"
    )
    expect(src).toContain('data-testid="price-lists-list-container"')
    expect(src).toContain('data-testid="price-lists-list-heading"')
    expect(src).toContain("divide-ui-border-menu-bot")
    // Subtitle uses the canonical muted text token (per ADR 001), not subtle.
    expect(src).toContain("text-ui-fg-muted")
  })

  test("source files in the price-lists route use tokens only — no raw hex literals", () => {
    expectNoRawHexIn("src/routes/price-lists/**/*.tsx")
  })
})
