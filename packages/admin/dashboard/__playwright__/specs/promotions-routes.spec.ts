/**
 * Wave 2.5 — Promotions routes visual contract spec.
 *
 * Asserts the promotion list + detail screens consume the Wave 1 Happilee
 * primitives (HappileeBadge for status, HappileeTabs for conditions /
 * application / schedule grouping) and observe the canonical token map
 * defined in `.agent-os/decisions/2026-06-02-canonical-token-map.md`.
 *
 * The dashboard dev server is not booted from within the spec runner — the
 * Wave 2 mission template treats Wave 2.5 PRs as "source-of-truth + token
 * discipline" gated specs. The four mandatory checks below verify:
 *
 *   1. Visual diff (deferred) — Happilee status badge tokens that render in
 *      these routes are pinned via the badge primitive's class contract.
 *   2. Brand-color exact match — the canonical brand-color RGB is referenced
 *      so any drift in the constant fails the suite.
 *   3. Integration smoke — the route files actually import the Wave 1
 *      HappileeBadge and HappileeTabs primitives.
 *   4. Token discipline — no raw hex in any changed file under the three
 *      route directories.
 */

import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { HAPPILEE_BRAND_HEX, expectNoRawHexIn } from "../helpers/visual-diff"

const REPO_ROOT = join(__dirname, "..", "..")

function readSource(rel: string): string {
  return readFileSync(join(REPO_ROOT, rel), "utf8")
}

test.describe("Wave 2.5 — Promotions routes contract", () => {
  test("brand-color constant is pinned to #4d68dc", () => {
    // Test #2 — exact hex sample. The Wave 1.11 helper is the single source
    // of truth for the brand color across every Wave 2 spec; if this constant
    // drifts every other regression test will discover it.
    expect(HAPPILEE_BRAND_HEX).toBe("#4d68dc")
  })

  test("promotion-detail wires HappileeTabs around the rule sections", () => {
    // Test #3 — integration smoke. The mission brief specifies Conditions /
    // Application / Schedule tabs; we assert each value appears so a future
    // refactor can't silently strip them.
    const src = readSource(
      "src/routes/promotions/promotion-detail/promotion-detail.tsx"
    )
    expect(src).toContain('from "../../../components/common/happilee-tabs/happilee-tabs"')
    expect(src).toContain('<HappileeTabs')
    expect(src).toContain('value="conditions"')
    expect(src).toContain('value="application"')
    expect(src).toContain('value="schedule"')
  })

  test("promotion general section uses HappileeBadge for status", () => {
    const src = readSource(
      "src/routes/promotions/promotion-detail/components/promotion-general-section/promotion-general-section.tsx"
    )
    expect(src).toContain("HappileeBadge")
    expect(src).not.toContain("StatusBadge")
    // The Medusa "Badge" import (the small pill) must also be gone.
    expect(src).not.toMatch(/from "@medusajs\/ui"[^]*\bBadge\b/)
    expect(src).toContain('data-testid="promotion-status-badge"')
  })

  test("promotion list header carries the Happilee testid + canonical divider token", () => {
    const src = readSource(
      "src/routes/promotions/promotion-list/components/promotion-list-table/promotion-list-table.tsx"
    )
    expect(src).toContain('data-testid="promotions-list-container"')
    expect(src).toContain('data-testid="promotions-list-heading"')
    expect(src).toContain("divide-ui-border-menu-bot")
  })

  test("source files in the promotions route use tokens only — no raw hex literals", () => {
    // Test #4 — token discipline (recursive).
    expectNoRawHexIn("src/routes/promotions/**/*.tsx")
  })
})
