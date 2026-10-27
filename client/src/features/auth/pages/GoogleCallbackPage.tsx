import { Button, Result, Spin, Typography } from "antd";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthTemplate from "@/features/auth/components/AuthTemplate";
import { useGoogleAuth } from "@/features/auth/hooks/useGoogleAuth";

export default function GoogleCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { handleGoogleCallback, error } = useGoogleAuth();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    void handleGoogleCallback();
  }, [handleGoogleCallback]);

  return (
    <AuthTemplate>
      {error ? (
        <Result
          status="error"
          title={t("googleAuth.callback.errorTitle")}
          subTitle={error}
          extra={
            <Button type="primary" onClick={() => navigate("/login")}>
              {t("googleAuth.callback.backToLogin")}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <Spin size="large" />
          <div className="flex flex-col gap-2">
            <Typography.Title level={4} className="!mb-0">
              {t("googleAuth.callback.loadingTitle")}
            </Typography.Title>
            <Typography.Text type="secondary">
              {t("googleAuth.callback.loadingDescription")}
            </Typography.Text>
          </div>
        </div>
      )}
    </AuthTemplate>
  );
}
