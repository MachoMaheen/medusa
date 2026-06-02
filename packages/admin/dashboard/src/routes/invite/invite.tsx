/**
 * Invite — Happilee Commerce auth screen (Wave 2.7)
 *
 * Re-skinned member-invite acceptance flow. Same auth-shell contract as login
 * and reset-password (§10 of the design handoff spec):
 *   - centered HappileeCard on bg-ui-bg-subtle page
 *   - 56px brand-solid AuthBrandMark up top
 *   - HappileeInput fields, HappileeButton primary submit
 *   - "Back to login" link with brand-secondary-text styling
 *
 * Three sub-views (toggled by JWT validity + signup success):
 *   1. CreateView   — valid token, render the signup form
 *   2. SuccessView  — signup succeeded, show a "go to login" CTA
 *   3. InvalidView  — token expired/malformed, show "back to login" only
 *
 * The motion.div fade/scale transitions between CreateView and SuccessView are
 * preserved; the rigid `557px` height anchor used by the original layout is
 * dropped because HappileeCard sizes to content and the centered shell
 * accommodates the natural growth/shrink.
 *
 * Backend signup + invite-acceptance hooks untouched. No raw hex literals.
 */

import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, Hint, toast } from "@medusajs/ui"
import i18n from "i18next"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { decodeToken } from "react-jwt"
import { Link, useSearchParams } from "react-router-dom"
import * as z from "zod"
import { Form } from "../../components/common/form"
import { HappileeButton } from "../../components/common/happilee-button/happilee-button"
import { HappileeCard } from "../../components/common/happilee-card/happilee-card"
import { HappileeInput } from "../../components/common/happilee-input"
import { AuthBrandMark } from "../login/components/auth-brand-mark"
import { useSignUpWithEmailPass } from "../../hooks/api/auth"
import { useAcceptInvite } from "../../hooks/api/invites"
import { isFetchError } from "../../lib/is-fetch-error"

const CreateAccountSchema = z
  .object({
    email: z.string().email(),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    password: z.string().min(1),
    repeat_password: z.string().min(1),
  })
  .superRefine(({ password, repeat_password }, ctx) => {
    if (password !== repeat_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: i18n.t("invite.passwordMismatch"),
        path: ["repeat_password"],
      })
    }
  })

// TODO: Update to V2 format
type DecodedInvite = {
  id: string
  jti: any
  exp: string
  iat: number
  email: string
}

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

const AuthHeader = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="flex flex-col items-center gap-3">
    <AuthBrandMark />
    <div className="flex flex-col items-center gap-1">
      <h1
        data-happilee-auth-title=""
        className="text-xl font-semibold leading-7 text-ui-fg-base text-center"
      >
        {title}
      </h1>
      {hint ? (
        <p className="text-sm leading-5 text-ui-fg-muted text-center">{hint}</p>
      ) : null}
    </div>
  </div>
)

const LoginLink = () => {
  const { t } = useTranslation()

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div
        aria-hidden="true"
        className="h-px w-full border-t border-dashed border-ui-border-base"
      />
      <Link
        key="login-link"
        to="/login"
        className="text-sm font-medium leading-5 text-brand-secondary-text transition-colors duration-hap-fast hover:text-brand-solid focus-visible:text-brand-solid outline-none"
      >
        {t("invite.backToLogin")}
      </Link>
    </div>
  )
}

export const Invite = () => {
  const [searchParams] = useSearchParams()
  const [success, setSuccess] = useState(false)

  const token = searchParams.get("token")
  const invite: DecodedInvite | null = token ? decodeToken(token) : null
  const isValidInvite = invite && validateDecodedInvite(invite)

  return (
    <AuthShell>
      {isValidInvite ? (
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="create-account"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0, 0.71, 0.2, 1.01] }}
              className="flex w-full flex-col gap-4"
            >
              <CreateView
                onSuccess={() => setSuccess(true)}
                token={token!}
                invite={invite}
              />
            </motion.div>
          ) : (
            <motion.div
              key="success-view"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0, 0.71, 0.2, 1.01],
              }}
              className="flex w-full flex-col gap-4"
            >
              <SuccessView />
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <InvalidView />
      )}
    </AuthShell>
  )
}

const InvalidView = () => {
  const { t } = useTranslation()

  return (
    <>
      <AuthHeader
        title={t("invite.invalidTokenTitle")}
        hint={t("invite.invalidTokenHint")}
      />
      <LoginLink />
    </>
  )
}

const CreateView = ({
  onSuccess,
  token,
  invite,
}: {
  onSuccess: () => void
  token: string
  invite: DecodedInvite
}) => {
  const { t } = useTranslation()
  const [invalid, setInvalid] = useState(false)

  const [params] = useSearchParams()
  const isFirstRun = params.get("first_run") === "true" // true when the invite page is open during a "create medusa app" run

  const form = useForm<z.infer<typeof CreateAccountSchema>>({
    resolver: zodResolver(CreateAccountSchema),
    defaultValues: {
      email: isFirstRun ? "" : invite.email || "",
      first_name: "",
      last_name: "",
      password: "",
      repeat_password: "",
    },
  })

  const { mutateAsync: signUpEmailPass, isPending: isCreatingAuthUser } =
    useSignUpWithEmailPass()

  const { mutateAsync: acceptInvite, isPending: isAcceptingInvite } =
    useAcceptInvite(token)

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const authToken = await signUpEmailPass({
        email: data.email,
        password: data.password,
      })

      const invitePayload = {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
      }

      await acceptInvite({
        ...invitePayload,
        auth_token: authToken,
      })

      toast.success(t("invite.toast.accepted"))

      onSuccess()
    } catch (error) {
      if (isFetchError(error) && error.status === 400) {
        form.setError("root", {
          type: "manual",
          message: t("invite.invalidInvite"),
        })
        setInvalid(true)
        return
      }

      form.setError("root", {
        type: "manual",
        message: t("errors.serverError"),
      })
    }
  })

  const serverError = form.formState.errors.root?.message
  const validationError =
    form.formState.errors.email?.message ||
    form.formState.errors.password?.message ||
    form.formState.errors.repeat_password?.message ||
    form.formState.errors.first_name?.message ||
    form.formState.errors.last_name?.message

  return (
    <>
      <AuthHeader title={t("invite.title")} hint={t("invite.hint")} />
      <Form {...form}>
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <Form.Field
              control={form.control}
              name="email"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Control>
                      <HappileeInput
                        autoComplete="off"
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
              name="first_name"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Control>
                      <HappileeInput
                        autoComplete="given-name"
                        {...field}
                        placeholder={t("fields.firstName")}
                      />
                    </Form.Control>
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="last_name"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Control>
                      <HappileeInput
                        autoComplete="family-name"
                        {...field}
                        placeholder={t("fields.lastName")}
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
                    <Form.Control>
                      <HappileeInput
                        autoComplete="new-password"
                        type="password"
                        {...field}
                        placeholder={t("fields.password")}
                      />
                    </Form.Control>
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
                        placeholder={t("fields.repeatPassword")}
                      />
                    </Form.Control>
                  </Form.Item>
                )
              }}
            />
            {validationError && (
              <div className="mt-2 text-center">
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
          </div>
          <HappileeButton
            variant="primary"
            className="w-full"
            type="submit"
            isLoading={isCreatingAuthUser || isAcceptingInvite}
            disabled={invalid}
          >
            {t("invite.createAccount")}
          </HappileeButton>
        </form>
      </Form>
      <LoginLink />
    </>
  )
}

const SuccessView = () => {
  const { t } = useTranslation()

  return (
    <>
      <AuthHeader
        title={t("invite.successTitle")}
        hint={t("invite.successHint")}
      />
      <div className="flex w-full flex-col gap-y-3">
        <HappileeButton variant="secondary" asChild className="w-full">
          <Link to="/login" replace>
            {t("invite.successAction")}
          </Link>
        </HappileeButton>
      </div>
      <LoginLink />
    </>
  )
}

const InviteSchema = z.object({
  id: z.string(),
  jti: z.string(),
  exp: z.number(),
  iat: z.number(),
})

const validateDecodedInvite = (decoded: any): decoded is DecodedInvite => {
  return InviteSchema.safeParse(decoded).success
}
