/**
 * MainLayout — Happilee shell (Wave 0 port).
 *
 * Renders the Happilee 56px rail + 220px tier-two expandable panel
 * instead of Medusa's stock 240px text sidebar. Keeps Medusa's IA
 * (Orders / Catalog / Customers / Inventory / Promotions / Settings)
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
 *
 * Tier-2 IA mirrors spec § 3.3 of
 * docs/superpowers/specs/2026-06-02-medusa-happilee-design-handoff.md.
 * Routes that do not exist in Medusa v2.15.5 are pointed at the closest
 * available real route (e.g. `/orders/drafts` → `/draft-orders`).
 */

import {
  Buildings,
  CogSixTooth,
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
import debounce from "lodash.debounce"
import {
  ComponentType,
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useTranslation } from "react-i18next"
import { Link, NavLink, useLocation } from "react-router-dom"

import { PermissionGuard } from "../../common/permission-guard"
import { useStore } from "../../../hooks/api/store"
import { useDocumentDirection } from "../../../hooks/use-document-direction"
import { useSearch } from "../../../providers/search-provider"
import { Skeleton } from "../../common/skeleton"
import { Shell } from "../shell"
import { UserMenu } from "../user-menu"

// ── Nav model ─────────────────────────────────────────────────────────────
// Mirrors spec § 3.3 IA mapping. Routes that have no real equivalent in
// Medusa v2.15.5 are pointed at the closest available route (see notes
// inline below). Future Medusa upgrades may add these routes; revisit then.

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

  // Memoize so unrelated parent re-renders (notification badge ticks,
  // workspace switcher fetch) don't churn every RailIconButton + TierTwoRow.
  // Addresses Option C review issue #16.
  return useMemo<Tier1Item[]>(
    () => [
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
          // Spec calls for "Drafts" — Medusa v2.15.5 does not expose a
          // top-level /draft-orders admin route (drafts live inside
          // /orders?status=draft). Pointing at that filter URL.
          { label: t("draftOrders.domain"), to: "/orders?status=draft" },
          // Spec calls for "Returns"; closest standalone route in v2.15.5
          // is the Return Reasons admin under settings — we surface it here
          // so the spec entry has a destination.
          { label: t("returnReasons.domain"), to: "/settings/return-reasons" },
          // Spec mentions "Claims" + "Swaps"; v2.15.5 ships neither as a
          // standalone tier-2 route. Both flow through the order detail view,
          // so we leave them out rather than fake a destination.
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
          // Spec calls for "Tags"; Medusa has product tags admin.
          { label: t("productTags.domain"), to: "/product-tags" },
          // Spec calls for "Channels"; Medusa calls this Sales Channels.
          { label: t("salesChannels.domain"), to: "/settings/sales-channels" },
        ],
      },
      {
        key: "inventory",
        label: t("inventory.domain"),
        icon: Buildings,
        to: "/inventory",
        tierTwo: [
          // Spec calls for "Items"; Medusa's items live at /inventory root.
          { label: t("inventory.domain"), to: "/inventory" },
          { label: t("locations.domain"), to: "/settings/locations" },
          { label: t("reservations.domain"), to: "/reservations" },
          // Spec calls for "Levels"; Medusa v2.15.5 surfaces stock levels
          // inside /inventory/:id/stock — no standalone /levels route exists,
          // so this is intentionally omitted rather than fabricated.
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
          // Spec calls for "Segments"; v2.15.5 has no /segments admin route.
          // Customer Groups is the closest semantic neighbor — leaving the
          // segments entry out keeps the nav honest.
        ],
      },
      {
        key: "promotions",
        label: t("promotions.domain"),
        icon: ReceiptPercent,
        to: "/promotions",
        tierTwo: [
          { label: t("campaigns.domain"), to: "/campaigns" },
          // Spec calls for "Codes"; in Medusa each promotion is itself a
          // code, so /promotions is the codes list.
          { label: t("promotions.domain"), to: "/promotions" },
          { label: t("priceLists.domain"), to: "/price-lists" },
          // Spec calls for "Gift cards"; v2.15.5 does not ship a /gift-cards
          // admin route. Intentionally omitted rather than faked.
        ],
      },
      // Price lists moved to Promotions per spec § 3.3 — no longer a separate
      // tier-1. The legacy `priceLists` slot is removed.
    ],
    [t]
  )
}

// Settings tier-2 model is rendered out of band (the rail's bottom Settings
// icon owns it). Spec § 3.3 children:
// Store · Regions · Tax · Shipping · API keys · Users · Workflows
//
// Notes on Medusa v2.15.5 reality vs spec:
//   - "Shipping" → /settings/locations (stock locations + shipping options
//     are co-located in v2.15.5; there is no top-level /settings/shipping
//     route).
//   - "API keys" → /settings/publishable-api-keys (the publishable list is
//     the default entry point; users navigate to secret keys from there).
//   - All other entries match real routes.
function useSettingsTierTwo(): TierTwoItem[] {
  const { t } = useTranslation()
  return useMemo<TierTwoItem[]>(
    () => [
      { label: t("store.domain"), to: "/settings/store" },
      { label: t("regions.domain"), to: "/settings/regions" },
      { label: t("taxRegions.domain"), to: "/settings/tax-regions" },
      // Spec "Shipping" — closest available route is locations (stock
      // locations + shipping options).
      { label: t("stockLocations.domain"), to: "/settings/locations" },
      {
        label: t("apiKeyManagement.domain.publishable"),
        to: "/settings/publishable-api-keys",
      },
      { label: t("users.domain"), to: "/settings/users" },
      { label: t("workflowExecutions.domain"), to: "/settings/workflows" },
    ],
    [t]
  )
}

// ── Responsive mode hook ──────────────────────────────────────────────────
type SideNavMode = "hidden" | "rail-only" | "full"

function computeMode(): SideNavMode {
  if (typeof window === "undefined") return "full"
  if (window.innerWidth < 640) return "hidden"
  if (window.innerWidth < 1024) return "rail-only"
  return "full"
}

function useSideNavMode(): SideNavMode {
  const [mode, setMode] = useState<SideNavMode>(() => computeMode())

  useEffect(() => {
    // Debounce so dragging the window edge doesn't fire hundreds of
    // setMode() calls per second (each one re-renders MainLayout's whole
    // subtree). Addresses Option C review issue #13.
    const onResize = debounce(() => {
      setMode(computeMode())
    }, 150)

    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      onResize.cancel()
    }
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

/**
 * PermissionGuard-wrapped workspace switcher. Mirrors the upstream Medusa
 * sidebar which gated the store name reveal behind `store:read`. Without
 * this, users without that permission see an unhandled query rejection
 * (see Option C review security finding).
 */
function GuardedWorkspaceSwitcher() {
  return (
    <PermissionGuard resource="store" operation="read">
      <WorkspaceSwitcher />
    </PermissionGuard>
  )
}

// ── Tier-1 rail icon button ───────────────────────────────────────────────
type RailIconButtonProps = {
  label: string
  icon: ComponentType
  to?: string
  /** Absolute URL — renders as a plain <a target="_blank" rel="noopener noreferrer">
   *  instead of a NavLink. Mutually exclusive with `to`. */
  href?: string
  selected?: boolean
  onClick?: () => void
}

function RailIconButton({
  label,
  icon: Icon,
  to,
  href,
  selected,
  onClick,
}: RailIconButtonProps) {
  const direction = useDocumentDirection()
  const tooltipSide = direction === "rtl" ? "left" : "right"

  const classes = clx(
    "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
    "text-ui-fg-muted hover:bg-ui-bg-subtle-hover hover:text-ui-fg-subtle",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-solid/40",
    {
      "bg-ui-bg-highlight text-brand-secondary-text hover:bg-ui-bg-highlight":
        selected,
    }
  )

  // Inner glyph carries no ARIA toggle state — the NavLink / button host
  // owns interaction semantics. Addresses Option C review issue #8.
  const content = (
    <span className={classes}>
      <Icon />
    </span>
  )

  let trigger: ReactElement
  if (to) {
    trigger = (
      <NavLink
        to={to}
        end={to === "/"}
        className="outline-none"
        aria-label={label}
        aria-current={selected ? "page" : undefined}
      >
        {content}
      </NavLink>
    )
  } else if (href) {
    // External link — open in new tab, no opener reference (avoids
    // reverse-tabnabbing). Addresses Option C review issue #19.
    trigger = (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="outline-none"
        aria-label={label}
      >
        {content}
      </a>
    )
  } else {
    trigger = (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={selected}
        className="outline-none"
      >
        {content}
      </button>
    )
  }

  return (
    <Tooltip content={label} side={tooltipSide}>
      {trigger}
    </Tooltip>
  )
}

// ── Brand mark (40px brand-solid square with H) ──────────────────────────
function BrandMark() {
  return (
    <Link
      to="/"
      aria-label="Happilee"
      data-testid="brand-mark"
      className="bg-brand-solid shadow-hap-xs hover:bg-brand-secondary-text flex h-10 w-10 items-center justify-center rounded-xl font-sans text-base font-semibold text-white transition-colors duration-150"
    >
      H
    </Link>
  )
}

// ── Account button (user menu trigger styled as rail icon) ───────────────
function AccountRailButton() {
  // UserMenu's UserBadge wraps the trigger in `<div className="p-3">`, and
  // user-menu.tsx pins DropdownMenu.Content width to
  // `--radix-dropdown-menu-trigger-width`. If we let the trigger render at
  // its natural width inside the 56px rail, the content menu collapses
  // (Option C review #2/#3).
  //
  // Fix: override the *content* width to a sane minimum via a Radix portal-
  // targeted selector. UserMenu's Content uses
  //   min-w-[var(--radix-dropdown-menu-trigger-width)]
  //   max-w-[var(--radix-dropdown-menu-trigger-width)]
  // both of which we beat with `!important` here, then we let the dropdown
  // size to its intrinsic content (`min-w-[240px]`).
  return (
    <div
      className={clx(
        "flex w-12 items-center justify-center",
        // Collapse the UserBadge's intrinsic p-3 down to zero so the avatar
        // sits flush with the other rail items. Selectors target every
        // descendant <div> as the UserBadge wrapper is two levels deep.
        "[&_.p-3]:!p-0",
        // Force the dropdown content portal to escape the 48px trigger.
        // Targets are matched in document order via a portalled `[role=menu]`
        // — handled separately by AccountMenuStyleOverride below.
        "[&_button]:bg-transparent [&_button]:p-0"
      )}
    >
      <UserMenu />
      <AccountMenuStyleOverride />
    </div>
  )
}

/**
 * UserMenu's Content is portalled outside this subtree; we cannot reach it
 * via descendant selectors. Inject a scoped <style> that forces its width
 * to at least 240px regardless of the trigger width. The style is global
 * but predicated on Radix's data attribute so it only affects portalled
 * dropdown menus — no collateral on other menus that legitimately want
 * trigger-width sizing because the override raises min-width, never reduces.
 */
function AccountMenuStyleOverride() {
  // Static stylesheet — keeps CSS-in-JSX out of the runtime hot path.
  return (
    <style>
      {`
        [data-radix-popper-content-wrapper] [role="menu"][data-side] {
          min-width: 240px !important;
          max-width: 320px !important;
        }
      `}
    </style>
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

// ── Active-tier matcher ───────────────────────────────────────────────────
function firstPathSegment(pathname: string): string {
  return pathname.split("/").filter(Boolean)[0] ?? ""
}

function matchActiveTier1(
  pathname: string,
  items: Tier1Item[]
): Tier1Item | null {
  const segment = firstPathSegment(pathname)
  const prefix = segment ? `/${segment}` : "/"

  // Home: exact root only.
  if (segment === "") {
    return items.find((item) => item.to === "/") ?? null
  }

  for (const item of items) {
    if (item.to === "/") continue
    if (item.to === prefix) return item
    if (
      item.tierTwo?.some(
        (c) => c.to === prefix || c.to.startsWith(`${prefix}/`)
      )
    ) {
      return item
    }
  }

  return null
}

// ── The Happilee SideNav (Medusa-bound) ───────────────────────────────────
function HappileeSideNav() {
  const { t } = useTranslation()
  const location = useLocation()
  const mode = useSideNavMode()
  const tier1Items = useTier1Items()
  const settingsTierTwo = useSettingsTierTwo()
  const direction = useDocumentDirection()

  // Active rail match — strict (no Home fallback for unknown routes).
  // `/draft-orders`, `/locations`, etc. now correctly resolve to their
  // tier-1 parent via the segment-prefix check; everything else returns
  // null so the rail shows a none-selected state. Addresses Option C
  // review issue #6.
  const activeTier1 = matchActiveTier1(location.pathname, tier1Items)
  const segment = firstPathSegment(location.pathname)
  const isSettings = segment === "settings"

  // Tier-two panel is shown only at >= 1024px (full mode). At <= 1023px we
  // collapse to the 56px rail.
  //
  // Note: we no longer short-circuit to `null` for `mode === "hidden"`. The
  // Shell wraps this same SideNav inside the mobile <RadixDialog> drawer, so
  // returning null leaves mobile users with an empty drawer. Instead we keep
  // rendering the rail (the desktop `hidden sm:block` wrapper still hides it
  // outside the drawer at < 640px) and let the drawer host the same rail UI.
  const isFull = mode === "full"

  // Pick the tier-two children to show. Settings owns its own tier-two
  // when its rail icon is selected; otherwise we defer to the matched
  // tier-1 entry. Returns null when nothing is selected (e.g. unmatched
  // extension route) so the panel hides cleanly.
  const tierTwoChildren: TierTwoItem[] | null = isSettings
    ? settingsTierTwo
    : activeTier1?.tierTwo ?? null
  const tierTwoLabel = isSettings
    ? t("app.nav.settings.header")
    : activeTier1?.label ?? ""
  const showTierTwo = isFull && !!tierTwoChildren?.length

  return (
    <div className="flex h-full" data-testid="happilee-sidenav">
      {/* Tier-1 rail — 56px white column */}
      <aside
        className={clx(
          "bg-ui-bg-base border-ui-border-menu-bot flex h-full w-14 flex-col items-center border-r py-3",
          "font-sans"
        )}
        aria-label="Primary navigation"
        dir={direction}
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
              selected={activeTier1?.key === item.key}
            />
          ))}
        </nav>

        {/* Bottom utility group */}
        <div className="mt-auto flex flex-col items-center gap-y-1">
          <RailIconButton
            label={t("app.nav.settings.header")}
            icon={CogSixTooth}
            to="/settings"
            selected={isSettings}
          />
          <RailIconButton
            label={t("app.menus.user.documentation")}
            icon={QuestionMarkCircle}
            // External link via plain <a target="_blank" rel="noopener noreferrer">
            // instead of window.open — preserves keyboard / middle-click /
            // RTL behavior. Addresses Option C review issues #19 + spec gap
            // (spec § 3.3 calls for Happilee docs, not Medusa docs).
            href="https://docs.happilee.io"
          />
          <AccountRailButton />
        </div>
      </aside>

      {/* Tier-2 expandable panel — 220px white column (spec § locked #4) */}
      {showTierTwo && (
        <aside
          className={clx(
            "bg-ui-bg-base border-ui-border-menu-bot hidden h-full w-[220px] flex-col border-r font-sans lg:flex"
          )}
          aria-label={`${tierTwoLabel} navigation`}
          data-testid="tier-two-panel"
        >
          <GuardedWorkspaceSwitcher />

          <div className="mt-3 flex flex-1 flex-col overflow-y-auto px-3 pb-3">
            <Text
              size="xsmall"
              weight="plus"
              leading="compact"
              className="text-ui-fg-muted mb-1 px-3 pt-1 uppercase tracking-wide"
            >
              {tierTwoLabel}
            </Text>
            <nav className="flex flex-col gap-y-0.5">
              {tierTwoChildren!.map((item) => (
                <TierTwoRow key={item.to} {...item} />
              ))}
            </nav>
          </div>

          {/* Tier-2 footer: Settings link only when we are NOT already in
            Settings (avoids the double-active highlight flagged in Option C
            review issue #18). */}
          {!isSettings && (
            <div className="border-ui-border-menu-bot border-t px-3 py-2">
              <NavLink
                to="/settings"
                className={clx(
                  "flex h-9 items-center gap-x-2 rounded-md px-3 text-sm",
                  "text-ui-fg-subtle hover:bg-ui-bg-subtle-hover hover:text-ui-fg-base"
                )}
              >
                <CogSixTooth />
                <span>{t("app.nav.settings.header")}</span>
              </NavLink>
            </div>
          )}
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

// Test exports — pure helpers used by Playwright + Jest specs.
export { firstPathSegment as __firstPathSegment }
export { matchActiveTier1 as __matchActiveTier1 }
