import Icon from "@/shared/components/ui/Icon/Icon";
import { useState } from "react";
import { Form, Input } from "antd";
import { IdCard, LockKeyhole } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGoogleAuth } from "@/features/auth/hooks/useGoogleAuth";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { getAuthenticatedUserRoleCode } from "@/shared/utils/role";
import type { LoginFormSubmit } from "@/shared/types";

export default function LoginForm() {
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { loginAsync, isLoadingLogin } = useLogin();
  const { loginWithGoogle } = useGoogleAuth();

  const [form] = Form.useForm<LoginFormSubmit>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: LoginFormSubmit) => {
    setErrorMessage(null);
    try {
      const response = await loginAsync(values);
      const roleCode = getAuthenticatedUserRoleCode(response.me, response.role);

      if (roleCode === "STUDENT" || roleCode === "TEACHER") {
        navigate("/courses");
      } else {
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error) ?? t("login.error"));
    }
  };

  return (
    <div className="auth-form auth-form--login auth-form--stable-errors">
      <div className="auth-form__heading">
        <p className="auth-form__eyebrow">VINACLASS</p>
        <h2>{t("login.welcome")}</h2>
        <p>{t("login.subtitle")}</p>
      </div>
      <Form<LoginFormSubmit>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        onValuesChange={() => setErrorMessage(null)}
        autoComplete="on"
      >
        <Form.Item
          label={t("login.identifier")}
          name="login"
          className="auth-field"
          extra={<span aria-hidden="true" />}
          rules={[
            {
              required: true,
              whitespace: true,
              message: t("login.validation.identifierRequired"),
            },
          ]}
        >
          <Input
            id="auth-login"
            size="large"
            prefix={<IdCard size={17} aria-hidden="true" />}
            placeholder={t("login.identifierPlaceholder")}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />
        </Form.Item>
        <Form.Item
          label={t("login.password")}
          name="password"
          className="auth-field"
          extra={<span aria-hidden="true" />}
          rules={[
            { required: true, message: t("login.validation.passwordRequired") },
          ]}
        >
          <Input.Password
            id="auth-password"
            size="large"
            prefix={<LockKeyhole size={16} aria-hidden="true" />}
            placeholder={t("login.passwordPlaceholder")}
            autoComplete="current-password"
          />
        </Form.Item>
        <div className="auth-form__options">
          <Link to="/forgot-password" className="auth-text-button">
            {t("login.forgotPassword")}
          </Link>
        </div>
        {errorMessage && (
          <div className="auth-form__error" role="alert">
            {errorMessage}
          </div>
        )}
        <button type="submit" className="auth-submit" disabled={isLoadingLogin}>
          {isLoadingLogin ? t("login.submitting") : t("login.submit")}
        </button>
      </Form>
      <div className="auth-divider">{t("login.or")}</div>
      <button
        type="button"
        className="auth-google"
        onClick={loginWithGoogle}
        disabled={isLoadingLogin}
      >
        <Icon name="googleIcon" />
        {t("login.googleLogin")}
      </button>

      <p className="auth-form__help">
        <strong>{t("login.accountHelpTitle")}</strong> {t("login.accountHelp")}
      </p>

      <p className="auth-form__switch">
        {t("login.noAccount")}{" "}
        <Link to="/register">{t("login.registerNow")}</Link>
      </p>
    </div>
  );
}
