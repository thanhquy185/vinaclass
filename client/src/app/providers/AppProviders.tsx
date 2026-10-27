import {
  App as AntDesignApp,
  ConfigProvider,
  theme as antDesignTheme,
} from "antd";
import enUS from "antd/locale/en_US";
import viVN from "antd/locale/vi_VN";
import type { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { PRIMARY_COLORS, useThemeStore } from "@/shared/stores/useThemeStore";

export function AppProviders({ children }: PropsWithChildren) {
  const { isDarkMode, primaryColor } = useThemeStore();
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const selectedColor = PRIMARY_COLORS.find(
    (color) => color.key === primaryColor
  );
  return (
    <ConfigProvider
      locale={language.toLowerCase().startsWith("en") ? enUS : viVN}
      theme={{
        algorithm: isDarkMode
          ? antDesignTheme.darkAlgorithm
          : antDesignTheme.defaultAlgorithm,
        token: {
          colorPrimary: selectedColor?.hex ?? PRIMARY_COLORS[0].hex,
          borderRadius: 8,
          fontFamily: "Inter, sans-serif",
        },
      }}
    >
      <AntDesignApp>{children}</AntDesignApp>
    </ConfigProvider>
  );
}
