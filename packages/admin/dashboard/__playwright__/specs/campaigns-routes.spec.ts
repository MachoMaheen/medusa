/**
 * Wave 2.5 — Campaigns routes visual contract spec.
 *
 * Asserts the campaign list + detail screens import the Wave 1 HappileeBadge
 * primitive for status / currency pills and stay clear of raw hex per the
 * canonical token map (ADR 001 — 2026-06-02).
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { HAPPILEE_BRAND_HEX, expectNoRawHexIn } from "../helpers/visual-diff"

const REPO_ROOT = join(__dirname, "..", "..")

function readSource(rel: string): string {
  return readFileSync(join(REPO_ROOT, rel), "utf8")
}

test.describe("Wave 2.5 — Campaigns routes contract", () => {
  test("brand-color constant is pinned to #4d68dc", () => {
    expect(HAPPILEE_BRAND_HEX).toBe("#4d68dc")
  })

  test("campaign general section swaps StatusBadge → HappileeBadge", () => {
    const src = readSource(
      "src/routes/campaigns/campaign-detail/components/campaign-general-section/campaign-general-section.tsx"
    )
    expect(src).toContain("HappileeBadge")
    expect(src).not.toContain("StatusBadge")
    // The Medusa `Badge` import (the currency pill) must also be retired.
    expect(src).not.toMatch(/import \{[^}]*\bBadge\b[^}]*\}[^]*?from "@medusajs\/ui"/)
    expect(src).toContain('data-testid="campaign-status-badge"')
  })

  test("campaign list header carries the Happilee testid + canonical divider token", () => {
    const src = readSource(
      "src/routes/campaigns/campaign-list/components/campaign-list-table.tsx"
    )
    expect(src).toContain('data-testid="campaigns-list-container"')
    expect(src).toContain('data-testid="campaigns-list-heading"')
    expect(src).toContain("divide-ui-border-menu-bot")
  })

  test("source files in the campaigns route use tokens only — no raw hex literals", () => {
    expectNoRawHexIn("src/routes/campaigns/**/*.tsx")
  })
})
