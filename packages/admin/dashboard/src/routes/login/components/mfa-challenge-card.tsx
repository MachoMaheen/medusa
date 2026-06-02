/**
 * MfaChallengeCard — Happilee Commerce auth shell wrapper for MFA (Wave 2.7).
 *
 * Mirrors the login-screen shell: a centered HappileeCard with the brand mark
 * up top and the MFA verification form rendered inside. Form logic untouched
 * (lives in `mfa-challenge-form.tsx`).
 */

import type { AuthTypes } from "@medusajs/types"
import { HappileeCard } from "../../../components/common/happilee-card/happilee-card"
import { AuthBrandMark } from "./auth-brand-mark"
import { MfaChallengeForm } from "./mfa-challenge-form"

type MfaChallengeCardProps = {
  challenge: AuthTypes.AuthMfaChallengeDTO
  onSuccess: (token: string) => void | Promise<void>
  onBack?: () => void
}

export const MfaChallengeCard = ({
  challenge,
  onSuccess,
  onBack,
}: MfaChallengeCardProps) => {
  return (
    <HappileeCard
      as="section"
      data-happilee-auth-card=""
      className="w-full max-w-[400px] gap-4 p-6 shadow-hap-md min-h-0"
    >
      <div className="flex flex-col items-center gap-3">
        <AuthBrandMark />
      </div>
      <MfaChallengeForm
        challenge={challenge}
        onSuccess={onSuccess}
        onBack={onBack}
      />
    </HappileeCard>
  )
}
