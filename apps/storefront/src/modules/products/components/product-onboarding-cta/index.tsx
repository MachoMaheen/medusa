import { cookies as nextCookies } from "next/headers"

/**
 * Wave 2.8 — First-run onboarding banner.
 *
 * Layout: subtle highlighted card inside the PDP info column.
 *   - bg-ui-bg-highlight (#edf2fe) — Happilee selected/calm-active surface
 *   - border-brand-secondary-text/20 — soft brand outline
 *   - text-base text-ui-fg-base for headline
 *   - Secondary action button: outlined, white, shadow-hap-xs
 */
async function ProductOnboardingCta() {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  if (!isOnboarding) {
    return null
  }

  return (
    <div
      className="w-full bg-ui-bg-highlight border border-brand-secondary-text/20 rounded-xl p-lg flex flex-col gap-md"
      data-testid="product-onboarding-cta"
    >
      <p className="text-base font-semibold text-ui-fg-base">
        Your demo product was successfully created.
      </p>
      <p className="text-sm text-ui-fg-subtle">
        You can now continue setting up your store in the admin.
      </p>
      <a
        href="http://localhost:7001/a/orders?onboarding_step=create_order_nextjs"
        className="inline-flex items-center justify-center h-10 px-lg rounded-md bg-ui-bg-base border border-ui-border-base text-sm font-medium text-ui-fg-base shadow-hap-xs hover:bg-ui-bg-subtle-hover transition-colors duration-hap-fast"
      >
        Continue setup in admin
      </a>
    </div>
  )
}

export default ProductOnboardingCta
