import { useState } from "react";
import { Form, Input } from "antd";
import { AtSign, IdCard, LockKeyhole, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@/shared/components/ui/Icon/Icon";
import type { RegisterStudentInput } from "@/features/auth/api/auth.service";
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
  const [form] = Form.useForm<RegisterStudentInput>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: RegisterStudentInput) => {
    setErrorMessage(null);

    try {
      const response = await registerStudent(values);
      const roleCode = getAuthenticatedUserRoleCode(response.me, response.role);

      navigate(roleCode === "STUDENT" ? "/courses" : "/dashboard");
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error) ?? t("register.error"));
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

      <Form<RegisterStudentInput>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        onValuesChange={() => setErrorMessage(null)}
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
                max: 255,
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
              maxLength={255}
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
          disabled={isRegistering || isGoogleLoading}
        >
          {isRegistering ? t("register.submitting") : t("register.submit")}
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
