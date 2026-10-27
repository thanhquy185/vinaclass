import {
  Alert,
  Button,
  Card,
  Collapse,
  Result,
  Space,
  Tag,
  Typography,
} from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export interface ErrorScreenAction {
  key: string;
  label: ReactNode;
  onClick: () => void;
  primary?: boolean;
}

export interface ErrorScreenDiagnostic {
  key: string;
  label: ReactNode;
  content: string;
}

interface ErrorScreenProps {
  title: ReactNode;
  subtitle: ReactNode;
  message: ReactNode;
  status?: string;
  diagnostics?: ErrorScreenDiagnostic[];
  actions: ErrorScreenAction[];
  helpText: ReactNode;
}

export default function ErrorScreen({
  title,
  subtitle,
  message,
  status,
  diagnostics = [],
  actions,
  helpText,
}: ErrorScreenProps) {
  const { t } = useTranslation("common");
  const diagnosticItems = diagnostics
    .filter((diagnostic) => diagnostic.content.trim().length > 0)
    .map((diagnostic) => ({
      key: diagnostic.key,
      label: diagnostic.label,
      children: (
        <pre className="m-0 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-xs">
          {diagnostic.content}
        </pre>
      ),
    }));

  return (
    <main className="flex min-h-screen items-center justify-center bg-background-body-background p-4">
      <Card className="w-full max-w-3xl shadow-sm">
        {status && (
          <div className="mb-2 flex items-center justify-center gap-2">
            <Typography.Text type="secondary">
              {t("errorScreen.statusLabel")}
            </Typography.Text>
            <Tag color="error">{status}</Tag>
          </div>
        )}

        <Result
          status="error"
          title={title}
          subTitle={subtitle}
          extra={
            <Space wrap>
              {actions.map((action) => (
                <Button
                  key={action.key}
                  type={action.primary ? "primary" : "default"}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </Space>
          }
        />

        <Alert
          className="mb-4"
          type="error"
          showIcon
          message={t("errorScreen.messageLabel")}
          description={
            <Typography.Text className="break-all font-mono text-sm">
              {message}
            </Typography.Text>
          }
        />

        {diagnosticItems.length > 0 && (
          <Collapse
            className="mb-4"
            defaultActiveKey={diagnosticItems.map((item) => item.key)}
            items={diagnosticItems}
          />
        )}

        <Typography.Paragraph className="mb-0 text-center" type="secondary">
          {helpText}
        </Typography.Paragraph>
      </Card>
    </main>
  );
}
