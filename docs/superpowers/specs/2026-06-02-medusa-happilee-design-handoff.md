# Medusa → Happilee Commerce: Design Handoff Spec

**Date:** 2026-06-02
**Status:** Draft for user review
**Owner:** CTO Agent (Opus) — operating under Agent OS
**Scope:** Re-skin the Medusa monorepo (`github.com/medusajs/medusa`) so the admin
dashboard and storefront look like a native part of the Happilee v3 ecosystem,
while leaving the Medusa backend pristine for clean upstream merges.

---

## 1. Decisions locked

| # | Decision | Choice | Source |
|---|---|---|---|
| 1 | Surface scope | **Admin dashboard + Next.js storefront (full Medusa)** | User Q1 |
| 2 | Visual depth | **Full visual identity (~99% Happilee)** | User Q2 |
| 3 | Repo strategy | **Fork medusajs/medusa → `happilee-skin` branch with upstream remote** | User Q3 |
| 4 | Boundary | **Frontend only — backend stays pure for upstream merges** | User clarification mid-Q4 |
| 5 | Information architecture | **Medusa IA inside Happilee shell** (Medusa entities, Happilee chrome) | User Q4 |
| 6 | Branding | **Rebrand to "Happilee Commerce"** (wordmark, favicon, login, email) | User Q5 |
| 7 | Orchestration | **Pure parallel devfleet + per-agent Playwright gate** | User Q6 (with mitigation) |
| 8 | Tools | **Agent OS (CEO/CTO/UX/Adversarial/QA SOULs) + DevFleet MCP + happilee-v3-design-system skill** | User explicit request |

---

## 2. Architecture & boundary

### 2.1 Repo layout

```
/Users/maheen/medusa_breadfac/
├── .git/                          # origin: machomaheen/medusa, upstream: medusajs/medusa
├── vault/
│   ├── PRODUCT.md                 # Agent OS Goal Ancestry root
│   └── ADR/                       # architecture decisions log (this spec + future)
├── CLAUDE.md                      # "You are the CTO Agent" instructions
├── AGENTS.md                      # Hermes routing rules
├── .agent-os/
│   ├── tasks/                     # PaperClip task mirrors
│   └── reviews/                   # Adversarial Reviewer outputs
├── packages/
│   ├── admin-next/dashboard/      # OURS — heavy modify (skin, sidebar, screens)
│   ├── admin-vite-plugin/         # OURS — light modify (theme injection)
│   ├── medusa/                    # UPSTREAM — never touched
│   ├── framework/                 # UPSTREAM — never touched
│   ├── types/                     # UPSTREAM — never touched
│   ├── utils/                     # UPSTREAM — never touched
│   ├── modules/*                  # UPSTREAM — never touched
│   ├── core/*                     # UPSTREAM — never touched
│   └── cli/*                      # UPSTREAM — never touched
└── apps/
    └── storefront/                # OURS — heavy modify (Next.js, PDP, cart, checkout)
```

### 2.2 Branch model

- `main` ← tracks `upstream/main` (read-only, syncs Medusa releases)
- `happilee-skin` ← all our work, rebased onto `main` when pulling updates

Upstream pulls = `git fetch upstream && git rebase upstream/main happilee-skin`.
Conflicts only land where Medusa restructures admin internals; the contained scope
keeps these rare.

### 2.3 What stays pristine vs what changes

**OURS (modify freely):**
- `packages/admin-next/dashboard/**` (the Vite + React + Tailwind admin)
- `packages/admin-vite-plugin/**` (theme injection hook)
- `apps/storefront/**` (Next.js customer storefront)
- `vault/**`, `.agent-os/**`, `CLAUDE.md`, `AGENTS.md` (Agent OS metadata)

**UPSTREAM (never touched):**
- `packages/medusa/**`
- `packages/framework/**`
- `packages/types/**`
- `packages/utils/**`
- `packages/modules/**`
- `packages/core/**`
- `packages/cli/**`
- Any test that exercises backend behavior

A pre-commit hook + a Playwright assertion enforce this; Adversarial Reviewer
rejects any PR that touches forbidden paths.

---

## 3. Design system contract

### 3.1 The skill (single source of truth)

**Installed at:** `~/.claude/skills/happilee-v3-design-system/`
**Source:** Extracted on 2026-06-02 from `localhost:3000` (Happilee v3 flowbuilder)
plus `tokens.ts`/`tailwind.config.ts` in `/Users/maheen/happilee-mcp/happilee-flowbuilder/apps/web`.

**Five non-negotiables** (defining "looks like Happilee"):

1. Brand blue is `#4d68dc` exactly. Not `#5d7bf1` (hover), not `#4158bd` (text on brand).
2. Inter is the only font.
3. Page bg is `#fafafa`, card surfaces are pure white `#ffffff`.
4. Sidebar is 56px white rail + 220px tier-two expandable panel.
5. Selected state is `#edf2fe` fill with `#4158bd` text — never saturated brand-blue fill.

**Bundled resources:**
- `references/tokens.md` — colors, spacing, type, radii, shadows
- `references/sidebar.md` — SideNav structure, 3 responsive modes, IA mapping
- `references/components.md` — card, badge, tab list, search bar, stats card, promo, empty state, buttons, modal
- `references/inventory/README.md` — Happilee element → Medusa equivalent table
- `references/screenshots/*.png` — 8 full-page baselines at 1440×900 @2x
- `assets/tokens/tokens.ts` — Figma-extracted TypeScript export
- `assets/tokens/tailwind.config.reference.ts` — drop-in Tailwind preset
- `assets/tokens/SideNav.reference.tsx` — 60KB SideNav implementation
- `assets/tokens/MainLayout.reference.tsx` — shell layout
- `scripts/capture-baseline.mjs` — regenerates baselines from localhost:3000

### 3.2 Skill propagation across the agent pipeline

Three channels keep workers in lockstep with the contract:

1. **Auto-trigger via description** — skill description includes "Medusa",
   "medusa_breadfac", "packages/admin-next", "apps/storefront", "re-skin",
   "Happilee ecosystem". Workers touching those paths/phrases auto-load it.
2. **Explicit invocation in worker prompts** — every devfleet mission prompt
   begins with *"Before writing any CSS or JSX, invoke `happilee-v3-design-system`
   and read the relevant `references/` files."*
3. **Playwright gate fallback** — workers that ignore the skill still fail the
   per-agent visual regression check (Section 5).

### 3.3 IA mapping (Happilee shell → Medusa entities)

| Happilee tier-1 slot | Medusa route | Tier-2 sub-items |
|---|---|---|
| Workspace (H mark) | (chrome) | — |
| Home | `/` | Overview · Sales · Customers · Reports |
| Orders | `/orders` | All · Drafts · Returns · Claims · Swaps |
| Catalog | `/products` | Products · Collections · Categories · Tags · Channels |
| Customers | `/customers` | All · Customer groups · Segments |
| Inventory | `/inventory` | Items · Locations · Reservations · Levels |
| Promotions | `/promotions` | Campaigns · Codes · Price lists · Gift cards |
| *(separator)* | | |
| Settings (utility, bottom) | `/settings/*` | Store · Regions · Tax · Shipping · API keys · Users · Workflows |
| Help (utility, bottom) | external | — |
| Collapse (utility, bottom) | toggle | triggers `rail-only` mode |
| Account (utility, bottom) | user menu | — |

**Slots omitted vs. stock Happilee:** Inbox, Automations (no Medusa equivalent;
do not fake).

**Route-aware rail-only mode** (matches Happilee's `/automations/:flowId/edit`):
triggers on `/products/:id/edit`, `/orders/:id/edit`, `/promotions/:id/edit`.

---

## 4. Multi-agent execution plan

### 4.1 Wave −1 · Runtime bootstrap (1 Opus agent, ~10 min)

Sequential — must complete before any other work.

```bash
cd /Users/maheen/Projects/agent-os
make install-dev --with-hermes       # Hermes via PM2, $0 via claude-bridge
make install-paperclip               # CEO dashboard

devfleet serve --port 18801 &
claude mcp add devfleet --transport http http://localhost:18801/mcp
export DEVFLEET_MAX_AGENTS=12

# Verification
curl -s localhost:18801/mcp -o /dev/null -w "%{http_code}\n"   # expect 200
pm2 ls                                                         # expect healthy
```

### 4.2 Wave 0 · Foundation (1 Opus agent, ~30 min)

Single agent — everything downstream depends on this contract.

1. `git clone https://github.com/medusajs/medusa.git /Users/maheen/medusa_breadfac`
2. Fork to `github.com/machomaheen/medusa` → set remotes:
   ```
   git remote rename origin upstream
   git remote add origin git@github.com:machomaheen/medusa.git
   git push -u origin main
   ```
3. Pin to latest stable Medusa tag: `git ls-remote --tags upstream | sort -V | tail -3`,
   pick the highest non-prerelease, record in `vault/PRODUCT.md`, then
   `git checkout -b happilee-skin <tag>`
4. Bootstrap Agent OS in repo:
   - Write `vault/PRODUCT.md` — Goal Ancestry root: *"Make Medusa look like part of Happilee Ecosystem"*
   - Write `CLAUDE.md` — CTO Agent instructions, references the skill
   - Write `AGENTS.md` — Hermes routing rules
   - Create `.agent-os/tasks/`, `.agent-os/reviews/`, `.agent-os/.gitignore` patterns
5. Apply contract to `packages/admin-next/dashboard`:
   - Drop in Tailwind config from skill assets
   - Wire `tokens.ts` as theme provider
   - Port `SideNav.reference.tsx` → `src/components/shell/SideNav.tsx` with IA from § 3.3
   - Port `MainLayout.reference.tsx` → `src/components/shell/AdminShell.tsx`
   - Wire shell into `App.tsx`
6. Set up Playwright regression infra (see § 5.1)
7. `bun install && bun dev` — dashboard boots with Happilee chrome
8. Capture `__playwright__/baseline/regression/wave-0.png`
9. Commit, push branch.

### 4.3 Wave 1 · Primitives (12 parallel Sonnet workers, ~1–2 hrs)

All `depends_on: [wave-0]`, `auto_dispatch: true`, isolated worktrees.

| Mission | Target | Reference |
|---|---|---|
| W1.1 Button | `src/components/common/button.tsx` | `components.md` § Buttons |
| W1.2 Input | `input.tsx` + textarea | `components.md` § Search bar (adapted) |
| W1.3 Select | `select.tsx` | derived from input + tier-2 list |
| W1.4 Table | `table.tsx` | white surface + `#e9eaeb` dividers |
| W1.5 Modal | `modal.tsx` | `components.md` § Modal/drawer |
| W1.6 Drawer | `drawer.tsx` | side modal, same tokens |
| W1.7 Toast | replace with `sonner` | `components.md` § Toast |
| W1.8 Badge | `badge.tsx` | `components.md` § Status badge |
| W1.9 Tabs | `tabs.tsx` | `components.md` § Tab list |
| W1.10 Tooltip | `tooltip.tsx` | rail-only hover labels |
| W1.11 Card | `card.tsx` | `components.md` § Card |
| W1.12 EmptyState | `empty-state.tsx` | `components.md` § Empty state |

### 4.4 Wave 2 · Feature screens (10 parallel Sonnet workers, ~2–3 hrs)

All `depends_on: [W1.1..W1.12]` (wait for all primitives).

| Mission | Target |
|---|---|
| W2.1 Orders | `routes/orders/*` (list, detail, returns, claims) |
| W2.2 Products | `routes/products/*` (list, detail editor, variants) |
| W2.3 Customers | `routes/customers/*` (list, detail, groups) |
| W2.4 Inventory | `routes/inventory/*` (items, locations) |
| W2.5 Promotions | `routes/promotions/*` (campaigns, codes, price lists) |
| W2.6 Settings | `routes/settings/*` (all panels) |
| W2.7 Auth | `routes/auth/*` (login, signup, forgot-password) |
| W2.8 Storefront PDP | `apps/storefront/app/products/*` |
| W2.9 Storefront cart | `apps/storefront/app/cart/*` |
| W2.10 Storefront checkout | `apps/storefront/app/checkout/*` |

### 4.5 Wave 3 · Integration & branding (1 Opus agent, ~30 min)

- Global UI-string replace: "Medusa" → "Happilee Commerce" (NOT package names, NOT backend)
- Replace favicon, login title, browser tab title, email templates
- Full E2E Playwright regression — every page vs Happilee baseline
- Open final merged PR for human review

### 4.6 Model routing & cost shape

| Wave | Agents | Implementer model | Reviewer model |
|---|---|---|---|
| −1 | 1 | Opus | — |
| 0 | 1 | Opus | Opus (per SOUL: Opus → Opus) |
| 1 (primitives) | 12 parallel | Sonnet | Opus (Sonnet → Opus) |
| 2 (features) | 10 parallel | Sonnet | Opus |
| 3 (integration) | 1 | Opus | Opus |

**Cost optimization:** Wave 1.7 (Toast — just swap library) and 1.10 (Tooltip)
are low-judgment and can use Sonnet reviewer instead of Opus. Total estimated
wall-clock: **4–6 hours end-to-end**.

### 4.7 Agent OS / DevFleet binding

- `vault/PRODUCT.md` → CEO Agent (Opus) reads → creates project tree
- CEO posts project to PaperClip → CTO picks it up
- CTO calls `plan_project()` on DevFleet MCP using this spec
- DevFleet returns DAG matching § 4.2–4.5; CTO dispatches root mission
- Each worker = Claude Code (Sonnet) with skill auto-loaded
- Every PR → Adversarial Reviewer (Opus, per SOUL rule) — 7-question framework
- QA Agent (Sonnet) runs full Playwright suite after each wave merge
- All status flows back to PaperClip dashboard

---

## 5. Per-agent Playwright quality gate

### 5.1 Setup (lands in Wave 0)

```
packages/admin-next/dashboard/
├── playwright.config.happilee.ts
└── __playwright__/
    ├── baseline/
    │   ├── chrome/          # sidebar-rail, sidebar-tier2, topbar (cropped from full-page)
    │   ├── components/      # per-primitive baselines (clipped from automations grid)
    │   └── full-page/       # all 8 skill screenshots copied in
    ├── helpers/
    │   ├── visual-diff.ts   # pixelmatch wrapper
    │   └── happilee-baseline.ts
    └── specs/               # one per worker (Wave 1 + 2 = 22 specs)
```

### 5.2 Tolerance tiers

| Region | Threshold | Why |
|---|---|---|
| Chrome (sidebar rail, tier-2, topbar) | 0.5% | Structural — identical across pages |
| Reusable components (button, badge, card) | 1% | Same component, same look everywhere |
| Brand mark / brand-color regions | 0% (exact hex sample) | No drift allowed |
| Page content area | 5% | Content differs by page; check chrome doesn't break |

### 5.3 The four mandatory tests per worker

Wave 0 has its own gate (chrome baseline capture, full-page screenshot saved as
`wave-0.png`) and Wave 3 has the full E2E regression suite (§ 4.5). The four
mandatory tests below apply to **every Wave 1 and Wave 2 worker PR**.

Each Wave 1 / Wave 2 PR must include a spec with:

1. **Visual diff** against the relevant baseline image (with the tier threshold)
2. **Brand-color exact match** — sampled hex must equal `rgb(77, 104, 220)` (#4d68dc)
3. **Integration smoke** — component renders on a real page; chrome unchanged
4. **Token discipline** — no raw hex literals in changed files (regex assertion)

### 5.4 Mission lifecycle

```
worker spawned → reads skill → writes code → opens PR
  ↓
DevFleet auto-runs `bun playwright test --config playwright.config.happilee.ts`
  ↓
  ├── PASS → Adversarial Reviewer (Opus) cold-reviews diff (7 questions)
  │           ↓
  │       APPROVE → auto-merge
  │       REQUEST_CHANGES → mission reopens with reviewer notes
  │
  └── FAIL → mission reopens with diff report + actual/expected images
             worker iterates without user intervention
```

### 5.5 QA Agent cross-wave check

After each wave merges, QA Agent runs the **full** regression suite on
`happilee-skin` HEAD. Catches "primitive looks fine alone but breaks in
context." Failures reopen the responsible mission via PaperClip.

### 5.6 Acknowledged regressions

A `// REGRESSION-OK: <reason>` comment in a spec allows expected diffs
(e.g., Medusa added a column, page rightfully looks different). Adversarial
Reviewer requires this comment to ship any acknowledged divergence.

---

## 6. Risks, rollback, kill switch

### 6.1 Top risks

| # | Risk | Mitigation |
|---|---|---|
| 1 | Backend bleed (worker edits forbidden path) | Pre-commit hook + Playwright path assertion + Adversarial Reviewer rejects |
| 2 | Token drift (invented color) | "No raw hex" test + Reviewer question #4 (Spec Alignment) |
| 3 | DevFleet runaway (retry loop, burns tokens) | `DEVFLEET_MAX_AGENTS=12`, per-mission `max_turns=40`, PaperClip budget enforcer |
| 4 | Upstream restructures admin | Pin to release tag; deliberate rebase, never automatic |
| 5 | Playwright flakiness (fonts, animations) | Preload Inter, disable animations in config, `networkidle` wait |
| 6 | Content change mistaken for regression | Per-region thresholds + `// REGRESSION-OK` opt-in |
| 7 | Reviewer too strict | Calibrate after Wave 1; introduce `REQUEST_CHANGES_REASON` taxonomy |
| 8 | Storefront ≠ admin divergence | Cross-surface diff in QA Agent's Wave 2 check |
| 9 | Opus reviewer cost overrun | Use Sonnet reviewer for low-judgment primitives (W1.7, W1.10) |
| 10 | Timeline blows out 3× | Wave-level checkpoints; pause-or-continue gate after each wave |

### 6.2 Kill switches (least → most destructive)

```
1. Pause a single mission
   devfleet cancel_mission --id <mission-id>

2. Pause all in-flight; preserve work
   pm2 stop hermes-gateway
   for id in $(devfleet list_missions --status=running); do devfleet cancel_mission --id $id; done

3. Revert a single mission's commit
   git revert <mission-merge-sha>

4. Revert an entire wave
   git revert <wave-start>..<wave-end>

5. Nuclear — discard re-skin entirely
   git checkout main
   git branch -D happilee-skin
   # zero impact on Medusa backend
```

The frontend/backend boundary means **nuclear option is non-destructive**.

### 6.3 Abort cost by wave

| Abort after | Lost | Kept |
|---|---|---|
| Wave −1 | runtime setup | nothing in repo yet |
| Wave 0 | foundation commit | trivial redo |
| Wave 1 partial | some primitive PRs | merged ones shippable as "v0.1 partial re-skin" |
| Wave 2 partial | some feature PRs | a few pages look "Medusa-y" inside Happilee shell — degraded but functional |
| Wave 3 | branding strings | trivial text-edit redo |

**Every abort point leaves a shippable artifact.**

### 6.4 Observability for the human

- PaperClip dashboard — live mission board, budget burn
- DevFleet `get_dashboard()` — slot usage, recent activity
- `pm2 logs hermes-gateway` — autonomous-layer logs
- Per-mission Playwright HTML reports (embedded in PR comments)
- `playwright-report/index.html` — visual diff viewer

### 6.5 Telemetry for continuous improvement

After Wave 1, surface and feed into Wave 2 prompts:
- Adversarial Reviewer false-positive rate
- Average iterations per primitive
- Token spend per mission
- Visual regression diff scores (mean + p95)

---

## 7. Definition of done

The project ships when ALL of these are true:

- [ ] `happilee-skin` branch is mergeable into `main` (no conflicts)
- [ ] Every page in admin + storefront passes the Playwright regression suite
- [ ] Adversarial Reviewer has APPROVED every Wave 1–3 PR
- [ ] QA Agent's final cross-surface check passes (admin chrome == storefront chrome on shared elements)
- [ ] All "Medusa" wordmark replaced with "Happilee Commerce" in UI strings
- [ ] Backend test suite (untouched) still passes — proves no backend bleed
- [ ] Dev server boots, admin login works, storefront PDP renders a real product
- [ ] `vault/PRODUCT.md` updated with the final state for future Agent OS sessions
- [ ] Final PR opened against `main` with full diff summary, ready for human merge

---

## 8. Out of scope

Explicitly NOT in this engagement:

- Modifying Medusa backend behavior (only UI re-skin)
- Adding new entities or features (only re-styling existing ones)
- Mobile native apps (Happilee has none yet)
- Marketing site (Happilee landing page is a separate property)
- Hyremaster / Spice Lane / Acres&More products (the skill is reusable for them, but
  applying it is a separate engagement)
- Performance optimization of the Medusa admin beyond the visual layer
- Internationalization (RTL, translation strings) — Happilee is en-US for now
- Dark mode — Happilee v3 is light-mode only

---

## 9. Dependencies & assumptions

- Local environment has `bun`, `pm2`, `node ≥ 18`, `git`, `claude` CLI
- Happilee v3 flowbuilder runs at `localhost:3000` (currently online — verified)
- GitHub account `machomaheen` is the fork target (confirmed 2026-06-02)
- Agent OS at `/Users/maheen/Projects/agent-os/` is installable via `make install-dev --with-hermes`
- DevFleet binary is available (install via the Agent OS `install.sh` if missing)
- Claude subscription provides Sonnet + Opus access via `claude-bridge`
- User has ~4–6 hours of session time to monitor; can step away during Wave 1 parallel
  execution but should be present at wave boundaries for go/no-go decisions

---

## 10. Resolved operational decisions

All 5 open questions answered 2026-06-02:

1. **GitHub fork target:** `github.com/machomaheen/medusa`
   - `git remote add origin git@github.com:machomaheen/medusa.git`
   - `git remote add upstream https://github.com/medusajs/medusa.git`
2. **Medusa release tag:** **latest stable** at clone time. Wave 0's first task is to
   run `git ls-remote --tags upstream | sort -V | tail -3` and pin to the highest
   non-prerelease semver tag. Record the tag in `vault/PRODUCT.md` for repeatability.
3. **Wordmark:** **"Happilee Commerce"** — confirmed. Applies to:
   - Browser tab title
   - Login/signup screen titles
   - Footer/about page
   - Email template senders + headers
   - Favicon (Happilee H mark on `#4d68dc`)
4. **PaperClip dashboard:** **local-only** (default `http://localhost:3100`).
   No Tailnet exposure, no public URL. User monitors from the same MacBook.
5. **Budget governance** — set by the Opus supervisor (this CTO agent) per
   mission type. See § 11 below.

## 11. Budget governance (Opus-supervisor decision)

Per-mission caps (`max_cost_usd` enforced by PaperClip budget enforcer; mission
auto-cancels at 1.5× cap):

| Mission type | Model | Per-mission cap | Reason |
|---|---|---|---|
| Wave −1 (runtime bootstrap) | Opus | $5 | One-shot infra setup, must be right |
| Wave 0 (foundation + skill + sidebar port) | Opus | $10 | Largest scope, defines downstream contract |
| Wave 1 primitives (W1.1–W1.12, × 12) | Sonnet | $2 each | Single-file, well-scoped |
| Wave 2 features (W2.1–W2.10, × 10) | Sonnet | $4 each | Multiple files per page, more iteration |
| Wave 3 (integration + branding) | Opus | $10 | Large diff, full E2E suite |
| Adversarial Reviewer per PR (Opus) | Opus | $2 each | Cold diff review, bounded scope |
| QA Agent per wave (× 3 — after W1, W2, W3) | Sonnet | $3 each | Full Playwright run + report |

**Projected total spend:**

| Bucket | Calculation | Subtotal |
|---|---|---|
| Wave −1 bootstrap | 1 × $5 | $5 |
| Wave 0 foundation | 1 × $10 | $10 |
| Wave 1 primitives | 12 × $2 | $24 |
| Wave 2 features | 10 × $4 | $40 |
| Wave 3 integration | 1 × $10 | $10 |
| Adversarial reviews | 23 PRs × $2 | $46 |
| QA waves | 3 × $3 | $9 |
| **Subtotal** | | **$144** |

**Hard project ceiling: $250** (75% buffer over projected). PaperClip auto-pauses
all new mission dispatches when total spend crosses this number; existing missions
finish, then waits for human re-authorization.

**Soft warning at $175** — PaperClip emits a notification to the dashboard but
does not pause. Lets the supervisor (this CTO agent) intervene early if a wave
is burning faster than projected.

**Cost-saving lever already baked in:** Wave 1.7 (Toast — library swap, low
judgment) and Wave 1.10 (Tooltip — derivative of existing primitives) use
**Sonnet adversarial reviewer instead of Opus**. Saves ~$2 with negligible
quality risk. Applied automatically by the model router in the mission prompts.

**Re-authorization protocol:** if the project hits $250 with work remaining, the
supervisor must:
1. Run `get_dashboard()` to identify which wave is over budget
2. Surface the cost overrun to the human (you) with a per-wave breakdown
3. Request explicit approval to either (a) raise the ceiling, (b) downgrade
   remaining missions to Sonnet-only reviewers, or (c) ship the current state
   as a partial re-skin and defer remaining work.
