/**
 * ResetPassword — Happilee Commerce auth screen (Wave 2.7)
 *
 * Three sub-states, all sharing the same auth-shell visual contract from §10
 * of the design handoff spec:
 *   1. ResetPasswordRequest — collect email to send reset link
 *   2. ChooseNewPassword    — token-bearing user picks a new password
 *   3. InvalidResetToken    — token expired/malformed; offer to re-request
 *
 * Shell pattern (identical to login.tsx):
 *   page    bg-ui-bg-subtle / centered / p-4
 *   card    HappileeCard, max-w 400px, p-6, shadow-hap-md
 *   header  56px brand-solid AuthBrandMark + title + hint
 *   form    HappileeInput fields, HappileeButton primary submit
 *   footer  "Back to login" link (text-brand-secondary-text)
 *
 * Backend logic (hooks, schemas, JWT decode/validation) preserved verbatim;
 * only chrome/markup changed. No raw hex — every color routes through tokens.
 */

import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, toast } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import * as z from "zod"

import { useState } from "react"
import { decodeToken } from "react-jwt"
import { Form } from "../../components/common/form"
import { HappileeButton } from "../../components/common/happilee-button/happilee-button"
import { HappileeCard } from "../../components/common/happilee-card/happilee-card"
import { HappileeInput } from "../../components/common/happilee-input"
import { AuthBrandMark } from "../login/components/auth-brand-mark"
import { i18n } from "../../components/utilities/i18n"
import {
  useResetPasswordForEmailPass,
  useUpdateProviderForEmailPass,
} from "../../hooks/api/auth"

const ResetPasswordInstructionsSchema = z.object({
  email: z.string().email(),
})

const ResetPasswordSchema = z
  .object({
    password: z.string().min(1),
    repeat_password: z.string().min(1),
  })
  .superRefine(({ password, repeat_password }, ctx) => {
    if (password !== repeat_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: i18n.t("resetPassword.passwordMismatch"),
        path: ["repeat_password"],
      })
    }
  })

const ResetPasswordTokenSchema = z.object({
  entity_id: z.string(),
  provider: z.string(),
  exp: z.number(),
  iat: z.number(),
})

type DecodedResetPasswordToken = {
  entity_id: string // -> email in here
  provider: string
  exp: string
  iat: string
}

const validateDecodedResetPasswordToken = (
  decoded: any
): decoded is DecodedResetPasswordToken => {
  return ResetPasswordTokenSchema.safeParse(decoded).success
}

/**
 * Shared Happilee auth shell — bg + centered HappileeCard. Used by every
 * sub-state of this route so the visual contract stays identical across them.
 */
const AuthShell = ({ children }: { children: React.ReactNode }) => (
  <div
    data-happilee-auth-shell=""
    className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center p-4"
  >
    <HappileeCard
      as="section"
      data-happilee-auth-card=""
      className="w-full max-w-[400px] gap-4 p-6 shadow-hap-md min-h-0"
    >
      {children}
    </HappileeCard>
  </div>
)

const AuthHeader = ({ title, hint }: { title: string; hint: string }) => (
  <div className="flex flex-col items-center gap-3">
    <AuthBrandMark />
    <div className="flex flex-col items-center gap-1">
      <h1
        data-happilee-auth-title=""
        className="text-xl font-semibold leading-7 text-ui-fg-base text-center"
      >
        {title}
      </h1>
      <p className="text-sm leading-5 text-ui-fg-muted text-center">{hint}</p>
    </div>
  </div>
)

const BackToLoginLink = () => (
  <div className="flex items-center justify-center">
    <span className="text-sm leading-5 text-ui-fg-muted">
      <Trans
        i18nKey="resetPassword.backToLogin"
        components={[
          <Link
            key="login-link"
            to="/login"
            className="text-brand-secondary-text transition-colors duration-hap-fast hover:text-brand-solid focus-visible:text-brand-solid font-medium outline-none"
          />,
        ]}
      />
    </span>
  </div>
)

const InvalidResetToken = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <AuthShell>
      <AuthHeader
        title={t("resetPassword.invalidLinkTitle")}
        hint={t("resetPassword.invalidLinkHint")}
      />
      <div className="flex w-full flex-col gap-y-3">
        <HappileeButton
          variant="primary"
          onClick={() => navigate("/reset-password", { replace: true })}
          className="w-full"
          type="button"
        >
          {t("resetPassword.goToResetPassword")}
        </HappileeButton>
      </div>
      <BackToLoginLink />
    </AuthShell>
  )
}

const ChooseNewPassword = ({ token }: { token: string }) => {
  const { t } = useTranslation()

  const [showAlert, setShowAlert] = useState(false)

  const invite: DecodedResetPasswordToken | null = token
    ? decodeToken(token)
    : null

  const isValidResetPasswordToken =
    invite && validateDecodedResetPasswordToken(invite)

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      repeat_password: "",
    },
  })

  const { mutateAsync, isPending } = useUpdateProviderForEmailPass(token)

  const handleSubmit = form.handleSubmit(async ({ password }) => {
    if (!invite) {
      return
    }

    await mutateAsync(
      {
        password,
      },
      {
        onSuccess: () => {
          form.setValue("password", "")
          form.setValue("repeat_password", "")
          setShowAlert(true)
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  })

  if (!isValidResetPasswordToken) {
    return <InvalidResetToken />
  }

  return (
    <AuthShell>
      <AuthHeader
        title={t("resetPassword.resetPassword")}
        hint={t("resetPassword.newPasswordHint")}
      />
      <div className="flex w-full flex-col gap-y-3">
        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-y-4"
          >
            <div className="flex flex-col gap-y-2">
              <HappileeInput
                type="email"
                disabled
                value={invite?.entity_id}
                readOnly
              />
              <Form.Field
                control={form.control}
                name="password"
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Control>
                        <HappileeInput
                          autoComplete="new-password"
                          type="password"
                          {...field}
                          placeholder={t("resetPassword.newPassword")}
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )
                }}
              />
              <Form.Field
                control={form.control}
                name="repeat_password"
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Control>
                        <HappileeInput
                          autoComplete="off"
                          type="password"
                          {...field}
                          placeholder={t("resetPassword.repeatNewPassword")}
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )
                }}
              />
            </div>
            {showAlert && (
              <Alert dismissible variant="success">
                <div className="flex flex-col">
                  <span className="text-ui-fg-base mb-1">
                    {t("resetPassword.successfulResetTitle")}
                  </span>
                  <span>{t("resetPassword.successfulReset")}</span>
                </div>
              </Alert>
            )}
            {!showAlert && (
              <HappileeButton
                variant="primary"
                className="w-full"
                type="submit"
                isLoading={isPending}
              >
                {t("resetPassword.resetPassword")}
              </HappileeButton>
            )}
          </form>
        </Form>
      </div>
      <BackToLoginLink />
    </AuthShell>
  )
}

export const ResetPassword = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [showAlert, setShowAlert] = useState(false)

  const token = searchParams.get("token")

  const form = useForm<z.infer<typeof ResetPasswordInstructionsSchema>>({
    resolver: zodResolver(ResetPasswordInstructionsSchema),
    defaultValues: {
      email: "",
    },
  })

  const { mutateAsync, isPending } = useResetPasswordForEmailPass()

  const handleSubmit = form.handleSubmit(async ({ email }) => {
    await mutateAsync(
      {
        email,
      },
      {
        onSuccess: () => {
          form.setValue("email", "")
          setShowAlert(true)
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  })

  if (token) {
    return <ChooseNewPassword token={token} />
  }

  return (
    <AuthShell>
      <AuthHeader
        title={t("resetPassword.resetPassword")}
        hint={t("resetPassword.hint")}
      />
      <div className="flex w-full flex-col gap-y-3">
        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-y-4"
          >
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
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            {showAlert && (
              <Alert dismissible variant="success">
                <div className="flex flex-col">
                  <span className="text-ui-fg-base mb-1">
                    {t("resetPassword.successfulRequestTitle")}
                  </span>
                  <span>{t("resetPassword.successfulRequest")}</span>
                </div>
              </Alert>
            )}
            <HappileeButton
              variant="primary"
              className="w-full"
              type="submit"
              isLoading={isPending}
            >
              {t("resetPassword.sendResetInstructions")}
            </HappileeButton>
          </form>
        </Form>
      </div>
      <BackToLoginLink />
    </AuthShell>
  )
}
