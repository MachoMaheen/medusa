/**
 * Playwright configuration for Happilee Commerce visual regression.
 *
 * Workers run this to verify their re-skin matches the Happilee v3 baselines
 * extracted from localhost:3000 and bundled in the design-system skill.
 *
 * First-time setup (the first Wave 1 worker runs):
 *   yarn workspace @medusajs/dashboard add -D @playwright/test pixelmatch pngjs
 *   yarn workspace @medusajs/dashboard playwright install chromium
 *
 * Run a spec:
 *   yarn workspace @medusajs/dashboard playwright test --config playwright.config.happilee.ts __playwright__/specs/<name>.spec.ts
 */

import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./__playwright__/specs",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "./playwright-report", open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
    // Force animations off so screenshots are deterministic across runs.
    launchOptions: {
      args: ["--force-prefers-reduced-motion"],
    },
  },
  projects: [{ name: "chromium-1440", use: { ...devices["Desktop Chrome"] } }],
  // Workers should run `yarn dev` separately; Playwright doesn't manage the
  // dev server here because Medusa's dev server has a long boot time and is
  // shared across multiple specs in a session.
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
      caret: "hide",
    },
  },
})
