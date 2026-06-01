# Product: Happilee Commerce (Medusa-backed)

## Mission

Provide a Happilee-native commerce experience built on Medusa's backend. The
admin dashboard and storefront look indistinguishable from the rest of the
Happilee ecosystem; the backend remains pristine Medusa so upstream releases
can be pulled cleanly.

## Pinned Medusa version

- **Tag/version:** `v2.15.5` (latest stable as of 2026-06-02)
- **Pinned commit SHA:** `08d7f0e9`
- **Pin policy:** advance only by deliberate rebase (`git fetch upstream && git rebase upstream/main happilee-skin`), never by automatic merge.

## Tech stack

- **Backend** (untouched): Medusa v2.15.5 — `packages/medusa`, `packages/framework`, `packages/types`, `packages/utils`, `packages/modules/*`, `packages/core/*`, `packages/cli/*`
- **Admin dashboard** (re-skinned): `packages/admin/dashboard` — Vite + React + Tailwind + `@medusajs/ui`
- **Admin bundler** (light touch): `packages/admin/admin-vite-plugin`, `packages/admin/admin-bundler`
- **Storefront** (re-skinned): `apps/storefront` — Next.js (scaffolded in Wave 2)
- **Design system source-of-truth:** `~/.claude/skills/happilee-v3-design-system/`

## North Star Metric

Visual regression diff from Happilee baseline screenshots **< 1%** on chrome
regions, **< 5%** on content regions. Backend test suite passing
**at 100%** of upstream's pass rate (proves no backend bleed).

## Current Gaps → Plan

| Wave | Status | Description |
|---|---|---|
| -1 | ✓ partial | Agent OS dev mode installed; PaperClip/DevFleet deferred (skipped — using Claude Code parallelism) |
| 0 | in progress | Tokens applied via theme.extend; shell restructure scheduled; Playwright infra TBD |
| 1 | pending | 12 primitive re-skins in parallel devfleet |
| 2 | pending | 10 feature-screen re-skins + storefront scaffold |
| 3 | pending | Branding ("Happilee Commerce") + full E2E |

## Goal Ancestry root

This file is the root of the Goal Ancestry chain. Every PaperClip task in the
project traces back to: *"Make Medusa look like part of the Happilee ecosystem."*

## Reference materials

- **Spec:** [`docs/superpowers/specs/2026-06-02-medusa-happilee-design-handoff.md`](../docs/superpowers/specs/2026-06-02-medusa-happilee-design-handoff.md)
- **Plan:** [`docs/superpowers/plans/2026-06-02-medusa-happilee-design-handoff.md`](../docs/superpowers/plans/2026-06-02-medusa-happilee-design-handoff.md)
- **Design system skill:** `~/.claude/skills/happilee-v3-design-system/`
- **Happilee v3 reference (live):** `http://localhost:3000`
