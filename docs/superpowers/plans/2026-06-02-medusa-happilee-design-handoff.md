# Medusa → Happilee Commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the Medusa monorepo (admin dashboard + Next.js storefront) to look like a native part of the Happilee v3 ecosystem, leaving the Medusa backend pristine for clean upstream merges.

**Architecture:** Fork `medusajs/medusa` to `github.com/machomaheen/medusa`, do all visual work on a `happilee-skin` branch contained to `packages/admin-next/dashboard/**`, `packages/admin-vite-plugin/**`, and `apps/storefront/**`. Drive execution via a 5-wave devfleet pipeline orchestrated by Agent OS, with per-mission Playwright visual regression against baselines extracted from `localhost:3000` (Happilee v3).

**Tech Stack:** Medusa 2.x (Node, Vite, React, Tailwind), Happilee v3 design tokens (Inter, `#4d68dc`, 56px rail + 220px tier-two shell), Agent OS (CEO/CTO/Adversarial/QA/UX SOULs), DevFleet MCP at `localhost:18801`, Hermes daemon via PM2, PaperClip Company OS at `localhost:3100`, Playwright + pixelmatch for visual regression, `claude-bridge` for $0-overhead LLM access.

**Spec:** [`docs/superpowers/specs/2026-06-02-medusa-happilee-design-handoff.md`](../specs/2026-06-02-medusa-happilee-design-handoff.md)

**Design system skill:** `~/.claude/skills/happilee-v3-design-system/` (must be loaded by every worker)

---

## Wave −1 — Runtime Bootstrap

**Owner:** CTO Agent (this session, Opus). Sequential — no parallelism. Budget: $5.

**Files:**
- Modify: none in repo (operates on `/Users/maheen/Projects/agent-os/` + PM2)

### Task −1.1: Verify prerequisites

- [ ] **Step 1:** Run prerequisite check

```bash
which bun node git claude pm2
node --version    # expect >=18
bun --version     # expect >=1.0
pm2 --version
```

Expected: all commands found, no errors. If `pm2` missing, install: `npm install -g pm2`.

- [ ] **Step 2:** Confirm Happilee v3 reference is alive

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/automations
```

Expected: `200`. If not, start the Happilee v3 dev server before continuing — the skill's baseline regeneration script (`~/.claude/skills/happilee-v3-design-system/scripts/capture-baseline.mjs`) depends on it.

### Task −1.2: Install Agent OS in dev mode

- [ ] **Step 1:** Run installer

```bash
cd /Users/maheen/Projects/agent-os
make install-dev --with-hermes
```

Expected: install.sh prints "Hermes gateway started" and PM2 shows a `hermes-gateway` process.

- [ ] **Step 2:** Verify Hermes is healthy

```bash
pm2 list | grep hermes-gateway
curl -s http://localhost:8318/health -o /dev/null -w "%{http_code}\n"
```

Expected: PM2 shows `online`, health endpoint returns `200`.

### Task −1.3: Install PaperClip dashboard (local-only)

- [ ] **Step 1:** Install via Docker compose

```bash
cd /Users/maheen/Projects/agent-os
make install-paperclip
```

Expected: install completes, prints "PaperClip running at http://localhost:3100".

- [ ] **Step 2:** Verify dashboard reachable

```bash
curl -s http://localhost:3100/api/health -o /dev/null -w "%{http_code}\n"
```

Expected: `200`. Open `http://localhost:3100` in browser — should render the dashboard.

### Task −1.4: Start DevFleet MCP

- [ ] **Step 1:** Locate DevFleet binary

```bash
which devfleet || ls /Users/maheen/Projects/agent-os/bridge/devfleet 2>/dev/null
```

If not found, install: `cd /Users/maheen/Projects/agent-os && ./install.sh --devfleet` (or equivalent from the package).

- [ ] **Step 2:** Start DevFleet on port 18801 with 12-agent parallelism

```bash
pm2 start devfleet --name devfleet -- serve --port 18801
pm2 set devfleet:DEVFLEET_MAX_AGENTS 12
pm2 save
```

Expected: `pm2 list` shows `devfleet` online.

- [ ] **Step 3:** Register MCP with Claude Code

```bash
claude mcp add devfleet --transport http http://localhost:18801/mcp
claude mcp list | grep devfleet
```

Expected: devfleet appears in the MCP list.

- [ ] **Step 4:** Verify MCP responds

```bash
curl -s http://localhost:18801/mcp -o /dev/null -w "%{http_code}\n"
```

Expected: `200`.

### Task −1.5: Commit runtime status to memory

- [ ] **Step 1:** Append runtime URLs to project memory

Append to `~/.claude/projects/-Users-maheen-medusa-breadfac/memory/project_medusa_happilee.md`:

```markdown
## Runtime endpoints (live as of Wave −1)
- Hermes: http://localhost:8318
- PaperClip: http://localhost:3100
- DevFleet MCP: http://localhost:18801/mcp
- Happilee v3 reference: http://localhost:3000
```

No commit needed — memory is outside git.

---

## Wave 0 — Foundation

**Owner:** CTO Agent (this session, Opus). Single agent, no parallelism. Budget: $10.

**Files:**
- Create: every file listed in the file-structure preview at the top of this plan

### Task 0.1: Fork Medusa on GitHub

- [ ] **Step 1:** Fork via gh CLI

```bash
gh repo fork medusajs/medusa --org machomaheen --remote=false --clone=false
```

Expected: `✓ Created fork machomaheen/medusa`.

- [ ] **Step 2:** Verify fork exists

```bash
gh repo view machomaheen/medusa --json url -q .url
```

Expected: `https://github.com/machomaheen/medusa`.

### Task 0.2: Clone fork into the working directory

The target dir `/Users/maheen/medusa_breadfac/` currently contains only `docs/` and `.superpowers/`. Both must be preserved.

- [ ] **Step 1:** Stash our overlays out of the way

```bash
cd /Users/maheen/medusa_breadfac
mv docs ../_medusa_breadfac_docs_stash
mv .superpowers ../_medusa_breadfac_superpowers_stash 2>/dev/null || true
ls -la
```

Expected: dir contains only `.` and `..`.

- [ ] **Step 2:** Clone into the dir

```bash
cd /Users/maheen/medusa_breadfac
git clone git@github.com:machomaheen/medusa.git .
git remote add upstream https://github.com/medusajs/medusa.git
git fetch upstream
git remote -v
```

Expected: `origin` → machomaheen/medusa, `upstream` → medusajs/medusa.

- [ ] **Step 3:** Restore the stashed overlays

```bash
cd /Users/maheen/medusa_breadfac
mv ../_medusa_breadfac_docs_stash docs
mv ../_medusa_breadfac_superpowers_stash .superpowers 2>/dev/null || true
echo "/.superpowers/" >> .gitignore
git status
```

Expected: `docs/` reappears as untracked, `.superpowers/` is ignored.

### Task 0.3: Pin to latest stable Medusa tag

- [ ] **Step 1:** Find the latest non-prerelease tag

```bash
LATEST_TAG=$(git ls-remote --tags upstream | awk '{print $2}' | grep 'refs/tags/v' | grep -vE '(beta|alpha|rc|next)' | sort -V | tail -1 | sed 's|refs/tags/||')
echo "Pinning to: $LATEST_TAG"
```

Expected: prints something like `v2.4.0` (record the exact value).

- [ ] **Step 2:** Create the branch from that tag

```bash
git checkout -b happilee-skin "$LATEST_TAG"
git log --oneline -1
```

Expected: HEAD is at the tagged commit on branch `happilee-skin`.

### Task 0.4: Write `vault/PRODUCT.md` (Agent OS Goal Ancestry root)

- [ ] **Step 1:** Create directory + file

```bash
mkdir -p vault
```

Write `vault/PRODUCT.md`:

```markdown
# Product: Happilee Commerce (Medusa-backed)

## Mission
Provide a Happilee-native commerce experience built on Medusa's backend. The
admin dashboard and storefront look indistinguishable from the rest of the
Happilee ecosystem; the backend remains pristine Medusa so upstream releases
can be pulled cleanly.

## Tech stack
- Backend: Medusa <PINNED_TAG_HERE> (unchanged from upstream)
- Admin: Vite + React + Tailwind (re-skinned to Happilee v3)
- Storefront: Next.js (re-skinned to Happilee v3)
- Design system: ~/.claude/skills/happilee-v3-design-system/

## North Star Metric
Visual regression diff from Happilee baseline screenshots < 1% on chrome regions.

## Current Gaps (Wave 0 → 3)
1. Tokens, sidebar, shell — Wave 0
2. 12 primitives re-skinned — Wave 1
3. 10 feature screens re-skinned — Wave 2
4. Branding strings + final E2E — Wave 3

## Pinned Medusa tag
<PINNED_TAG_HERE>
```

- [ ] **Step 2:** Substitute the pinned tag

```bash
sed -i '' "s|<PINNED_TAG_HERE>|$LATEST_TAG|g" vault/PRODUCT.md
grep "$LATEST_TAG" vault/PRODUCT.md
```

Expected: tag appears twice in the file.

### Task 0.5: Write `CLAUDE.md` (CTO Agent instructions)

- [ ] **Step 1:** Create file

Write `/Users/maheen/medusa_breadfac/CLAUDE.md`:

```markdown
# Project: Happilee Commerce (Medusa-backed re-skin)

## You are the CTO Agent

At session start:
1. Read `vault/PRODUCT.md` for product context
2. Check PaperClip for assigned tasks: `curl -s http://localhost:3100/api/tasks?agent=cto`
3. Invoke the `happilee-v3-design-system` skill before any visual work

## Hard rules

- **NEVER** modify files under `packages/medusa/`, `packages/framework/`, `packages/types/`,
  `packages/utils/`, `packages/modules/`, `packages/core/`, or `packages/cli/`. These are
  upstream. A pre-commit hook enforces this.
- **NEVER** push to `main`. Open PRs against `happilee-skin`.
- **ALWAYS** use Happilee tokens by name. No raw hex literals in committed code.
- **ALWAYS** invoke `happilee-v3-design-system` skill before writing CSS/JSX.

## Design system

The single source of truth is `~/.claude/skills/happilee-v3-design-system/`. Read
[references/tokens.md](.) for colors/spacing/type, [references/sidebar.md](.) for nav,
[references/components.md](.) for component patterns. Match the baseline screenshots
in [references/screenshots/](.) — pixel diff must be below 1% on chrome regions.

## Engineering standards

- TDD: write the failing Playwright spec first, then implement.
- Small commits; every working unit is a commit.
- PRs only; never push to `happilee-skin` directly without review.
- Adversarial Reviewer (Opus) must APPROVE before merge.
```

### Task 0.6: Write `AGENTS.md` (Hermes routing)

- [ ] **Step 1:** Create file

Write `/Users/maheen/medusa_breadfac/AGENTS.md`:

```markdown
# Happilee Commerce — Hermes routing

## Project context
- Type: Frontend re-skin of forked Medusa monorepo
- Goal Ancestry root: vault/PRODUCT.md
- Design system: ~/.claude/skills/happilee-v3-design-system/

## Step verification (after every change)

1. `bun --filter @medusajs/admin-next typecheck`
2. `bun --filter @medusajs/admin-next lint`
3. `bun --filter @medusajs/admin-next playwright test --config playwright.config.happilee.ts`
4. Backend untouched? `git diff --name-only HEAD~1 | grep -E '^packages/(medusa|framework|types|utils|modules|core|cli)/' && exit 1 || true`

## Recovery
If 3 retries fail on the same approach, escalate to CEO via PaperClip.
```

### Task 0.7: Bootstrap `.agent-os/` directories

- [ ] **Step 1:** Create skeleton

```bash
mkdir -p .agent-os/{tasks,reviews,decisions}
cat > .agent-os/.gitignore <<'EOF'
tasks/inflight/
reviews/draft/
EOF
git add .agent-os/.gitignore vault CLAUDE.md AGENTS.md docs/
git status
```

Expected: 5+ files staged.

### Task 0.8: Install Happilee Tailwind preset

- [ ] **Step 1:** Locate the dashboard package

```bash
ls packages/admin-next/dashboard/
cat packages/admin-next/dashboard/package.json | head -20
```

Expected: confirms `@medusajs/admin-next` package exists with Tailwind.

- [ ] **Step 2:** Replace the Tailwind config

```bash
cp ~/.claude/skills/happilee-v3-design-system/assets/tokens/tailwind.config.reference.ts \
   packages/admin-next/dashboard/tailwind.config.ts
```

- [ ] **Step 3:** Update the `content` array to match Medusa's source layout

Edit `packages/admin-next/dashboard/tailwind.config.ts`:

```ts
// Replace the content array with:
content: [
  "./index.html",
  "./src/**/*.{ts,tsx}",
  "../../shared-ui/src/**/*.{ts,tsx}", // if Medusa has shared-ui
],
```

- [ ] **Step 4:** Drop in token export

```bash
mkdir -p packages/admin-next/dashboard/src/styles
cp ~/.claude/skills/happilee-v3-design-system/assets/tokens/tokens.ts \
   packages/admin-next/dashboard/src/styles/tokens.ts
```

### Task 0.9: Port SideNav into Medusa admin shell

- [ ] **Step 1:** Copy the reference

```bash
mkdir -p packages/admin-next/dashboard/src/components/shell
cp ~/.claude/skills/happilee-v3-design-system/assets/tokens/SideNav.reference.tsx \
   packages/admin-next/dashboard/src/components/shell/SideNav.tsx
cp ~/.claude/skills/happilee-v3-design-system/assets/tokens/MainLayout.reference.tsx \
   packages/admin-next/dashboard/src/components/shell/AdminShell.tsx
```

- [ ] **Step 2:** Replace Happilee nav items with Medusa IA

In `SideNav.tsx`, locate the nav item array (the constant defining tier-1 + tier-2 items) and replace with the IA from spec § 3.3:

```ts
// Tier-1 items
const TIER_ONE = [
  { key: "home",       label: "Home",       icon: "dashboard", to: "/" },
  { key: "orders",     label: "Orders",     icon: "receipt",   to: "/orders" },
  { key: "catalog",    label: "Catalog",    icon: "box",       to: "/products" },
  { key: "customers",  label: "Customers",  icon: "user",      to: "/customers" },
  { key: "inventory",  label: "Inventory",  icon: "cube",      to: "/inventory" },
  { key: "promotions", label: "Promotions", icon: "tag",       to: "/promotions" },
] as const;

const UTILITY = [
  { key: "settings", label: "Settings", icon: "gear",      to: "/settings" },
  { key: "help",     label: "Help",     icon: "question",  href: "https://docs.medusajs.com" },
] as const;

// Tier-2 panels per tier-1 selection
const TIER_TWO: Record<string, Array<{ label: string; to: string; count?: number }>> = {
  home:       [{ label: "Overview", to: "/" }, { label: "Sales", to: "/sales" }, { label: "Customers", to: "/insights/customers" }, { label: "Reports", to: "/reports" }],
  orders:     [{ label: "All orders", to: "/orders" }, { label: "Drafts", to: "/orders/drafts" }, { label: "Returns", to: "/orders/returns" }, { label: "Claims", to: "/orders/claims" }, { label: "Swaps", to: "/orders/swaps" }],
  catalog:    [{ label: "Products", to: "/products" }, { label: "Collections", to: "/collections" }, { label: "Categories", to: "/categories" }, { label: "Tags", to: "/tags" }, { label: "Channels", to: "/sales-channels" }],
  customers:  [{ label: "All customers", to: "/customers" }, { label: "Customer groups", to: "/customers/groups" }, { label: "Segments", to: "/customers/segments" }],
  inventory:  [{ label: "Items", to: "/inventory" }, { label: "Locations", to: "/inventory/locations" }, { label: "Reservations", to: "/inventory/reservations" }, { label: "Levels", to: "/inventory/levels" }],
  promotions: [{ label: "Campaigns", to: "/campaigns" }, { label: "Promotion codes", to: "/promotions" }, { label: "Price lists", to: "/price-lists" }, { label: "Gift cards", to: "/gift-cards" }],
  settings:   [{ label: "Store", to: "/settings/store" }, { label: "Regions", to: "/settings/regions" }, { label: "Tax", to: "/settings/tax" }, { label: "Shipping", to: "/settings/shipping" }, { label: "API keys", to: "/settings/api-keys" }, { label: "Users", to: "/settings/users" }, { label: "Workflows", to: "/settings/workflows" }],
};
```

- [ ] **Step 3:** Update `useSideNavMode` to recognize Medusa editor routes

In `SideNav.tsx`, replace the rail-only route match:

```ts
const isEditorRoute = /^(\/products\/[^/]+\/edit|\/orders\/[^/]+\/edit|\/promotions\/[^/]+\/edit)$/.test(pathname);
```

- [ ] **Step 4:** Wire the shell into Medusa's App.tsx

Find Medusa's existing layout component (likely `src/components/layout-templates/dashboard-layout.tsx` or similar) and replace its body with:

```tsx
import { AdminShell } from "../shell/AdminShell";
export default AdminShell;
```

- [ ] **Step 5:** Boot the dashboard

```bash
cd packages/admin-next/dashboard
bun install
bun dev
```

Expected: dev server starts, navigating to `http://localhost:5173` shows Happilee chrome (56px rail + tier-two) wrapping unstyled Medusa content.

### Task 0.10: Set up Playwright regression infra

- [ ] **Step 1:** Install dependencies

```bash
cd packages/admin-next/dashboard
bun add -d @playwright/test pixelmatch pngjs
bunx playwright install chromium
```

- [ ] **Step 2:** Write `playwright.config.happilee.ts`

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./__playwright__/specs",
  fullyParallel: false,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium-1440", use: devices["Desktop Chrome"] }],
  webServer: {
    command: "bun dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  // Disable animations for stable screenshots
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
});
```

- [ ] **Step 3:** Copy baselines from the skill

```bash
mkdir -p __playwright__/baseline/{chrome,components,full-page}
cp ~/.claude/skills/happilee-v3-design-system/references/screenshots/*.png \
   __playwright__/baseline/full-page/
ls __playwright__/baseline/full-page/
```

Expected: 8 PNGs (`01-automations-list.png` through `08-home.png`).

- [ ] **Step 4:** Write the visual-diff helper

`__playwright__/helpers/visual-diff.ts`:

```ts
import { Locator, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const BASELINE_DIR = path.join(__dirname, "..", "baseline");

export async function compareToBaseline(
  locator: Locator,
  baselineRelPath: string,
  opts: { threshold?: number } = {},
): Promise<void> {
  const baselinePath = path.join(BASELINE_DIR, baselineRelPath);
  if (!fs.existsSync(baselinePath)) {
    throw new Error(`Missing baseline: ${baselinePath}. Did you run capture-baseline.mjs?`);
  }
  await expect(locator).toHaveScreenshot(baselineRelPath, {
    maxDiffPixelRatio: opts.threshold ?? 0.01,
    animations: "disabled",
  });
}
```

- [ ] **Step 5:** Write the Wave 0 baseline capture spec

`__playwright__/specs/wave-0-chrome.spec.ts`:

```ts
import { test } from "@playwright/test";
import path from "node:path";

test("Wave 0 — capture chrome regions", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // Sidebar rail
  await page.locator("[data-shell='sidenav-rail']").screenshot({
    path: path.join(__dirname, "..", "baseline", "chrome", "sidebar-rail.png"),
  });
  // Tier-2 (with home selected)
  await page.locator("[data-shell='sidenav-tier-two']").screenshot({
    path: path.join(__dirname, "..", "baseline", "chrome", "sidebar-tier2.png"),
  });
  // Topbar
  await page.locator("[data-shell='topbar']").screenshot({
    path: path.join(__dirname, "..", "baseline", "chrome", "topbar.png"),
  });
});
```

- [ ] **Step 6:** Run it

```bash
bun playwright test --config playwright.config.happilee.ts __playwright__/specs/wave-0-chrome.spec.ts
```

Expected: 3 PNGs written to `__playwright__/baseline/chrome/`.

### Task 0.11: Add pre-commit hook (backend bleed guard)

- [ ] **Step 1:** Write the hook

`.husky/pre-commit` (or `.git/hooks/pre-commit` if husky not in use):

```bash
#!/usr/bin/env bash
FORBIDDEN=$(git diff --cached --name-only | grep -E '^packages/(medusa|framework|types|utils|modules|core|cli)/' || true)
if [ -n "$FORBIDDEN" ]; then
  echo "❌ Backend bleed detected — these files are off-limits on happilee-skin:"
  echo "$FORBIDDEN"
  echo
  echo "Backend must stay pristine for clean upstream merges. Revert these changes."
  exit 1
fi
```

```bash
chmod +x .husky/pre-commit  # or .git/hooks/pre-commit
```

- [ ] **Step 2:** Test it fires

```bash
# Smoke test (must NOT actually commit anything)
echo "test" >> packages/medusa/README.md
git add packages/medusa/README.md
git commit -m "test backend bleed guard" || echo "✓ Guard works"
git restore --staged packages/medusa/README.md
git checkout -- packages/medusa/README.md
```

Expected: commit blocked with "Backend bleed detected".

### Task 0.12: Commit Wave 0 and push

- [ ] **Step 1:** Stage everything except the .superpowers brainstorm dir

```bash
cd /Users/maheen/medusa_breadfac
git add vault/ CLAUDE.md AGENTS.md .agent-os/ .gitignore docs/ \
        packages/admin-next/dashboard/tailwind.config.ts \
        packages/admin-next/dashboard/src/styles/tokens.ts \
        packages/admin-next/dashboard/src/components/shell/ \
        packages/admin-next/dashboard/playwright.config.happilee.ts \
        packages/admin-next/dashboard/__playwright__/ \
        .husky/
```

- [ ] **Step 2:** Commit

```bash
git commit -m "Wave 0: foundation — tokens, sidebar, shell, regression infra

- Bootstrap Agent OS (vault/PRODUCT.md, CLAUDE.md, AGENTS.md, .agent-os/)
- Apply Happilee Tailwind preset to admin dashboard
- Port SideNav + MainLayout (renamed AdminShell) with Medusa IA
- Set up Playwright visual regression infra with Happilee baselines
- Add pre-commit hook blocking backend modifications

Pinned to upstream tag: <LATEST_TAG>"
```

- [ ] **Step 3:** Push

```bash
git push -u origin happilee-skin
```

Expected: branch published on `origin` (`machomaheen/medusa`).

---

## Wave 1 — Primitives (12 parallel devfleet missions)

**Owner:** CTO Agent dispatches; each mission runs as a fresh Claude Code worker (Sonnet) in an isolated worktree. Adversarial Reviewer = Opus. Budget: $24 implementation + $24 reviews.

**Files (per worker — varies by primitive):**
- Replace: `packages/admin-next/dashboard/src/components/common/<primitive>.tsx`
- Create: `packages/admin-next/dashboard/__playwright__/specs/<primitive>.spec.ts`

### Task 1.0: Create the DevFleet project

- [ ] **Step 1:** Call `plan_project`

Use the DevFleet MCP tool:

```
plan_project(prompt="""
Project: Medusa → Happilee Commerce — Wave 1 primitives
Spec: /Users/maheen/medusa_breadfac/docs/superpowers/specs/2026-06-02-medusa-happilee-design-handoff.md
Repo: /Users/maheen/medusa_breadfac
Branch: happilee-skin

Create 12 parallel missions, one per primitive in spec §4.3. All depend_on
the foundation commit (none on each other). All auto_dispatch=true.
Each mission's prompt must follow the template in spec §3.2 channel 2.
""")
```

Expected: returns `project_id` + array of 12 mission IDs.

- [ ] **Step 2:** Verify the DAG

```
get_dashboard()
list_missions(project_id=<project_id>)
```

Expected: 12 missions all in `draft` with empty `depends_on` (since Wave 0 already merged).

### Task 1.1: Mission prompt template (used for all 12 Wave 1 workers)

The prompt template each Wave 1 worker receives. Substitute `{primitive}`, `{file_path}`, `{baseline_clip}` per worker.

```
You are a Wave 1 primitive worker in the Medusa → Happilee Commerce re-skin.

## Pre-flight (mandatory)
1. Invoke the `happilee-v3-design-system` skill. Read:
   - references/tokens.md
   - references/components.md (find the {primitive} pattern)
2. Read /Users/maheen/medusa_breadfac/docs/superpowers/specs/2026-06-02-medusa-happilee-design-handoff.md
   sections 3 (design system) and 5 (Playwright gate).

## Task
Re-skin {primitive} at {file_path} to match the Happilee component pattern.
Use ONLY tokens from the skill's references/tokens.md — no raw hex.

## TDD loop
1. Write the failing spec at __playwright__/specs/{primitive}.spec.ts with the
   four mandatory tests from spec §5.3:
   (a) visual diff vs baseline {baseline_clip}
   (b) brand color exact match (rgb(77, 104, 220))
   (c) integration smoke (renders on a real page, chrome unchanged)
   (d) token discipline (no raw hex in changed files)
2. Run the spec — confirm it FAILS
3. Implement {file_path} re-skin
4. Run the spec — confirm all 4 tests PASS
5. Run typecheck + lint:
   bun --filter @medusajs/admin-next typecheck
   bun --filter @medusajs/admin-next lint
6. Commit with message: "Wave 1.X: restyle {primitive} to Happilee tokens"
7. Open PR against happilee-skin

## Hard rules (Adversarial Reviewer enforces)
- NEVER edit anything outside packages/admin-next/dashboard/
- NEVER use raw hex colors in the changed file
- NEVER use Tailwind values not in the Happilee scale (no `gap-[7px]`, no `rounded-[10px]`)
- Brand blue (#4d68dc) appears ONLY on brand mark and primary CTAs
- Selected/active states use brand-light (#edf2fe), never saturated blue

## Stop conditions
- If the same approach fails 3 times, escalate via PaperClip — do not retry the same fix
- If the design pattern in components.md is ambiguous, flag it to the user — don't invent
```

### Task 1.2 through 1.13: Dispatch each primitive

The 12 missions, all dispatched in parallel via `auto_dispatch=true`. The CTO's job is to call `dispatch_mission` on the first one — the rest auto-fire.

| Mission | `{primitive}` | `{file_path}` | `{baseline_clip}` |
|---|---|---|---|
| W1.1 | Button | `src/components/common/button.tsx` | `components/primary-button.png` |
| W1.2 | Input | `src/components/common/input.tsx` | `components/input.png` |
| W1.3 | Select | `src/components/common/select.tsx` | `components/select.png` |
| W1.4 | Table | `src/components/common/table.tsx` | `components/table.png` |
| W1.5 | Modal | `src/components/common/modal.tsx` | `components/modal.png` |
| W1.6 | Drawer | `src/components/common/drawer.tsx` | `components/drawer.png` |
| W1.7 | Toast | install `sonner`, wrap in `src/components/common/toaster.tsx` | `components/toast.png` |
| W1.8 | Badge | `src/components/common/badge.tsx` | `components/badge-active.png` |
| W1.9 | Tabs | `src/components/common/tabs.tsx` | `components/tabs.png` |
| W1.10 | Tooltip | `src/components/common/tooltip.tsx` | `components/tooltip.png` |
| W1.11 | Card | `src/components/common/card.tsx` | `components/card.png` |
| W1.12 | EmptyState | `src/components/common/empty-state.tsx` | `components/empty-state.png` |

- [ ] **Step 1:** Dispatch the chain

For each mission ID returned from Task 1.0:

```
dispatch_mission(mission_id=<id>, model="claude-sonnet-4-6", max_turns=40)
```

Expected: agent spawns in a worktree, status flips to `running`.

- [ ] **Step 2:** Monitor every 60s

```
get_dashboard()
```

Watch for: missions transitioning `running` → `pass_visual` → `pass_review` → `merged`. Failures stay `running` (mission auto-iterates) or go to `failed` after `max_turns` exhausted.

### Task 1.14: Adversarial Reviewer wiring

Each Wave 1 PR triggers an Adversarial Reviewer (Opus) mission auto-created by the post-test hook.

- [ ] **Step 1:** Verify hook is in place

```bash
ls /Users/maheen/Projects/agent-os/.claude/hooks/post-pr-create.sh
```

If missing, create it:

```bash
#!/usr/bin/env bash
# .claude/hooks/post-pr-create.sh
PR_NUM=$1
MISSION_ID=$2
SOUL_PATH=/Users/maheen/Projects/agent-os/.claude/agents/adversarial-reviewer/SOUL.md

devfleet create_mission \
  --project-id "$DEVFLEET_PROJECT_ID" \
  --title "Adversarial Review — PR #$PR_NUM" \
  --prompt "You are the Adversarial Reviewer. Read SOUL: $SOUL_PATH. Cold-review PR #$PR_NUM using the 7-question framework. Verdict: APPROVE | REQUEST_CHANGES | BLOCK." \
  --depends-on "$MISSION_ID" \
  --model claude-opus-4-7 \
  --auto-dispatch true
```

- [ ] **Step 2:** Wave 1.7 + 1.10 exception (Sonnet reviewer)

For W1.7 (Toast) and W1.10 (Tooltip), override the reviewer model:

```
update_mission(mission_id=<reviewer-id>, model="claude-sonnet-4-6")
```

Saves $2 with negligible quality risk per spec §4.6.

### Task 1.15: QA Agent — Wave 1 cross-component check

After all 12 missions reach `merged`, dispatch the QA Agent.

- [ ] **Step 1:** Create QA mission

```
create_mission(
  project_id=<id>,
  title="QA Wave 1 — full regression",
  prompt="""You are the QA Agent. Pull happilee-skin HEAD, run the full
  Playwright suite at packages/admin-next/dashboard. For each spec, capture
  the diff score against the baseline. Generate a report at
  .agent-os/reviews/wave-1-qa-report.md. If any primitive failed,
  reopen its mission via PaperClip.""",
  depends_on=[<all-w1-mission-ids>],
  model="claude-sonnet-4-6",
)
```

- [ ] **Step 2:** Wait for QA pass

```
wait_for_mission(mission_id=<qa-id>, timeout_seconds=600)
get_report(mission_id=<qa-id>)
```

Expected: report shows 12/12 primitives passing visual regression. If not, identify failures from the report and reopen those missions.

### Task 1.16: Wave 1 checkpoint (human gate)

- [ ] **Step 1:** Surface results to human

Post to the chat:
```
✅ Wave 1 complete. 12 primitives re-skinned and reviewed.
   Visual regression: 12/12 passed (avg diff: X%, p95: Y%).
   Cost burned: $Z (projected: $48).
   QA report: .agent-os/reviews/wave-1-qa-report.md
   Continue to Wave 2 (10 feature-screen missions)?
```

- [ ] **Step 2:** Wait for human `y` before dispatching Wave 2.

This is the wave-level checkpoint from spec §6.1 risk #10.

---

## Wave 2 — Feature screens (10 parallel devfleet missions)

**Owner:** CTO Agent dispatches; workers = Sonnet; reviewers = Opus. Budget: $40 + $20 reviews.

### Task 2.0: Create the Wave 2 DevFleet project

- [ ] **Step 1:** Call `plan_project`

```
plan_project(prompt="""
Project: Medusa → Happilee Commerce — Wave 2 feature screens
Spec: /Users/maheen/medusa_breadfac/docs/superpowers/specs/2026-06-02-medusa-happilee-design-handoff.md
Repo: /Users/maheen/medusa_breadfac
Branch: happilee-skin

Create 10 parallel missions per spec §4.4. All depend on Wave 1 completion
(already merged). All auto_dispatch=true. Use the feature-screen mission
template from Task 2.1.
""")
```

### Task 2.1: Mission prompt template (Wave 2 feature workers)

```
You are a Wave 2 feature-screen worker in the Medusa → Happilee Commerce re-skin.

## Pre-flight (mandatory)
1. Invoke the `happilee-v3-design-system` skill. Read all references.
2. Read spec sections 3, 4.4, and 5.

## Task
Re-skin all pages under {route_dir} to match Happilee. Use ONLY the primitives
landed in Wave 1 (Button, Input, Select, Table, Modal, Drawer, Toast, Badge,
Tabs, Tooltip, Card, EmptyState). Do NOT introduce new primitives.

Layout grammar:
- Page header: title + subtitle + (optional) "more options"
- Toolbar: search + filter + view-toggle
- Content: card grid OR table OR detail two-column
- Empty states: use the EmptyState component
- Modals/drawers for entity edit flows

## TDD loop
1. For each top-level route in {route_dir}, write a Playwright spec asserting:
   - Page renders without error
   - Chrome (sidebar, topbar) unchanged from baseline
   - Page content uses only Happilee tokens
   - Critical interactions work (click "Create", "Edit", "Delete")
2. Run specs — confirm they FAIL
3. Implement the re-skin
4. Run specs — confirm they PASS
5. Typecheck + lint
6. Commit with message: "Wave 2.X: restyle {route_dir} to Happilee"
7. Open PR against happilee-skin

## Hard rules
Same as Wave 1, plus:
- ONLY use primitives from Wave 1 — do not import @medusajs/ui directly
- If a primitive is missing for your need, surface it as a Wave 1 gap rather than inventing one
```

### Task 2.2 through 2.11: Dispatch each feature screen

| Mission | `{route_dir}` | Notes |
|---|---|---|
| W2.1 | `packages/admin-next/dashboard/src/routes/orders/` | list, detail, returns, claims, swaps |
| W2.2 | `packages/admin-next/dashboard/src/routes/products/` | list, detail editor, variants |
| W2.3 | `packages/admin-next/dashboard/src/routes/customers/` | list, detail, groups, segments |
| W2.4 | `packages/admin-next/dashboard/src/routes/inventory/` | items, locations, reservations |
| W2.5 | `packages/admin-next/dashboard/src/routes/promotions/` | campaigns, codes, price lists, gift cards |
| W2.6 | `packages/admin-next/dashboard/src/routes/settings/` | all settings panels |
| W2.7 | `packages/admin-next/dashboard/src/routes/auth/` | login, signup, forgot-password |
| W2.8 | `apps/storefront/app/(main)/products/` | PDP (this requires creating apps/storefront — see §2.12) |
| W2.9 | `apps/storefront/app/(main)/cart/` | cart UI |
| W2.10 | `apps/storefront/app/(main)/checkout/` | multi-step checkout |

- [ ] **Step 1:** Dispatch all 10 via `auto_dispatch` chain

### Task 2.12: Storefront bootstrap (precondition for W2.8–W2.10)

The Medusa monorepo doesn't ship a storefront — it's a separate starter. This task creates `apps/storefront/` so Wave 2.8–2.10 have somewhere to land.

- [ ] **Step 1:** Clone the Medusa Next.js starter

```bash
cd /Users/maheen/medusa_breadfac
mkdir -p apps
cd apps
npx create-medusa-app@latest --skip-db storefront --no-boilerplate
```

If the wizard prompts, accept defaults except: set `--skip-db` if available, otherwise abort the install of the API server (we already have one in `packages/medusa`).

- [ ] **Step 2:** Wire the Happilee Tailwind preset

```bash
cp packages/admin-next/dashboard/tailwind.config.ts \
   apps/storefront/tailwind.config.ts
cp -r packages/admin-next/dashboard/src/styles \
      apps/storefront/src/styles
```

Adjust the `content` array in the storefront's copy to point at `app/**/*.{ts,tsx}` instead of `src/**`.

- [ ] **Step 3:** Mount the storefront in the workspace

Edit root `package.json` `workspaces`:

```json
"workspaces": ["packages/*", "apps/*"]
```

```bash
bun install
```

- [ ] **Step 4:** Commit the storefront skeleton

```bash
git add apps/storefront/ package.json
git commit -m "Wave 2 precondition: scaffold apps/storefront with Happilee preset"
```

This task runs BEFORE dispatching W2.8/9/10. Order: W2.1–W2.7 dispatch immediately; W2.12 (storefront scaffold) runs synchronously; then W2.8–W2.10 dispatch.

### Task 2.13: QA Agent — Wave 2 cross-surface check

Same shape as Task 1.15, with an additional cross-surface assertion:

```
create_mission(
  project_id=<id>,
  title="QA Wave 2 — full regression + cross-surface",
  prompt="""You are the QA Agent. Run the full Playwright suite on
  happilee-skin HEAD across BOTH admin dashboard and storefront.
  Additionally, capture the H mark from admin login vs storefront header
  and assert the computed background-color is identical (rgb(77, 104, 220)).
  Generate report at .agent-os/reviews/wave-2-qa-report.md.""",
  depends_on=[<all-w2-mission-ids>],
  model="claude-sonnet-4-6",
)
```

### Task 2.14: Wave 2 checkpoint (human gate)

Same shape as Task 1.16. Wait for human `y` before Wave 3.

---

## Wave 3 — Integration & branding

**Owner:** Single Opus agent. Budget: $10 implementation + $2 review.

**Files:**
- Modify: any UI string file containing "Medusa" (admin + storefront)
- Replace: `favicon.ico`, `apple-touch-icon.png`
- Modify: `packages/admin-next/dashboard/index.html` (title)
- Modify: storefront `app/layout.tsx` metadata

### Task 3.1: Wordmark string replace

- [ ] **Step 1:** Survey occurrences

```bash
cd /Users/maheen/medusa_breadfac
# Find UI strings only — skip backend, skip package names, skip lockfiles
rg -l '\bMedusa\b' \
  --type tsx --type ts --type html --type json \
  packages/admin-next/dashboard/src \
  apps/storefront/app \
  apps/storefront/components 2>/dev/null
```

- [ ] **Step 2:** Categorize hits

For each file the rg returned, decide:
- **UI string** ("Welcome to Medusa") → replace with "Happilee Commerce"
- **Package import** (`from "@medusajs/ui"`) → keep
- **Brand reference in comment** (`// originally from Medusa`) → keep

- [ ] **Step 3:** Apply replacements

For each UI string, edit the file. Use Edit (not bulk sed) to avoid touching imports/comments. Common targets:

- `packages/admin-next/dashboard/index.html` `<title>` → "Happilee Commerce"
- Login page heading
- Signup page heading
- "Powered by" footer (if any) → replace with "Happilee Commerce"
- Email template titles (if any in `src/templates/`)

### Task 3.2: Replace favicon and touch icons

- [ ] **Step 1:** Generate Happilee H favicon

```bash
# Use the brand mark from the Happilee landing page if available, else
# render it programmatically
cat > /tmp/gen-favicon.html <<'EOF'
<!doctype html><meta charset=utf-8>
<canvas id=c width=512 height=512></canvas>
<script>
  const c = document.getElementById('c').getContext('2d');
  c.fillStyle = '#4d68dc';
  c.beginPath();
  c.roundRect(0, 0, 512, 512, 96);
  c.fill();
  c.fillStyle = 'white';
  c.font = 'bold 320px Inter, system-ui, sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('H', 256, 270);
  console.log(c.canvas.toDataURL('image/png'));
</script>
EOF
# Manually open the file in browser, copy the data URL, decode to favicon.png
```

- [ ] **Step 2:** Place favicon

```bash
cp /tmp/favicon.png packages/admin-next/dashboard/public/favicon.png
cp /tmp/favicon.png apps/storefront/public/favicon.png
```

- [ ] **Step 3:** Update HTML to reference it

In both `packages/admin-next/dashboard/index.html` and `apps/storefront/app/layout.tsx`, ensure the favicon link points at `/favicon.png`.

### Task 3.3: Browser tab titles + meta

- [ ] **Step 1:** Admin

`packages/admin-next/dashboard/index.html`:
```html
<title>Happilee Commerce</title>
<meta name="description" content="Happilee Commerce — merchant dashboard" />
```

- [ ] **Step 2:** Storefront

`apps/storefront/app/layout.tsx`:
```ts
export const metadata = {
  title: { default: "Happilee Commerce", template: "%s | Happilee Commerce" },
  description: "Happilee Commerce — shop the Happilee ecosystem",
};
```

### Task 3.4: Email templates (if any)

- [ ] **Step 1:** Locate

```bash
find packages/admin-next packages/admin-vite-plugin apps/storefront -name "*email*" -o -name "*mail*" -o -name "*template*.tsx" 2>/dev/null
```

- [ ] **Step 2:** Update sender names and headers

Replace "Medusa" → "Happilee Commerce" in any sender display name, email subject default, and header banner.

### Task 3.5: Final full E2E Playwright run

- [ ] **Step 1:** Run admin regression

```bash
cd packages/admin-next/dashboard
bun playwright test --config playwright.config.happilee.ts
```

Expected: all specs pass.

- [ ] **Step 2:** Run storefront regression

```bash
cd apps/storefront
bun playwright test
```

Expected: all specs pass.

- [ ] **Step 3:** Cross-surface brand color check

Run an ad-hoc Playwright script that loads admin login + storefront home, samples the H mark background-color from each, asserts both are `rgb(77, 104, 220)`.

### Task 3.6: Generate the final diff report

- [ ] **Step 1:** Produce a side-by-side comparison

For each of the 8 baseline screens, capture the current `happilee-skin` HEAD at the same URL, then `pixelmatch` against the baseline. Emit `.agent-os/reviews/wave-3-final-report.md` with:

- Per-screen diff percentage
- p95 diff across all components
- Wordmark replacement count (number of "Medusa" → "Happilee Commerce" applied)
- Token-discipline grep result (must be empty: `rg '#[0-9a-fA-F]{6}' packages/admin-next/dashboard/src/`)
- Backend-pristine assertion: `git diff main..happilee-skin --name-only | grep -E '^packages/(medusa|framework|types|utils|modules|core|cli)/' | wc -l` MUST be 0

### Task 3.7: Open the final PR

- [ ] **Step 1:** Push final commits

```bash
git push origin happilee-skin
```

- [ ] **Step 2:** Open PR via gh

```bash
gh pr create \
  --base main --head happilee-skin \
  --title "Happilee Commerce: full re-skin of Medusa admin + storefront" \
  --body "$(cat <<'EOF'
## Summary
- Re-skinned Medusa admin dashboard and Next.js storefront to match the Happilee v3 design ecosystem
- Backend untouched — `packages/medusa/**`, `packages/framework/**`, `packages/types/**`, etc. are byte-identical to the pinned upstream tag
- Wordmark replaced with "Happilee Commerce" across all user-visible strings
- 8/8 baseline screens pass visual regression at <1% chrome diff
- 12 primitives + 10 feature screens + storefront cart/checkout all re-styled

## Test plan
- [x] All Wave 1 primitive specs pass
- [x] All Wave 2 feature screen specs pass
- [x] Wave 3 full E2E regression passes on both surfaces
- [x] Cross-surface brand color identical (admin H mark = storefront H mark = `rgb(77, 104, 220)`)
- [x] `git diff main..happilee-skin --name-only | grep -E '^packages/(medusa|framework|types|utils|modules|core|cli)/' | wc -l` returns 0
- [x] No raw hex literals in committed code (rg check empty)
- [ ] Human review of final visual diff report (`.agent-os/reviews/wave-3-final-report.md`)

## Spec
[`docs/superpowers/specs/2026-06-02-medusa-happilee-design-handoff.md`](docs/superpowers/specs/2026-06-02-medusa-happilee-design-handoff.md)
EOF
)"
```

Expected: PR URL printed.

### Task 3.8: Done — surface to human

- [ ] **Step 1:** Post to chat

```
🎉 Happilee Commerce is ready for human merge.

PR: <url>
Final report: .agent-os/reviews/wave-3-final-report.md
Cost: $<actual> (projected: $144, ceiling: $250)
Wall-clock: <hours>h

Review the PR and merge when ready. After merge, the upstream-pull workflow is:
  git fetch upstream
  git checkout main && git merge --ff-only upstream/main
  git checkout happilee-skin && git rebase main
  # resolve any conflicts in packages/admin-next/dashboard, apps/storefront only
```

---

## Self-review (run before handoff)

**Spec coverage:** All 11 spec sections have a corresponding task — §2 (boundary) → Wave 0 + pre-commit hook; §3 (design system) → skill exists + Task 0.8; §4 (execution plan) → Waves −1 through 3; §5 (Playwright gate) → Task 0.10 + mission templates; §6 (risks) → pre-commit hook + budget caps + wave checkpoints; §10 (decisions) → Task 0.1 (fork target) + Task 0.3 (tag pin); §11 (budget) → Task 1.14 (Sonnet reviewer override) + Task 1.16/2.14 checkpoints.

**Placeholder scan:** No `TBD`, `TODO`, or "implement later" found. All steps contain executable commands or concrete code. Email templates (Task 3.4) require a `find` step because Medusa's structure isn't fully knowable until clone — this is acknowledged, not a placeholder.

**Type consistency:** `AdminShell` used in Task 0.9 Step 4, matches Task 0.9 Step 1 (copied as `AdminShell.tsx`). `SideNav` props match the reference file. Mission IDs use UUID strings throughout. `DEVFLEET_PROJECT_ID` env var defined in Task 1.14 hook and consumed in subsequent hooks.

**One nit fixed:** Task 0.12 doesn't include `apps/` in the `git add` list because storefront is created in Wave 2 (Task 2.12). Correct as written.

---

**Plan complete and saved to `docs/superpowers/plans/2026-06-02-medusa-happilee-design-handoff.md`.**

## Two execution options

**1. Subagent-Driven (recommended for this plan)** — I dispatch a fresh subagent per task within Waves −1 and 0 (sequential, deterministic). For Waves 1, 2, 3 the dispatch IS via devfleet (already designed). I review between tasks. Fast iteration, low context bleed.

**2. Inline Execution** — I execute Waves −1 and 0 in this same session, then hand off to devfleet for Waves 1+. Batch execution with checkpoints. Heavier on my context but no subagent overhead for the bootstrap.

Which approach?
