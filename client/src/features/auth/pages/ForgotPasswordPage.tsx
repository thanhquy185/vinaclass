import { useEffect, useState } from "react";
import { Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthTemplate from "@/features/auth/components/AuthTemplate";
import {
  authService,
  type AuthOtpChallenge,
} from "@/features/auth/api/auth.service";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useAuthStore } from "@/shared/stores/useAuthStore";

type ForgotPasswordValues = {
  email: string;
  code: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const logout = useAuthStore((state) => state.logout);
  const [form] = Form.useForm<ForgotPasswordValues>();
  const [step, setStep] = useState<Step>("email");
  const [challenge, setChallenge] = useState<AuthOtpChallenge | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (!challenge?.resendAvailableAt) {
      setResendSeconds(0);
      return;
    }

    const updateCountdown = () => {
      setResendSeconds(
        Math.max(0, Math.ceil((Date.parse(challenge.resendAvailableAt) - Date.now()) / 1000))
      );
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [challenge?.resendAvailableAt]);

  const handleSubmit = async (values: ForgotPasswordValues) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      if (step === "email") {
        const requested = await authService.requestPasswordResetOtp(
          values.email.trim().toLowerCase()
        );
        setChallenge(requested);
        setStep("otp");
        return;
      }

      if (step === "otp") {
        if (!challenge) return;
        setVerificationToken(
          await authService.verifyOtp(challenge.publicId, values.code)
        );
        setStep("password");
        return;
      }

      if (!challenge || !verificationToken) return;
      await authService.resetPasswordWithOtp(
        challenge.publicId,
        verificationToken,
        values.newPassword,
        values.newPasswordConfirmation
      );
      showToast(t("forgotPasswordPage.success"), "success");
      logout();
      navigate("/login", { replace: true });
    } catch (error: unknown) {
      setErrorMessage(
        getApiErrorMessage(error) ?? t("forgotPasswordPage.error")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    if (!challenge || resendSeconds > 0) return;
    try {
      setErrorMessage(null);
      setIsResending(true);
      setChallenge(await authService.resendOtp(challenge.publicId));
      setVerificationToken(null);
      form.setFieldValue("code", "");
    } catch (error: unknown) {
      setErrorMessage(
        getApiErrorMessage(error) ?? t("forgotPasswordPage.resendError")
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthTemplate compact>
      <div className="auth-form auth-form--stable-errors">
        <div className="auth-form__heading">
          <p className="auth-form__eyebrow">VINACLASS</p>
          <h2>{t("forgotPasswordPage.title")}</h2>
          <p>
            {step === "email"
              ? t("forgotPasswordPage.subtitle")
              : step === "otp"
                ? t("forgotPasswordPage.otpSubtitle", {
                    email: challenge?.email ?? "",
                  })
                : t("forgotPasswordPage.passwordSubtitle")}
          </p>
        </div>

        <Form<ForgotPasswordValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          onValuesChange={() => setErrorMessage(null)}
          autoComplete="on"
        >
          {step === "email" && (
            <Form.Item
              label={t("forgotPasswordPage.email")}
              name="email"
              rules={[
                { required: true, message: t("forgotPasswordPage.emailRequired") },
                { type: "email", message: t("forgotPasswordPage.emailInvalid") },
                { max: 254, message: t("forgotPasswordPage.emailMax") },
              ]}
            >
              <Input
                id="forgot-password-email"
                size="large"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                maxLength={254}
                placeholder={t("forgotPasswordPage.emailPlaceholder")}
              />
            </Form.Item>
          )}

          {step === "otp" && (
            <>
              <p className="auth-register-note" role="status">
                {t("forgotPasswordPage.otpSent", {
                  email: challenge?.email ?? "",
                })}
              </p>
              <Form.Item
                label={t("forgotPasswordPage.otpLabel")}
                name="code"
                rules={[
                  { required: true, message: t("forgotPasswordPage.otpRequired") },
                  { len: 6, message: t("forgotPasswordPage.otpLength") },
                  { pattern: /^\d{6}$/, message: t("forgotPasswordPage.otpDigits") },
                ]}
              >
                <Input
                  id="forgot-password-otp"
                  size="large"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder={t("forgotPasswordPage.otpPlaceholder")}
                />
              </Form.Item>
              <button
                type="button"
                className="auth-text-button"
                onClick={() => void resendCode()}
                disabled={isResending || resendSeconds > 0}
              >
                {resendSeconds > 0
                  ? t("forgotPasswordPage.resendIn", { seconds: resendSeconds })
                  : isResending
                    ? t("forgotPasswordPage.resending")
                    : t("forgotPasswordPage.resend")}
              </button>
            </>
          )}

          {step === "password" && (
            <>
              <Form.Item
                label={t("forgotPasswordPage.newPassword")}
                name="newPassword"
                rules={[
                  { required: true, message: t("forgotPasswordPage.passwordRequired") },
                  { min: 6, message: t("forgotPasswordPage.passwordLength") },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message: t("forgotPasswordPage.passwordComplexity"),
                  },
                ]}
              >
                <Input.Password
                  id="forgot-password-new"
                  size="large"
                  autoComplete="new-password"
                  placeholder={t("forgotPasswordPage.passwordPlaceholder")}
                />
              </Form.Item>
              <Form.Item
                label={t("forgotPasswordPage.confirmPassword")}
                name="newPasswordConfirmation"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: t("forgotPasswordPage.confirmRequired") },
                  ({ getFieldValue }) => ({
                    validator(_, value: string | undefined) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(t("forgotPasswordPage.passwordMismatch"))
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  id="forgot-password-confirm"
                  size="large"
                  autoComplete="new-password"
                  placeholder={t("forgotPasswordPage.passwordPlaceholder")}
                />
              </Form.Item>
            </>
          )}

          {errorMessage && (
            <div className="auth-form__error" role="alert">
              {errorMessage}
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting
              ? t("forgotPasswordPage.submitting")
              : step === "email"
                ? t("forgotPasswordPage.sendOtp")
                : step === "otp"
                  ? t("forgotPasswordPage.verifyOtp")
                  : t("forgotPasswordPage.resetPassword")}
          </button>
        </Form>

        <p className="auth-form__switch">
          {step !== "email" && (
            <button
              type="button"
              className="auth-text-button"
              onClick={() => {
                setStep("email");
                setChallenge(null);
                setVerificationToken(null);
                setErrorMessage(null);
                form.setFieldsValue({
                  code: "",
                  newPassword: "",
                  newPasswordConfirmation: "",
                });
              }}
            >
              {t("forgotPasswordPage.backToEmail")}
            </button>
          )}{" "}
          <Link to="/login">{t("forgotPasswordPage.backToLogin")}</Link>
        </p>
      </div>
    </AuthTemplate>
  );
}
