/**
 * Wave 2.10 — Error message line.
 *
 * Renders form/server errors using Medusa's `--fg-error` CSS variable, which
 * `happilee-tokens.css` pins to `220 38 38`. This routes the error color
 * through a centralized token rather than a raw hex, so the static token
 * discipline check stays clean.
 *
 * KNOWN GAP: Happilee v3 does not yet ship a dedicated semantic "error" token
 * in tailwind.config.cjs (only the status `hap-status-*` tokens for active /
 * draft / paused). Until we add one, this component relies on the Medusa
 * preset's `text-ui-fg-error` class (which resolves via `--fg-error`).
 *   - Tracked in: .agent-os/decisions/2026-06-02-canonical-token-map.md
 *     (Wave 2 follow-up — add hap-fg-error to the canonical map).
 */

const ErrorMessage = ({
  error,
  "data-testid": dataTestid,
}: {
  error?: string | null
  "data-testid"?: string
}) => {
  if (!error) {
    return null
  }

  return (
    <div
      className="pt-2 text-sm text-ui-fg-error"
      data-testid={dataTestid}
    >
      <span>{error}</span>
    </div>
  )
}

export default ErrorMessage
