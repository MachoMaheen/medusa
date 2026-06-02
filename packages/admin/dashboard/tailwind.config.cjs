const path = require("path")

// get the path of the dependency "@medusajs/ui"
const medusaUI = path.join(
  path.dirname(require.resolve("@medusajs/ui")),
  "**/*.{js,jsx,ts,tsx}"
)

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@medusajs/ui-preset")],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", medusaUI],
  darkMode: "class",
  theme: {
    extend: {
      // Happilee v3 design system overlay — additive only, never overrides
      // Medusa's preset. Source: happilee-v3-design-system skill, tokens.md.
      colors: {
        brand: {
          solid: "#4d68dc",
          light: "#edf2fe",
          "secondary-fg": "#5d7bf1",
          "secondary-text": "#4158bd",
          "primary-icon": "#93adfe",
        },
        text: {
          primary: "#181d27",
          secondary: "#414651",
          tertiary: "#535862",
          quaternary: "#717680",
        },
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
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "hap-xs": "0 1px 2px 0 rgba(0,0,0,0.05)",
        "hap-sm": "0 1px 2px 0 rgba(0,0,0,0.1)",
        "hap-md":
          "0 2px 4px -2px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.1)",
        "hap-lg":
          "0 2px 2px -1px rgba(0,0,0,0.04), 0 4px 6px -2px rgba(0,0,0,0.03), 0 12px 16px -4px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        md: "8px",
        xl: "12px",
      },
      transitionDuration: {
        "hap-fast": "100ms",
        "hap-normal": "200ms",
        "hap-slow": "300ms",
      },
      backdropBlur: {
        "hap-md": "16px",
        "hap-lg": "24px",
      },
    },
  },
  plugins: [],
}
