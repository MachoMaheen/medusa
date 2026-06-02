/**
 * Settings — Happilee-skinned settings landing.
 *
 * Wave 2.6 deliverable. Replaces the legacy `useEffect → navigate(/settings/store)`
 * redirect with a Happilee tile-grid launcher modeled on the Happilee Settings
 * panel pattern (skill: references/components.md → "Settings dashboard").
 *
 * Visual contract:
 *   - page bg                  bg-ui-bg-subtle (Happilee bg-secondary, from shell)
 *   - section header           text-xl text-ui-fg-base + text-sm text-ui-fg-muted
 *   - tile grid                CSS grid, 3 columns ≥ lg, 2 ≥ md, 1 < md, gap-4
 *   - section spacing          gap-y-10 between General / Store / Developer
 *
 * Tiles call into HappileeCard via SettingTile — every primitive used here is
 * a Wave 1 deliverable; no @medusajs/ui surface tokens are touched directly.
 *
 * IA note (spec § 3.3 IA mapping):
 *   - "General" groups self-account + workspace-store concerns (Profile, Store)
 *   - "Store" groups commerce concerns (Regions, Tax, Sales channels, etc.)
 *   - "Developer" groups dev concerns (API keys, Workflows)
 *
 * `Outlet` renders nested settings routes when present — so deep-linking
 * `/settings/store` still works (the Outlet replaces the grid).
 */

import {
  ArrowPath,
  BuildingTax,
  Buildings,
  Channels,
  CurrencyDollar,
  Globe,
  HandTruck,
  Key,
  MapPin,
  Tag,
  TruckFast,
  User,
  Users,
} from "@medusajs/icons"
import { useTranslation } from "react-i18next"
import { Outlet, useLocation } from "react-router-dom"
import { useMemo } from "react"

import { useFeatureFlag } from "../../providers/feature-flag-provider"
import { SettingTile } from "./components/setting-tile"

interface SettingTileSection {
  /** Section heading (e.g. "General", "Store", "Developer"). */
  heading: string
  /** Optional sub-text below the heading. */
  description?: string
  /** Tiles to render under this section. */
  tiles: ReadonlyArray<{
    to: string
    title: string
    description: string
    icon: React.ReactNode
    tag?: string
  }>
}

export const Settings = () => {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const isTranslationsEnabled = useFeatureFlag("translation")

  // When we're on a nested settings route, hand off to the Outlet so the
  // sub-panel takes over the content area. The grid only renders at exactly
  // `/settings`.
  const isHome = pathname === "/settings" || pathname === "/settings/"

  const sections: ReadonlyArray<SettingTileSection> = useMemo(
    () => [
      {
        heading: t("app.nav.settings.general", { defaultValue: "General" }),
        description: t("app.nav.settings.generalDescription", {
          defaultValue: "Personal account and workspace preferences.",
        }),
        tiles: [
          {
            to: "/settings/profile",
            title: t("profile.domain"),
            description: t("profile.manageYourProfileDetails", {
              defaultValue: "Manage your profile details and language.",
            }),
            icon: <User />,
          },
          {
            to: "/settings/store",
            title: t("store.domain"),
            description: t("store.subtitle", {
              defaultValue: "Workspace identity, currencies and locales.",
            }),
            icon: <Buildings />,
          },
          {
            to: "/settings/users",
            title: t("users.domain"),
            description: t("users.subtitle", {
              defaultValue: "Invite teammates and manage roles.",
            }),
            icon: <Users />,
          },
        ],
      },
      {
        heading: t("app.nav.settings.store", { defaultValue: "Store" }),
        description: t("app.nav.settings.storeDescription", {
          defaultValue:
            "Configure how customers experience your store across regions and channels.",
        }),
        tiles: [
          {
            to: "/settings/regions",
            title: t("regions.domain"),
            description: t("regions.subtitle", {
              defaultValue: "Currencies and countries you sell in.",
            }),
            icon: <Globe />,
          },
          {
            to: "/settings/tax-regions",
            title: t("taxRegions.domain"),
            description: t("taxRegions.domainDescription", {
              defaultValue: "Tax rates and overrides per region.",
            }),
            icon: <BuildingTax />,
          },
          {
            to: "/settings/sales-channels",
            title: t("salesChannels.domain"),
            description: t("salesChannels.subtitle", {
              defaultValue: "Surfaces where your products are sold.",
            }),
            icon: <Channels />,
          },
          {
            to: "/settings/locations",
            title: t("stockLocations.domain"),
            description: t("stockLocations.subtitle", {
              defaultValue: "Warehouses and pickup points.",
            }),
            icon: <MapPin />,
          },
          {
            to: "/settings/shipping-profiles",
            title: t("shippingProfile.domain", {
              defaultValue: "Shipping profiles",
            }),
            description: t("shippingProfile.subtitle", {
              defaultValue: "Group products by how they ship.",
            }),
            icon: <TruckFast />,
          },
          {
            to: "/settings/locations?tab=shipping-option-types",
            title: t("shippingOptionTypes.domain", {
              defaultValue: "Shipping option types",
            }),
            description: t("shippingOptionTypes.subtitle", {
              defaultValue: "Reusable shipping method categories.",
            }),
            icon: <HandTruck />,
          },
          {
            to: "/settings/return-reasons",
            title: t("returnReasons.domain"),
            description: t("returnReasons.subtitle", {
              defaultValue: "Labels you accept for return requests.",
            }),
            icon: <ArrowPath />,
          },
          {
            to: "/settings/refund-reasons",
            title: t("refundReasons.domain"),
            description: t("refundReasons.subtitle", {
              defaultValue: "Reasons you record when issuing refunds.",
            }),
            icon: <CurrencyDollar />,
          },
          {
            to: "/settings/product-types",
            title: t("productTypes.domain"),
            description: t("productTypes.subtitle", {
              defaultValue: "Categorize products by physical type.",
            }),
            icon: <Tag />,
          },
          {
            to: "/settings/product-tags",
            title: t("productTags.domain"),
            description: t("productTags.subtitle", {
              defaultValue: "Loose labels for filtering and search.",
            }),
            icon: <Tag />,
          },
        ],
      },
      {
        heading: t("app.nav.settings.developer", { defaultValue: "Developer" }),
        description: t("app.nav.settings.developerDescription", {
          defaultValue: "Programmatic access and automation surfaces.",
        }),
        tiles: [
          {
            to: "/settings/publishable-api-keys",
            title: t("apiKeyManagement.domain.publishable"),
            description: t("apiKeyManagement.subtitlePublishable", {
              defaultValue:
                "Public keys for storefronts and client integrations.",
            }),
            icon: <Key />,
            tag: t("apiKeyManagement.tag.publishable", {
              defaultValue: "Publishable",
            }),
          },
          {
            to: "/settings/secret-api-keys",
            title: t("apiKeyManagement.domain.secret"),
            description: t("apiKeyManagement.subtitleSecret", {
              defaultValue: "Server-side keys for trusted backends.",
            }),
            icon: <Key />,
            tag: t("apiKeyManagement.tag.secret", { defaultValue: "Secret" }),
          },
          {
            to: "/settings/workflows",
            title: t("workflowExecutions.domain"),
            description: t("workflowExecutions.subtitle", {
              defaultValue: "Inspect recent workflow executions.",
            }),
            icon: <ArrowPath />,
          },
          ...(isTranslationsEnabled
            ? [
                {
                  to: "/settings/translations",
                  title: t("translations.domain"),
                  description: t("translations.subtitle", {
                    defaultValue: "Translate entity content per locale.",
                  }),
                  icon: <Globe />,
                },
              ]
            : []),
        ],
      },
    ],
    [t, isTranslationsEnabled]
  )

  if (!isHome) {
    return <Outlet />
  }

  return (
    <div
      data-happilee-settings-home=""
      className="flex flex-col gap-y-10 px-6 py-8"
    >
      {sections.map((section) => (
        <section
          key={section.heading}
          data-happilee-settings-section=""
          className="flex flex-col gap-y-4"
        >
          <header className="flex flex-col gap-y-1">
            <h2
              data-happilee-settings-section-heading=""
              className="text-xl font-semibold leading-7 text-ui-fg-base"
            >
              {section.heading}
            </h2>
            {section.description ? (
              <p className="text-sm leading-5 text-ui-fg-muted">
                {section.description}
              </p>
            ) : null}
          </header>
          <div
            data-happilee-settings-grid=""
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {section.tiles.map((tile) => (
              <SettingTile
                key={tile.to}
                to={tile.to}
                title={tile.title}
                description={tile.description}
                icon={tile.icon}
                tag={tile.tag}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
