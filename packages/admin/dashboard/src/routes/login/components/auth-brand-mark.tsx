/**
 * AuthBrandMark — Happilee Commerce auth-screen brand mark (Wave 2.7)
 *
 * 56×56 rounded square in `bg-brand-solid` (#4d68dc) with a white "H" mark
 * centered inside. Used at the top of every auth card (login, reset-password,
 * invite) per branding decision §10 of the design handoff spec
 * (`docs/superpowers/specs/2026-06-02-medusa-happilee-design-handoff.md`).
 *
 * Token discipline:
 *   - surface     bg-brand-solid              → Happilee #4d68dc (locked)
 *   - radius      rounded-xl                  → Happilee xl (12px)
 *   - shadow      shadow-hap-xs-skeuomorphic  → matches primary CTA chrome
 *   - glyph       Inter font-semibold, white, scaled via 56px square
 *
 * No raw hex literals — every color resolves to a Tailwind token wired up in
 * `tailwind.config.cjs` and pinned to Happilee values in
 * `src/styles/happilee-tokens.css`.
 *
 * The glyph is rendered as text rather than an SVG so it inherits Inter from
 * the app shell (avoids needing a font-family override and keeps the brand mark
 * legible at every zoom). A future iteration may swap to a proper logo SVG.
 */

import * as React from "react"
import { clx } from "@medusajs/ui"

interface AuthBrandMarkProps {
  /**
   * Optional class overrides. Default sizing (56×56) and visual treatment
   * should be sufficient for every auth screen, but consumers can scale via
   * className if needed (e.g. a tighter MFA card variant).
   */
  className?: string
}

export const AuthBrandMark: React.FC<AuthBrandMarkProps> = ({ className }) => {
  return (
    <div
      data-happilee-brand-mark=""
      role="img"
      aria-label="Happilee Commerce"
      className={clx(
        "flex h-14 w-14 items-center justify-center",
        "rounded-xl bg-brand-solid",
        "shadow-hap-xs-skeuomorphic",
        "select-none",
        className
      )}
    >
      <span
        className={clx(
          "font-sans font-semibold text-white",
          "text-3xl leading-none"
        )}
      >
        H
      </span>
    </div>
  )
}

export default AuthBrandMark
