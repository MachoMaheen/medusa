/**
 * SettingTile — a Happilee-skinned launcher card for a single settings panel.
 *
 * Used exclusively by the Settings home grid (`/settings`). Built on top of
 * the Wave 1.11 HappileeCard primitive so every visual property (radius,
 * shadow, hover lift, padding) resolves through the canonical token map:
 *   .agent-os/decisions/2026-06-02-canonical-token-map.md
 *
 * Visual contract (composed from the Happilee "automation card" pattern):
 *   - frame:    HappileeCard, `interactive` (cursor-pointer + shadow lift)
 *   - top row:  48x48 brand-light icon tile + title + meta line
 *   - tag pill: persistent brand-light pill (top-right) when `tag` provided
 *
 * Why HappileeCard (instead of @medusajs/ui Container): the Settings tier-2
 * pattern in references/components.md is identical to the automation-card
 * surface — same 12px radius, 12px padding, hap-xs shadow. Re-using the
 * primitive keeps a single visual contract across the suite.
 *
 * NOTE on icon tile background: per ADR-001, a persistent identity surface
 * uses `bg-brand-light` (the Happilee tier-2 calm tint). Selected row/cell
 * states would use `bg-ui-bg-highlight`. The tile background is the icon's
 * *identity*, so `bg-brand-light` is correct here.
 */

import * as React from "react"
import { Link } from "react-router-dom"
import { clx } from "@medusajs/ui"

import HappileeCard from "../../../../components/common/happilee-card/happilee-card"

export interface SettingTileProps {
  /** Destination route — e.g. `/settings/store`. Required. */
  to: string
  /** Short label, sentence case (e.g. "Store"). */
  title: string
  /** One-line description, sentence case, no trailing period. */
  description: string
  /**
   * 24x24 Medusa icon. Rendered at full size inside a 40x40 brand-light tile.
   * Pass the icon component itself (e.g. `<Buildings />`), NOT a JSX fragment.
   */
  icon: React.ReactNode
  /** Optional persistent tag rendered as a brand-light pill (e.g. "Developer"). */
  tag?: string
}

/**
 * Single settings tile — anchors a sub-panel destination.
 *
 * Renders as a forwarded `<button>`-shaped HappileeCard wrapped in a
 * `react-router` Link so keyboard activation (Enter / Space via the link's
 * default behavior + role=button) and screen-reader semantics both work.
 */
export const SettingTile = ({
  to,
  title,
  description,
  icon,
  tag,
}: SettingTileProps) => {
  return (
    <Link
      to={to}
      // Tile is the whole link target. Block stretches the link to fill its
      // grid cell; rounded-xl matches HappileeCard's radius so the focus ring
      // hugs the visible card.
      className={clx(
        "group block rounded-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-solid/30"
      )}
      data-happilee-setting-tile=""
    >
      <HappileeCard interactive as="div" className="h-full">
        <HappileeCard.Header
          badge={
            <div
              data-happilee-setting-tile-icon=""
              className={clx(
                // 40x40 brand-light surface — identity, not a selected state,
                // so brand-light is correct per ADR-001.
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                "bg-brand-light text-brand-secondary-text"
              )}
              aria-hidden="true"
            >
              {icon}
            </div>
          }
          actions={
            tag ? (
              <span
                data-happilee-setting-tile-tag=""
                className={clx(
                  // Pill — bg-brand-light + text-brand-secondary-text per
                  // ADR-001 ("tag / category pill" row).
                  "inline-flex items-center rounded-full px-2 py-0.5",
                  "bg-brand-light text-brand-secondary-text",
                  "text-xs font-medium leading-4"
                )}
              >
                {tag}
              </span>
            ) : undefined
          }
        />
        <HappileeCard.Title level={3}>{title}</HappileeCard.Title>
        <HappileeCard.Meta>{description}</HappileeCard.Meta>
      </HappileeCard>
    </Link>
  )
}

SettingTile.displayName = "SettingTile"
