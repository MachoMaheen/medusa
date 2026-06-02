import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Happilee Commerce — guest sign-in nudge above the cart items list.
 *
 * Renders as a calm-tinted (bg-ui-bg-highlight = Happilee brand-light)
 * inline banner inside the items column. Secondary action style (white
 * surface + brand-secondary-text label) — never the brand-solid CTA,
 * which is reserved for the page's primary action ("Go to checkout").
 */
const SignInPrompt = () => {
  return (
    <div
      className={
        "flex flex-col gap-y-3 small:flex-row small:items-center " +
        "small:justify-between rounded-xl border border-ui-border-base " +
        "bg-ui-bg-highlight px-6 py-4"
      }
    >
      <div className="flex flex-col gap-y-1">
        <h3 className="font-sans text-base font-semibold text-ui-fg-base">
          Already have an account?
        </h3>
        <p className="font-sans text-sm font-normal text-ui-fg-muted">
          Sign in for a faster checkout and to track your orders.
        </p>
      </div>
      <LocalizedClientLink href="/account">
        <span
          data-testid="sign-in-button"
          className={
            "inline-flex h-10 items-center justify-center gap-x-2 " +
            "rounded-md border border-ui-border-base bg-ui-bg-base px-4 " +
            "font-sans text-sm font-medium text-brand-secondary-text " +
            "shadow-hap-xs transition-colors duration-hap-fast " +
            "hover:bg-ui-bg-subtle-hover"
          }
        >
          Sign in
        </span>
      </LocalizedClientLink>
    </div>
  )
}

export default SignInPrompt
