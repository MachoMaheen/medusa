"use client"

/**
 * Wave 2.10 — CheckoutStepStepper
 *
 * Renders the 4-step Happilee checkout progress indicator:
 *   1. Address  2. Shipping  3. Payment  4. Review
 *
 * Visual contract (per happilee-v3-design-system skill + canonical token map):
 *   - Completed: brand-solid filled circle with checkmark
 *   - Active:    brand-solid ring + brand-secondary-text label
 *   - Pending:   border-ui-border-base + text-ui-fg-muted
 *
 * Driven by the `?step=` search param the existing checkout components already
 * read (address | delivery | payment | review). When `?step` is absent the
 * stepper defaults to "address" because that is the first incomplete step.
 */

import { CheckMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useSearchParams } from "next/navigation"

type StepId = "address" | "delivery" | "payment" | "review"

type Step = {
  id: StepId
  number: number
  label: string
}

const STEPS: readonly Step[] = [
  { id: "address", number: 1, label: "Address" },
  { id: "delivery", number: 2, label: "Shipping" },
  { id: "payment", number: 3, label: "Payment" },
  { id: "review", number: 4, label: "Review" },
] as const

function statusFor(
  step: Step,
  activeIndex: number,
  index: number
): "completed" | "active" | "pending" {
  if (index < activeIndex) return "completed"
  if (index === activeIndex) return "active"
  return "pending"
}

const CheckoutStepStepper = () => {
  const searchParams = useSearchParams()
  const currentStep = (searchParams.get("step") as StepId | null) ?? "address"
  const activeIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.id === currentStep)
  )

  return (
    <ol
      className="flex items-center gap-x-2 w-full"
      data-testid="checkout-step-stepper"
      aria-label="Checkout progress"
    >
      {STEPS.map((step, index) => {
        const status = statusFor(step, activeIndex, index)
        const isLast = index === STEPS.length - 1

        return (
          <li
            key={step.id}
            className="flex items-center gap-x-2 flex-1 min-w-0"
            data-testid={`checkout-step-${step.id}`}
            data-status={status}
            aria-current={status === "active" ? "step" : undefined}
          >
            <span
              className={clx(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                {
                  "bg-brand-solid text-white": status === "completed",
                  "bg-ui-bg-base text-brand-secondary-text ring-2 ring-brand-solid":
                    status === "active",
                  "bg-ui-bg-base text-ui-fg-muted border border-ui-border-base":
                    status === "pending",
                }
              )}
              aria-hidden="true"
            >
              {status === "completed" ? (
                <CheckMini className="h-4 w-4" />
              ) : (
                step.number
              )}
            </span>
            <span
              className={clx(
                "text-sm font-medium truncate",
                {
                  "text-ui-fg-base": status === "completed",
                  "text-brand-secondary-text": status === "active",
                  "text-ui-fg-muted": status === "pending",
                }
              )}
            >
              {step.label}
            </span>
            {!isLast && (
              <span
                className={clx(
                  "h-px flex-1 mx-1 transition-colors",
                  status === "completed"
                    ? "bg-brand-solid"
                    : "bg-ui-border-base"
                )}
                aria-hidden="true"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default CheckoutStepStepper
