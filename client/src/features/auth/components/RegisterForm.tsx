import { useEffect, useState } from "react";
import { Form, Input } from "antd";
import { AtSign, IdCard, LockKeyhole, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@/shared/components/ui/Icon/Icon";
import {
  authService,
  type AuthOtpChallenge,
  type RegisterStudentInput,
} from "@/features/auth/api/auth.service";
import { useGoogleAuth } from "@/features/auth/hooks/useGoogleAuth";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { getAuthenticatedUserRoleCode } from "@/shared/utils/role";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { registerStudent, isRegistering } = useRegister();
  const {
    registerWithGoogle,
    isLoading: isGoogleLoading,
    error: googleError,
  } = useGoogleAuth();
  const [form] = Form.useForm<RegisterStudentInput & { otpCode?: string }>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<AuthOtpChallenge | null>(null);
  const [challengeEmail, setChallengeEmail] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpVerificationToken, setOtpVerificationToken] = useState<string | null>(null);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
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

  const handleSubmit = async (values: RegisterStudentInput) => {
    setErrorMessage(null);

    try {
      if (!challenge) {
        setIsRequestingOtp(true);
        const requested = await authService.requestRegistrationOtp(
          values.email.trim().toLowerCase()
        );
        setChallenge(requested);
        setChallengeEmail(values.email.trim().toLowerCase());
        setEmailVerified(false);
        setOtpVerificationToken(null);
        return;
      }

      if (!emailVerified || !otpVerificationToken) {
        setErrorMessage(t("register.otp.verifyBeforeRegister"));
        return;
      }

      const response = await registerStudent({
        ...values,
        otpPublicId: challenge.publicId,
        otpVerificationToken,
      });
      const roleCode = getAuthenticatedUserRoleCode(response.me, response.role);

      navigate(roleCode === "STUDENT" ? "/courses" : "/dashboard");
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error) ?? t("register.error"));
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!challenge) return;
    try {
      const { otpCode } = await form.validateFields(["otpCode"]);
      setErrorMessage(null);
      setIsVerifyingOtp(true);
      const verificationToken = await authService.verifyOtp(
        challenge.publicId,
        otpCode ?? ""
      );
      setOtpVerificationToken(verificationToken);
      setEmailVerified(true);
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error) ?? t("register.otp.verifyError"));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const resendEmailOtp = async () => {
    if (!challenge || resendSeconds > 0) return;
    try {
      setErrorMessage(null);
      setIsResendingOtp(true);
      setChallenge(await authService.resendOtp(challenge.publicId));
      setEmailVerified(false);
      setOtpVerificationToken(null);
      form.setFieldValue("otpCode", "");
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error) ?? t("register.otp.resendError"));
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleValuesChange = (changedValues: Partial<RegisterStudentInput>) => {
    setErrorMessage(null);
    if (
      typeof changedValues.email === "string" &&
      challengeEmail &&
      changedValues.email.trim().toLowerCase() !== challengeEmail
    ) {
      setChallenge(null);
      setChallengeEmail(null);
      setEmailVerified(false);
      setOtpVerificationToken(null);
      form.setFieldValue("otpCode", "");
    }
  };

  return (
    <div className="auth-form auth-form--register auth-form--stable-errors">
      <div className="auth-form__heading">
        <p className="auth-form__eyebrow">VINACLASS</p>
        <h2>{t("register.title")}</h2>
        <p>{t("register.subtitle")}</p>
      </div>

      <div className="auth-register-note">
        <UserRound size={17} aria-hidden="true" />
        <span>{t("register.studentAccountNote")}</span>
      </div>

      <Form<RegisterStudentInput & { otpCode?: string }>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
        autoComplete="on"
      >
        <div className="auth-register-fields">
          <Form.Item
            label={t("register.fullName")}
            name="fullName"
            className="auth-field"
            extra={<span aria-hidden="true" />}
            rules={[
              {
                required: true,
                whitespace: true,
                message: t("register.validation.fullNameRequired"),
              },
              {
                max: 254,
                message: t("register.validation.fullNameMax"),
              },
            ]}
          >
            <Input
              id="auth-register-full-name"
              size="large"
              prefix={<UserRound size={17} aria-hidden="true" />}
              placeholder={t("register.fullNamePlaceholder")}
              autoComplete="name"
              maxLength={254}
            />
          </Form.Item>

          <Form.Item
            label={t("register.studentCode")}
            name="studentCode"
            className="auth-field"
            extra={<span aria-hidden="true" />}
            rules={[
              {
                required: true,
                whitespace: true,
                message: t("register.validation.studentCodeRequired"),
              },
              {
                min: 4,
                max: 50,
                message: t("register.validation.studentCodeLength"),
              },
              {
                pattern: /^[A-Za-z0-9._-]+$/,
                message: t("register.validation.studentCodeFormat"),
              },
            ]}
          >
            <Input
              id="auth-register-student-code"
              size="large"
              prefix={<IdCard size={17} aria-hidden="true" />}
              placeholder={t("register.studentCodePlaceholder")}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={50}
            />
          </Form.Item>

          <Form.Item
            label={t("register.email")}
            name="email"
            className="auth-field auth-field--full"
            extra={<span aria-hidden="true" />}
            rules={[
              {
                required: true,
                whitespace: true,
                message: t("register.validation.emailRequired"),
              },
              {
                type: "email",
                message: t("register.validation.emailInvalid"),
              },
              {
                max: 255,
                message: t("register.validation.emailMax"),
              },
            ]}
          >
            <Input
              id="auth-register-email"
              size="large"
              prefix={<AtSign size={17} aria-hidden="true" />}
              placeholder={t("register.emailPlaceholder")}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={255}
            />
          </Form.Item>

          {challenge && (
            <div className="auth-field auth-field--full">
              <p className="auth-register-note" role="status">
                {emailVerified
                  ? t("register.otp.verified")
                  : t("register.otp.sent", { email: challenge.email })}
              </p>
              {!emailVerified && (
                <>
                  <Form.Item
                    label={t("register.otp.codeLabel")}
                    name="otpCode"
                    rules={[
                      {
                        required: true,
                        message: t("register.otp.codeRequired"),
                      },
                      {
                        len: 6,
                        message: t("register.otp.codeLength"),
                      },
                      {
                        pattern: /^\d{6}$/,
                        message: t("register.otp.codeDigits"),
                      },
                    ]}
                  >
                    <Input
                      id="auth-register-otp"
                      size="large"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder={t("register.otp.codePlaceholder")}
                    />
                  </Form.Item>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="auth-text-button"
                      onClick={() => void verifyEmailOtp()}
                      disabled={isVerifyingOtp || isResendingOtp}
                    >
                      {isVerifyingOtp
                        ? t("register.otp.verifying")
                        : t("register.otp.verify")}
                    </button>
                    <button
                      type="button"
                      className="auth-text-button"
                      onClick={() => void resendEmailOtp()}
                      disabled={isResendingOtp || isVerifyingOtp || resendSeconds > 0}
                    >
                      {resendSeconds > 0
                        ? t("register.otp.resendIn", { seconds: resendSeconds })
                        : isResendingOtp
                          ? t("register.otp.resending")
                          : t("register.otp.resend")}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <Form.Item
            label={t("register.password")}
            name="password"
            className="auth-field"
            extra={<span aria-hidden="true" />}
            rules={[
              {
                required: true,
                message: t("register.validation.passwordRequired"),
              },
              {
                min: 8,
                message: t("register.validation.passwordLength"),
              },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message: t("register.validation.passwordComplexity"),
              },
            ]}
          >
            <Input.Password
              id="auth-register-password"
              size="large"
              prefix={<LockKeyhole size={16} aria-hidden="true" />}
              placeholder={t("register.passwordPlaceholder")}
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            label={t("register.passwordConfirmation")}
            name="passwordConfirmation"
            className="auth-field"
            dependencies={["password"]}
            extra={<span aria-hidden="true" />}
            rules={[
              {
                required: true,
                message: t("register.validation.passwordConfirmationRequired"),
              },
              {
                validator: (_, value: string | undefined) =>
                  !value || form.getFieldValue("password") === value
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(t("register.validation.passwordsDoNotMatch"))
                      ),
              },
            ]}
          >
            <Input.Password
              id="auth-register-password-confirmation"
              size="large"
              prefix={<LockKeyhole size={16} aria-hidden="true" />}
              placeholder={t("register.passwordConfirmationPlaceholder")}
              autoComplete="new-password"
            />
          </Form.Item>
        </div>

        {(errorMessage || googleError) && (
          <div className="auth-form__error" role="alert">
            {errorMessage ?? googleError}
          </div>
        )}

        <button
          type="submit"
          className="auth-submit"
          disabled={
            isRegistering ||
            isGoogleLoading ||
            isRequestingOtp ||
            (Boolean(challenge) && (!emailVerified || !otpVerificationToken))
          }
        >
          {isRequestingOtp
            ? t("register.otp.sending")
            : isRegistering
              ? t("register.submitting")
              : challenge
                ? t("register.submit")
                : t("register.otp.send")}
        </button>
      </Form>

      <div className="auth-divider auth-divider--compact">
        {t("register.or")}
      </div>

      <button
        type="button"
        className="auth-google"
        onClick={registerWithGoogle}
        disabled={isRegistering || isGoogleLoading}
      >
        <Icon name="googleIcon" />
        {t("register.googleSignup")}
      </button>

      <p className="auth-form__switch">
        {t("register.hasAccount")}{" "}
        <Link to="/login">{t("register.loginNow")}</Link>
      </p>
    </div>
  );
}
