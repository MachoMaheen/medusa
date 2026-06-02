import { Metadata } from "next"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

/**
 * Happilee Commerce — Cart 404 fallback.
 *
 * Centered Happilee empty-state pattern: dashed-bordered card on the page's
 * subtle bg, primary heading + muted copy + brand-solid "Go to homepage" CTA.
 */
export default function NotFound() {
  return (
    <div
      className={
        "flex min-h-[calc(100vh-64px)] items-center justify-center " +
        "bg-ui-bg-subtle px-4 py-16"
      }
    >
      <div
        className={
          "flex max-w-md flex-col items-center gap-y-4 rounded-xl " +
          "border border-dashed border-ui-border-base bg-ui-bg-base " +
          "px-8 py-12 text-center shadow-hap-xs"
        }
      >
        <h1 className="font-sans text-2xl font-semibold text-ui-fg-base">
          Cart not found
        </h1>
        <p className="font-sans text-base font-normal text-ui-fg-muted">
          The cart you tried to access does not exist. Clear your cookies and
          try again, or head back to the homepage.
        </p>
        <LocalizedClientLink href="/">
          <span
            className={
              "inline-flex h-10 items-center justify-center gap-x-2 " +
              "rounded-md bg-brand-solid px-4 font-sans text-sm " +
              "font-medium text-white shadow-hap-xs " +
              "transition-colors duration-hap-fast " +
              "hover:bg-brand-secondary-text"
            }
          >
            Go to homepage
          </span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
