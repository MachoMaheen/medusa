const path = require("path")

// get the path of the dependency "@medusajs/ui"
const medusaUI = path.join(
  path.dirname(require.resolve("@medusajs/ui")),
  "**/*.{js,jsx,ts,tsx}"
)

/**
 * Happilee Commerce — Tailwind config
 *
 * Extends Medusa's @medusajs/ui-preset with Happilee v3 tokens (brand colors,
 * sidebar widths, custom radii, Inter-only family). The base preset still
 * provides all the `bg-ui-*`, `text-ui-*` utility classes that Medusa's
 * components depend on; we only ADD on top.
 *
 * Color variable overrides live in src/styles/happilee-tokens.css.
 * Source of truth: ~/.claude/skills/happilee-v3-design-system/
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@medusajs/ui-preset")],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", medusaUI],
  // Disable dark mode — Happilee v3 is light-only.
  darkMode: "class",
  theme: {
    extend: {
      // ── Happilee brand colors (additive to Medusa's preset) ────────────
      colors: {
        brand: {
          solid: "#4d68dc",            // Primary CTA, brand mark — non-negotiable
          "secondary-fg": "#5d7bf1",   // Hover on brand surfaces
          "secondary-text": "#4158bd", // Text on brand-light backgrounds
          "primary-icon": "#93adfe",   // Tinted icons inside brand surfaces
          light: "#edf2fe",            // Selected nav fill, calm active state
        },
        // Happilee text-color palette — exposed as both fg color and as
        // background (e.g. dark tooltip surface uses `bg-text-primary`).
        // Source: ~/.claude/skills/happilee-v3-design-system/references/tokens.md
        text: {
          primary: "#181d27",          // Headings, primary copy, dark tooltip bg
          secondary: "#414651",        // Secondary copy
          tertiary: "#535862",         // Tertiary copy
          quaternary: "#717680",       // Muted/placeholder
        },
        // Happilee status badge palette (exact values from skill tokens.md)
        "hap-status": {
          "active-bg": "#f0fdf4",
          "active-border": "#bbf7d0",
          "active-text": "#15803d",
          "draft-bg": "#f8fafc",
          "draft-border": "#e2e8f0",
          "draft-text": "#334155",
          "paused-bg": "#fffbeb",
          "paused-border": "#fde68a",
          "paused-text": "#b45309",
        },
      },
      // ── Sidebar geometry (referenced by AdminShell port) ──────────────
      width: {
        "rail": "56px",         // Tier-1 rail width (Happilee structural)
        "tier-two": "224px",    // Tier-2 panel width
      },
      spacing: {
        "rail": "56px",
        "tier-two": "224px",
        "shell-full": "280px",  // rail + tier-two
      },
      // ── Inter font family stack ────────────────────────────────────────
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      // ── Happilee shadow tokens ─────────────────────────────────────────
      boxShadow: {
        "hap-xs": "0 1px 2px 0 #0000000d",
        "hap-xs-skeuomorphic":
          "0 1px 2px 0 #0000000d, inset 0 -2px 0 0 #0000000d, inset 0 0 0 1px #00000026",
        "hap-sm": "0 1px 2px 0 #0000001a",
        "hap-md": "0 2px 4px -2px #0000000f, 0 4px 6px -1px #0000001a",
        "hap-lg": "0 2px 2px -1px #0000000a, 0 4px 6px -2px #00000008, 0 12px 16px -4px #00000014",
      },
      // ── Backdrop blurs (modal/popover overlays) ────────────────────────
      backdropBlur: {
        "hap-md": "16px",
        "hap-lg": "24px",
      },
      // ── Animation durations ────────────────────────────────────────────
      transitionDuration: {
        "hap-fast": "100ms",
        "hap-normal": "200ms",
        "hap-slow": "300ms",
      },
    },
  },
  plugins: [],
}
