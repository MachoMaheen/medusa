import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

/**
 * Wave 2.8 — Variant option selector.
 *
 * Happilee "tag-pill row" pattern (per components.md § All contacts pill):
 *   - selected pill : bg-brand-light + text-brand-secondary-text + border-brand-secondary-text
 *   - unselected    : bg-ui-bg-base + text-ui-fg-subtle + border-ui-border-base
 *   - hover (unsel) : bg-ui-bg-subtle-hover
 *   - Pills are rounded-md (8px) for option chips (radii scale: 6/8/12/full).
 *   - Label uses text-ui-fg-base font-medium.
 */
type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-sm">
      <span className="text-sm font-medium text-ui-fg-base">
        Select {title}
      </span>
      <div
        className="flex flex-wrap gap-sm"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isSelected = v === current
          return (
            <button
              type="button"
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "h-10 px-lg rounded-md border text-sm font-medium transition-colors duration-hap-fast",
                "focus:outline-none focus:ring-2 focus:ring-brand-solid/20 focus:ring-offset-1",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                {
                  "bg-brand-light text-brand-secondary-text border-brand-secondary-text":
                    isSelected,
                  "bg-ui-bg-base text-ui-fg-subtle border-ui-border-base hover:bg-ui-bg-subtle-hover":
                    !isSelected,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
              aria-pressed={isSelected}
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
