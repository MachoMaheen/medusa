/**
 * Login — Happilee Commerce auth screen (Wave 2.7)
 *
 * Re-skin of the original Medusa login screen following the auth-wordmark
 * treatment specified in §10 of the design handoff:
 *
 *   page          bg-ui-bg-subtle (#fafafa) — full viewport
 *   card          centered HappileeCard, max-w ~400px, p-6, shadow-hap-md
 *   brand mark    56px square in bg-brand-solid (#4d68dc) with white "H"
 *   title         text-xl semibold text-ui-fg-base, "Sign in to Happilee Commerce"
 *   hint          text-sm text-ui-fg-muted, centered
 *   fields        HappileeInput (email + password)
 *   submit        HappileeButton primary, full width
 *   secondary     CloudAuthLogin block kept intact (visual reskin only)
 *
 * Backend auth logic (useSignInWithEmailPass, MFA challenge flow, react-hook-form
 * + zod schemas) is preserved exactly — only the surface/layout markup changed.
 * Every color/spacing value traces back to a Tailwind token; no raw hex.
 */

import { zodResolver } from "@hookform/resolvers/zod"
import type { AuthTypes } from "@medusajs/types"
import { Alert, Hint } from "@medusajs/ui"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { Link, useLocation, useNavigate } from "react-router-dom"
import * as z from "zod"

import { Form } from "../../components/common/form"
import { HappileeButton } from "../../components/common/happilee-button/happilee-button"
import { HappileeCard } from "../../components/common/happilee-card/happilee-card"
import { HappileeInput } from "../../components/common/happilee-input"
import { useSignInWithEmailPass } from "../../hooks/api"
import { isFetchError } from "../../lib/is-fetch-error"
import { useExtension } from "../../providers/extension-provider"
import { AuthBrandMark } from "./components/auth-brand-mark"
import { CloudAuthLogin } from "./components/cloud-auth-login"
import { MfaChallengeCard } from "./components/mfa-challenge-card"

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const Login = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { getWidgets } = useExtension()
  const [mfaChallenge, setMfaChallenge] =
    useState<AuthTypes.AuthMfaChallengeDTO | null>(null)
  const [mfaSuccessHandler, setMfaSuccessHandler] = useState<
    ((token: string) => void | Promise<void>) | null
  >(null)

  const from = location.state?.from?.pathname || "/orders"

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { mutateAsync, isPending } = useSignInWithEmailPass()

  const handleSubmit = form.handleSubmit(async ({ email, password }) => {
    await mutateAsync(
      {
        email,
        password,
      },
      {
        onError: (error) => {
          if (isFetchError(error)) {
            if (error.status === 401) {
              form.setError("email", {
                type: "manual",
                message: error.message,
              })

              return
            }
          }

          form.setError("root.serverError", {
            type: "manual",
            message: error.message,
          })
        },
        onSuccess: (result) => {
          if (typeof result === "object" && "mfa_challenge" in result) {
            setMfaChallenge(result.mfa_challenge)
            setMfaSuccessHandler(() => () => {
              navigate(from, { replace: true })
            })
            return
          }

          navigate(from, { replace: true })
        },
      }
    )
  })

  const serverError = form.formState.errors?.root?.serverError?.message
  const validationError =
    form.formState.errors.email?.message ||
    form.formState.errors.password?.message

  if (mfaChallenge) {
    return (
      <div
        data-happilee-auth-shell=""
        className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center p-4"
      >
        <MfaChallengeCard
          challenge={mfaChallenge}
          onSuccess={(token) => {
            if (mfaSuccessHandler) {
              return mfaSuccessHandler(token)
            }

            navigate(from, { replace: true })
          }}
          onBack={() => {
            setMfaChallenge(null)
            setMfaSuccessHandler(null)
          }}
        />
      </div>
    )
  }

  return (
    <div
      data-happilee-auth-shell=""
      className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center p-4"
    >
      <HappileeCard
        as="section"
        data-happilee-auth-card=""
        className="w-full max-w-[400px] gap-4 p-6 shadow-hap-md min-h-0"
      >
        <div className="flex flex-col items-center gap-3">
          <AuthBrandMark />
          <div className="flex flex-col items-center gap-1">
            <h1
              data-happilee-auth-title=""
              className="text-xl font-semibold leading-7 text-ui-fg-base text-center"
            >
              {t("login.title")}
            </h1>
            <p className="text-sm leading-5 text-ui-fg-muted text-center">
              {t("login.hint")}
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-y-3">
          {getWidgets("login.before").map((Component, i) => {
            return <Component key={i} />
          })}
          <Form {...form}>
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-y-4"
            >
              <div className="flex flex-col gap-y-2">
                <Form.Field
                  control={form.control}
                  name="email"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Control>
                          <HappileeInput
                            autoComplete="email"
                            {...field}
                            placeholder={t("fields.email")}
                          />
                        </Form.Control>
                      </Form.Item>
                    )
                  }}
                />
                <Form.Field
                  control={form.control}
                  name="password"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Label>{}</Form.Label>
                        <Form.Control>
                          <HappileeInput
                            type="password"
                            autoComplete="current-password"
                            {...field}
                            placeholder={t("fields.password")}
                          />
                        </Form.Control>
                      </Form.Item>
                    )
                  }}
                />
              </div>
              {validationError && (
                <div className="text-center">
                  <Hint className="inline-flex" variant={"error"}>
                    {validationError}
                  </Hint>
                </div>
              )}
              {serverError && (
                <Alert
                  className="bg-ui-bg-base items-center p-2"
                  dismissible
                  variant="error"
                >
                  {serverError}
                </Alert>
              )}
              <HappileeButton
                variant="primary"
                className="w-full"
                type="submit"
                isLoading={isPending}
              >
                {t("actions.continueWithEmail")}
              </HappileeButton>
            </form>
          </Form>
          {getWidgets("login.after").map((Component, i) => {
            return <Component key={i} />
          })}
          <CloudAuthLogin
            onMfaChallenge={(challenge, onSuccess) => {
              setMfaChallenge(challenge)
              setMfaSuccessHandler(() => onSuccess)
            }}
          />
        </div>
        <div className="flex items-center justify-center">
          <span className="text-sm leading-5 text-ui-fg-muted">
            <Trans
              i18nKey="login.forgotPassword"
              components={[
                <Link
                  key="reset-password-link"
                  to="/reset-password"
                  className="text-brand-secondary-text transition-colors duration-hap-fast hover:text-brand-solid focus-visible:text-brand-solid font-medium outline-none"
                />,
              ]}
            />
          </span>
        </div>
      </HappileeCard>
    </div>
  )
}
