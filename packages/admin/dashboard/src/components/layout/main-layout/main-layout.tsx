/**
 * MainLayout — Happilee shell (Wave 0 port).
 *
 * Renders the Happilee 56px rail + 224px tier-two expandable panel
 * instead of Medusa's stock 240px text sidebar. Keeps Medusa's IA
 * (Orders / Products / Inventory / Customers / Promotions / Price lists)
 * and routing model intact; only the visual chrome is re-skinned.
 *
 * Three responsive states (matches happilee-v3-design-system spec):
 *   - viewport >= 1024px → full SideNav (rail + tier-two)
 *   - viewport <  1024px → rail-only (56px)
 *   - viewport <  640px  → SideNav hidden, content full-width (mobile uses Shell's drawer)
 *
 * Source of truth for visual tokens:
 *   ~/.claude/skills/happilee-v3-design-system/references/{sidebar.md,tokens.md}
 *   ~/.claude/skills/happilee-v3-design-system/assets/tokens/SideNav.reference.tsx
 *
 * All Tailwind classes route through the Medusa preset (ui-*) per
 * .agent-os/decisions/2026-06-02-canonical-token-map.md.
 */

import {
  Buildings,
  CogSixTooth,
  CurrencyDollar,
  EllipsisHorizontal,
  House,
  MagnifyingGlass,
  QuestionMarkCircle,
  ReceiptPercent,
  ShoppingCart,
  Tag,
  Users,
} from "@medusajs/icons"
import { Avatar, DropdownMenu, Text, Tooltip, clx } from "@medusajs/ui"
import { ComponentType, ReactElement, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, NavLink, useLocation } from "react-router-dom"

import { useStore } from "../../../hooks/api/store"
import { useDocumentDirection } from "../../../hooks/use-document-direction"
import { useSearch } from "../../../providers/search-provider"
import { Skeleton } from "../../common/skeleton"
import { Shell } from "../shell"
import { UserMenu } from "../user-menu"

// ── Nav model ─────────────────────────────────────────────────────────────
// Mirrors useCoreRoutes from the previous Medusa sidebar, but adds the
// implicit "Home" tier-1 entry and re-maps to Happilee's tier-2 model.

type TierTwoItem = {
  label: string
  to: string
}

type Tier1Item = {
  key: string
  label: string
  icon: ComponentType
  to: string
  /** When set, hovering/selecting this rail item opens the tier-two panel
   * with these children. */
  tierTwo?: TierTwoItem[]
}

function useTier1Items(): Tier1Item[] {
  const { t } = useTranslation()

  return [
    {
      key: "home",
      label: "Home",
      icon: House,
      to: "/",
    },
    {
      key: "orders",
      label: t("orders.domain"),
      icon: ShoppingCart,
      to: "/orders",
      tierTwo: [
        { label: t("orders.domain"), to: "/orders" },
        // Draft orders / Returns / Claims are future work — leave a single entry
        // for now so the tier-two panel still renders sensibly.
      ],
    },
    {
      key: "products",
      label: t("products.domain"),
      icon: Tag,
      to: "/products",
      tierTwo: [
        { label: t("products.domain"), to: "/products" },
        { label: t("collections.domain"), to: "/collections" },
        { label: t("categories.domain"), to: "/categories" },
      ],
    },
    {
      key: "inventory",
      label: t("inventory.domain"),
      icon: Buildings,
      to: "/inventory",
      tierTwo: [
        { label: t("inventory.domain"), to: "/inventory" },
        { label: t("reservations.domain"), to: "/reservations" },
      ],
    },
    {
      key: "customers",
      label: t("customers.domain"),
      icon: Users,
      to: "/customers",
      tierTwo: [
        { label: t("customers.domain"), to: "/customers" },
        { label: t("customerGroups.domain"), to: "/customer-groups" },
      ],
    },
    {
      key: "promotions",
      label: t("promotions.domain"),
      icon: ReceiptPercent,
      to: "/promotions",
      tierTwo: [
        { label: t("promotions.domain"), to: "/promotions" },
        { label: t("campaigns.domain"), to: "/campaigns" },
      ],
    },
    {
      key: "price-lists",
      label: t("priceLists.domain"),
      icon: CurrencyDollar,
      to: "/price-lists",
    },
  ]
}

// ── Responsive mode hook ──────────────────────────────────────────────────
type SideNavMode = "hidden" | "rail-only" | "full"

function useSideNavMode(): SideNavMode {
  const [mode, setMode] = useState<SideNavMode>(() => {
    if (typeof window === "undefined") return "full"
    if (window.innerWidth < 640) return "hidden"
    if (window.innerWidth < 1024) return "rail-only"
    return "full"
  })

  useEffect(() => {
    function onResize() {
      const w = window.innerWidth
      if (w < 640) setMode("hidden")
      else if (w < 1024) setMode("rail-only")
      else setMode("full")
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  return mode
}

// ── Workspace switcher (top of tier-two panel) ────────────────────────────
function WorkspaceSwitcher() {
  const { t } = useTranslation()
  const { store, isPending, isError, error } = useStore()
  const direction = useDocumentDirection()
  const name = store?.name
  const fallback = name?.slice(0, 1).toUpperCase()
  const isLoaded = !isPending && !!store && !!name && !!fallback

  if (isError) {
    throw error
  }

  return (
    <div className="w-full px-3 pt-3">
      <DropdownMenu dir={direction}>
        <DropdownMenu.Trigger
          disabled={!isLoaded}
          className={clx(
            "bg-ui-bg-base transition-fg grid w-full grid-cols-[24px_1fr_15px] items-center gap-x-3 rounded-md p-1 pe-2 outline-none",
            "hover:bg-ui-bg-subtle-hover",
            "data-[state=open]:bg-ui-bg-subtle-hover",
            "focus-visible:shadow-borders-focus"
          )}
        >
          {fallback ? (
            <Avatar variant="squared" size="xsmall" fallback={fallback} />
          ) : (
            <Skeleton className="h-6 w-6 rounded-md" />
          )}
          <div className="block overflow-hidden text-start">
            {name ? (
              <Text
                size="small"
                weight="plus"
                leading="compact"
                className="text-ui-fg-base truncate"
              >
                {name}
              </Text>
            ) : (
              <Skeleton className="h-[9px] w-[120px]" />
            )}
          </div>
          <EllipsisHorizontal className="text-ui-fg-muted" />
        </DropdownMenu.Trigger>
        {isLoaded && (
          <DropdownMenu.Content className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0">
            <div className="flex items-center gap-x-3 px-2 py-1">
              <Avatar variant="squared" size="small" fallback={fallback} />
              <div className="flex flex-col overflow-hidden">
                <Text
                  size="small"
                  weight="plus"
                  leading="compact"
                  className="text-ui-fg-base truncate"
                >
                  {name}
                </Text>
                <Text
                  size="xsmall"
                  leading="compact"
                  className="text-ui-fg-muted"
                >
                  {t("app.nav.main.store")}
                </Text>
              </div>
            </div>
            <DropdownMenu.Separator />
            <DropdownMenu.Item asChild>
              <Link to="/settings/store" className="gap-x-2">
                <CogSixTooth className="text-ui-fg-subtle" />
                {t("app.nav.main.storeSettings")}
              </Link>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        )}
      </DropdownMenu>
    </div>
  )
}

// ── Tier-1 rail icon button ───────────────────────────────────────────────
type RailIconButtonProps = {
  label: string
  icon: ComponentType
  to?: string
  selected?: boolean
  onClick?: () => void
  ariaPressed?: boolean
}

function RailIconButton({
  label,
  icon: Icon,
  to,
  selected,
  onClick,
  ariaPressed,
}: RailIconButtonProps) {
  const classes = clx(
    "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
    "text-ui-fg-muted hover:bg-ui-bg-subtle-hover hover:text-ui-fg-subtle",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-solid/40",
    {
      "bg-ui-bg-highlight text-brand-secondary-text hover:bg-ui-bg-highlight":
        selected,
    }
  )

  const content = (
    <span className={classes} aria-pressed={ariaPressed}>
      <Icon />
    </span>
  )

  return (
    <Tooltip content={label} side="right">
      {to ? (
        <NavLink to={to} className="outline-none" aria-label={label}>
          {content}
        </NavLink>
      ) : (
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          className="outline-none"
        >
          {content}
        </button>
      )}
    </Tooltip>
  )
}

// ── Brand mark (40px brand-solid square with H) ──────────────────────────
function BrandMark() {
  return (
    <Link
      to="/"
      aria-label="Happilee"
      className="bg-brand-solid shadow-hap-xs hover:bg-brand-secondary-text flex h-10 w-10 items-center justify-center rounded-xl font-sans text-base font-semibold text-white transition-colors"
    >
      H
    </Link>
  )
}

// ── Account button (user menu trigger styled as rail icon) ───────────────
function AccountRailButton() {
  // The existing UserMenu component provides the avatar + dropdown content,
  // but it ships with its own surrounding padding. We render it inline and
  // let its dropdown trigger sit naturally inside the bottom rail group.
  return (
    <div className="-mx-2 flex w-12 items-center justify-center [&>div]:p-0 [&_button]:bg-transparent [&_button]:p-0">
      <UserMenu />
    </div>
  )
}

// ── Tier-2 row ────────────────────────────────────────────────────────────
function TierTwoRow({ label, to }: TierTwoItem) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        clx(
          "relative flex h-9 items-center rounded-md px-3 text-sm transition-colors",
          "text-ui-fg-subtle hover:bg-ui-bg-subtle-hover hover:text-ui-fg-base",
          {
            "bg-ui-bg-highlight text-brand-secondary-text font-medium hover:bg-ui-bg-highlight":
              isActive,
          }
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="bg-brand-solid absolute inset-y-1.5 left-0 w-0.5 rounded-r" />
          )}
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  )
}

// ── Search trigger (cmd+K) ────────────────────────────────────────────────
function SearchRailButton() {
  const { t } = useTranslation()
  const { toggleSearch } = useSearch()
  return (
    <RailIconButton
      label={t("app.search.label")}
      icon={MagnifyingGlass}
      onClick={() => toggleSearch()}
    />
  )
}

// ── The Happilee SideNav (Medusa-bound) ───────────────────────────────────
function HappileeSideNav() {
  const { t } = useTranslation()
  const location = useLocation()
  const mode = useSideNavMode()
  const tier1Items = useTier1Items()

  // Determine which tier-1 is "active" based on the current URL segment.
  // We match on the first path segment AND on any tier-two child whose path
  // starts with `/<firstSegment>`. This keeps nested resource routes like
  // `/products/abc/edit` or `/customer-groups/xyz` highlighting the right
  // tier-1 entry.
  const firstSegment = location.pathname.split("/").filter(Boolean)[0] ?? ""
  const segmentPrefix = firstSegment ? `/${firstSegment}` : "/"
  const activeTier1 =
    tier1Items.find((item) => {
      if (item.to === "/") return firstSegment === ""
      if (item.to === segmentPrefix) return true
      return (
        item.tierTwo?.some(
          (c) => c.to === segmentPrefix || c.to.startsWith(`${segmentPrefix}/`)
        ) ?? false
      )
    }) ?? tier1Items[0]

  // Tier-two panel is shown only at >= 1024px (full mode). At <= 1023px we
  // collapse to the 56px rail.
  //
  // Note: we no longer short-circuit to `null` for `mode === "hidden"`. The
  // Shell wraps this same SideNav inside the mobile <RadixDialog> drawer, so
  // returning null leaves mobile users with an empty drawer. Instead we keep
  // rendering the rail (the desktop `hidden sm:block` wrapper still hides it
  // outside the drawer at < 640px) and let the drawer host the same rail UI.
  const isFull = mode === "full"
  const showTierTwo = isFull && !!activeTier1.tierTwo?.length

  return (
    <div className="flex h-full">
      {/* Tier-1 rail — 56px white column */}
      <aside
        className={clx(
          "bg-ui-bg-base border-ui-border-menu-bot flex h-full w-14 flex-col items-center border-r py-3",
          "font-sans"
        )}
        aria-label="Primary navigation"
      >
        {/* Brand mark + workspace anchor */}
        <BrandMark />

        {/* Primary nav stack */}
        <nav className="mt-4 flex flex-col items-center gap-y-1">
          <SearchRailButton />
          {tier1Items.map((item) => (
            <RailIconButton
              key={item.key}
              label={item.label}
              icon={item.icon}
              to={item.to}
              selected={activeTier1.key === item.key}
            />
          ))}
        </nav>

        {/* Bottom utility group */}
        <div className="mt-auto flex flex-col items-center gap-y-1">
          <RailIconButton
            label={t("app.nav.settings.header")}
            icon={CogSixTooth}
            to="/settings"
            selected={firstSegment === "settings"}
          />
          <RailIconButton
            label={t("app.menus.user.documentation")}
            icon={QuestionMarkCircle}
            onClick={() =>
              window.open("https://docs.medusajs.com", "_blank", "noopener")
            }
          />
          <AccountRailButton />
        </div>
      </aside>

      {/* Tier-2 expandable panel — 224px white column */}
      {showTierTwo && (
        <aside
          className={clx(
            "bg-ui-bg-base border-ui-border-menu-bot hidden h-full w-56 flex-col border-r font-sans lg:flex"
          )}
          aria-label={`${activeTier1.label} navigation`}
        >
          <WorkspaceSwitcher />

          <div className="mt-3 flex flex-1 flex-col overflow-y-auto px-3 pb-3">
            <Text
              size="xsmall"
              weight="plus"
              leading="compact"
              className="text-ui-fg-muted mb-1 px-3 pt-1 uppercase tracking-wide"
            >
              {activeTier1.label}
            </Text>
            <nav className="flex flex-col gap-y-0.5">
              {activeTier1.tierTwo!.map((item) => (
                <TierTwoRow key={item.to} {...item} />
              ))}
            </nav>
          </div>

          {/* Tier-2 footer: persistent Settings link (mirrors Happilee v3) */}
          <div className="border-ui-border-menu-bot border-t px-3 py-2">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                clx(
                  "flex h-9 items-center gap-x-2 rounded-md px-3 text-sm",
                  "text-ui-fg-subtle hover:bg-ui-bg-subtle-hover hover:text-ui-fg-base",
                  {
                    "bg-ui-bg-highlight text-brand-secondary-text font-medium":
                      isActive,
                  }
                )
              }
            >
              <CogSixTooth />
              <span>{t("app.nav.settings.header")}</span>
            </NavLink>
          </div>
        </aside>
      )}
    </div>
  )
}

// ── Public component ──────────────────────────────────────────────────────
export const MainLayout = (): ReactElement => {
  return <Shell sidebar={<HappileeSideNav />} />
}

// Backwards-compat: some callers may import the inner sidebar piece.
export const MainSidebar = HappileeSideNav
