# Happilee Commerce — Hermes Routing

> Drop priority: `.hermes.md` > `AGENTS.md` > `CLAUDE.md` > `.cursorrules`
> This file routes Hermes-spawned tasks. Direct human → Claude Code uses CLAUDE.md.

## Project context

- **Type:** Frontend re-skin of forked Medusa monorepo (`MachoMaheen/medusa`)
- **Goal Ancestry root:** [vault/PRODUCT.md](vault/PRODUCT.md)
- **Design system skill:** `~/.claude/skills/happilee-v3-design-system/` (mandatory load)

## Step verification (after every code change)

Required before commit:

```bash
# 1. Typecheck (dashboard only)
yarn workspace @medusajs/dashboard typecheck

# 2. Lint
yarn workspace @medusajs/dashboard lint

# 3. Playwright visual regression
yarn workspace @medusajs/dashboard playwright test --config playwright.config.happilee.ts

# 4. Backend bleed guard (must return 0)
git diff --cached --name-only | grep -E '^packages/(medusa|framework|types|utils|modules|core|cli)/' | wc -l
```

If any fails → fix before commit. The pre-commit hook enforces the backend bleed check.

## Mission template (Wave 1 + 2 workers)

Each devfleet worker (or Claude Code Agent spawned in lieu of devfleet) receives:

```
ROLE: You are a Wave {N} worker on the Medusa → Happilee Commerce re-skin.

PRE-FLIGHT (mandatory):
- Invoke the `happilee-v3-design-system` skill
- Read `references/tokens.md`, `references/components.md`, and `references/sidebar.md` (if touching nav)
- Read `vault/PRODUCT.md` for product context and pinned Medusa version

TASK: {specific task — re-skin component / route}

TDD:
1. Write failing Playwright spec(s)
2. Confirm fail
3. Implement
4. Confirm pass
5. Typecheck + lint
6. Commit + open PR

HARD RULES:
- Backend paths are off-limits (see CLAUDE.md)
- No raw hex literals
- No values outside Happilee scale
- All 4 mandatory tests present (visual diff, brand-color exact, integration smoke, token discipline)

STOP if same approach fails 3 times — surface to CEO/human.
```

## Recovery escalation

If a worker fails 3× with same approach, the supervising CTO Agent:
1. Reviews `.agent-os/reviews/<task>-recovery.md`
2. Either dispatches a different agent type, or pauses the wave and surfaces to human

## Inter-agent communication

PaperClip task report format (when PaperClip is online):

```json
{
  "task_id": "PP-XXX",
  "status": "completed|failed|blocked",
  "artifacts": ["PR #N", "playwright report path"],
  "decisions_made": ["used X primitive because Y"],
  "blockers": [],
  "next_steps": ["Adversarial Reviewer should cold-review PR #N"]
}
```

In absence of PaperClip, store reports under `.agent-os/reviews/wave-{N}-{task}.md`.
