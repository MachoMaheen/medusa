/**
 * Shell — Happilee chrome wrapper (Wave 0 port).
 *
 * Replaces Medusa's stock 220px sidebar container + topbar gutter with the
 * Happilee shell: a flex row hosting a SideNav slot on the left, a slim
 * Notifications topbar on the right, and the routed <Outlet /> below.
 *
 * The actual sidebar UI is supplied by MainLayout (HappileeSideNav). Shell
 * stays generic so other layouts (settings-layout) can reuse it with a
 * different sidebar implementation later.
 *
 * Mobile (< 640px): the sidebar slides in as a Radix Dialog instead of
 * being permanently visible, controlled by useSidebar().toggle("mobile").
 *
 * All Tailwind classes use Medusa preset `ui-*` tokens (canonical token map
 * ADR — .agent-os/decisions/2026-06-02-canonical-token-map.md).
 */

import { SidebarLeft, TriangleRightMini, XMark } from "@medusajs/icons"
import { IconButton, clx } from "@medusajs/ui"
import { AnimatePresence } from "motion/react"
import { Dialog as RadixDialog } from "radix-ui"
import {
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from "react"
import { useTranslation } from "react-i18next"
import {
  Link,
  Outlet,
  UIMatch,
  useMatches,
  useNavigation,
} from "react-router-dom"

import { KeybindProvider } from "../../../providers/keybind-provider"
import { useGlobalShortcuts } from "../../../providers/keybind-provider/hooks"
import { useSidebar } from "../../../providers/sidebar-provider"
import { ProgressBar } from "../../common/progress-bar"
import { Notifications } from "../notifications"

type ShellProps = {
  /**
   * The sidebar element to render on the left side of the chrome.
   * MainLayout passes the Happilee 56px rail + tier-two panel here.
   * For backwards compatibility, children are still rendered inside the
   * mobile drawer when no `sidebar` prop is provided.
   */
  sidebar?: ReactNode
}

export const Shell = ({
  children,
  sidebar,
}: PropsWithChildren<ShellProps>): ReactElement => {
  const globalShortcuts = useGlobalShortcuts()
  const navigation = useNavigation()

  const loading = navigation.state === "loading"
  const sidebarContent = sidebar ?? children

  return (
    <KeybindProvider shortcuts={globalShortcuts}>
      <div className="bg-ui-bg-subtle relative flex h-screen w-screen flex-row items-stretch overflow-hidden font-sans">
        <NavigationBar loading={loading} />

        {/* Desktop Happilee chrome — sidebar permanently visible >= 640px */}
        <div className="hidden h-full shrink-0 sm:block">{sidebarContent}</div>

        {/* Mobile drawer — same sidebar content, slides in via Radix Dialog */}
        <MobileSidebarContainer>{sidebarContent}</MobileSidebarContainer>

        {/* Content area */}
        <div className="bg-ui-bg-subtle flex h-full w-full min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <main
            className={clx(
              "flex h-full w-full flex-col items-center overflow-y-auto transition-opacity delay-200 duration-200",
              {
                "opacity-25": loading,
              }
            )}
          >
            <Gutter>
              <Outlet />
            </Gutter>
          </main>
        </div>
      </div>
    </KeybindProvider>
  )
}

const NavigationBar = ({ loading }: { loading: boolean }) => {
  const [showBar, setShowBar] = useState(false)

  /**
   * If the loading state is true, we want to show the bar after a short delay.
   * The delay is used to prevent the bar from flashing on quick navigations.
   */
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    if (loading) {
      timeout = setTimeout(() => {
        setShowBar(true)
      }, 200)
    } else {
      setShowBar(false)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [loading])

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1">
      <AnimatePresence>{showBar ? <ProgressBar /> : null}</AnimatePresence>
    </div>
  )
}

const Gutter = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex w-full max-w-[1600px] flex-col gap-y-2 p-3">
      {children}
    </div>
  )
}

const Breadcrumbs = () => {
  const matches = useMatches() as unknown as UIMatch<
    unknown,
    {
      breadcrumb?: (match?: UIMatch) => string | ReactNode
    }
  >[]

  const crumbs = matches
    .filter((match) => match.handle?.breadcrumb)
    .map((match) => {
      const handle = match.handle

      let label: string | ReactNode | undefined = undefined

      try {
        label = handle.breadcrumb?.(match)
      } catch (error) {
        // noop
      }

      if (!label) {
        return null
      }

      return {
        label: label,
        path: match.pathname,
      }
    })
    .filter(Boolean) as { label: string | ReactNode; path: string }[]

  return (
    <ol
      className={clx(
        "text-ui-fg-muted txt-compact-small-plus flex select-none items-center"
      )}
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1
        const isSingle = crumbs.length === 1

        return (
          <li key={index} className={clx("flex items-center")}>
            {!isLast ? (
              <Link
                className="transition-fg hover:text-ui-fg-subtle"
                to={crumb.path}
              >
                {crumb.label}
              </Link>
            ) : (
              <div>
                {!isSingle && <span className="block lg:hidden">...</span>}
                <span
                  key={index}
                  className={clx({
                    "hidden lg:block": !isSingle,
                  })}
                >
                  {crumb.label}
                </span>
              </div>
            )}
            {!isLast && (
              <span className="mx-2">
                <TriangleRightMini className="rtl:rotate-180" />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Mobile-only drawer trigger. Restores the affordance lost in the Wave 0
 * shell rewrite — without it, users at viewport < 640px have no UI handle
 * for opening the nav drawer (Option C review issue #1). Hidden on >= 640px
 * because the rail is permanently visible there.
 */
const MobileSidebarToggle = () => {
  const { t } = useTranslation()
  const { toggle } = useSidebar()

  return (
    <IconButton
      className="sm:hidden"
      variant="transparent"
      onClick={() => toggle("mobile")}
      size="small"
      aria-label={t("app.nav.accessibility.title")}
      data-testid="mobile-sidebar-toggle"
    >
      <SidebarLeft className="text-ui-fg-muted rtl:rotate-180" />
    </IconButton>
  )
}

const Topbar = () => {
  return (
    <div className="bg-ui-bg-base border-ui-border-menu-bot grid w-full grid-cols-2 border-b px-4 py-2.5">
      <div className="flex items-center gap-x-1.5">
        <MobileSidebarToggle />
        <Breadcrumbs />
      </div>
      <div className="flex items-center justify-end gap-x-3">
        <Notifications />
      </div>
    </div>
  )
}

const MobileSidebarContainer = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation()
  const { mobile, toggle } = useSidebar()

  return (
    <RadixDialog.Root open={mobile} onOpenChange={() => toggle("mobile")}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={clx(
            "bg-ui-bg-overlay fixed inset-0",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <RadixDialog.Content
          className={clx(
            "bg-ui-bg-base shadow-hap-md fixed inset-y-2 start-2 flex w-full max-w-[304px] flex-col overflow-hidden rounded-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-start-1/2 data-[state=open]:slide-in-from-start-1/2 duration-200"
          )}
        >
          <div className="absolute end-2 top-2 z-10">
            <RadixDialog.Close asChild>
              <IconButton
                size="small"
                variant="transparent"
                className="text-ui-fg-subtle"
              >
                <XMark />
              </IconButton>
            </RadixDialog.Close>
            <RadixDialog.Title className="sr-only">
              {t("app.nav.accessibility.title")}
            </RadixDialog.Title>
            <RadixDialog.Description className="sr-only">
              {t("app.nav.accessibility.description")}
            </RadixDialog.Description>
          </div>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
