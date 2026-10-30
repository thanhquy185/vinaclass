import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut, User } from "lucide-react";
import ThemeColorPicker from "@/app/layout/ThemeColorPicker";
import { Header as HeaderBar } from "@/app/layout/HeaderBar";
import {
  Button,
  Dropdown,
  DropdownItem,
  Icon,
  IdentityAvatar,
  Input,
} from "@/shared/components/ui";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useThemeStore } from "@/shared/stores/useThemeStore";
import { authService } from "@/features/auth/api/auth.service";

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function Header({
  isSidebarCollapsed,
  onToggleSidebar,
}: HeaderProps) {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language;
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const displayName =
    user?.profile.fullName?.trim() || user?.username || t("header.user");

  const toggleLanguage = () => {
    void i18n.changeLanguage(
      currentLanguage.toLowerCase().startsWith("vi") ? "en" : "vi",
    );
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Clear the local session even if the API is temporarily unavailable.
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <HeaderBar
      left={
        <div className="flex w-full min-w-0 items-center gap-3">
          <Button
            size="small"
            isButtonIcon
            aria-label={t(
              isSidebarCollapsed
                ? "sidebar.actions.expand"
                : "sidebar.actions.collapse",
            )}
            aria-expanded={!isSidebarCollapsed}
            aria-controls="primary-navigation"
            title={t(
              isSidebarCollapsed
                ? "sidebar.actions.expand"
                : "sidebar.actions.collapse",
            )}
            tooltip={t(
              isSidebarCollapsed
                ? "sidebar.actions.expand"
                : "sidebar.actions.collapse",
            )}
            onClick={onToggleSidebar}
            className="!h-10 !w-10 !shrink-0 !rounded-xl !border !border-other-divider !text-text-secondary !shadow-sm transition-all hover:!border-primary-main hover:!bg-action-hover hover:!text-primary-main focus-visible:!ring-2 focus-visible:!ring-primary-main"
          >
            {isSidebarCollapsed ? (
              <ChevronRight size={19} strokeWidth={2.25} aria-hidden="true" />
            ) : (
              <ChevronLeft size={19} strokeWidth={2.25} aria-hidden="true" />
            )}
          </Button>
          <div className="hidden w-full max-w-[360px] sm:block">
            <Input
              aria-label={t("header.search")}
              placeholder={t("header.search")}
              icon={<Icon name="search" size={20} />}
              className="h-10 bg-background-body-background transition-colors focus-within:border-primary-main"
            />
          </div>
        </div>
      }
      right={
        <>
          <div className="hidden items-center px-1 sm:flex">
            <ThemeColorPicker />
          </div>
          <Button
            size="small"
            isButtonIcon
            aria-label={t("header.actions.toggleLanguage")}
            onClick={toggleLanguage}
            tooltip={t("header.actions.toggleLanguage")}
            className="!h-10 !w-10 !text-text-secondary hover:!bg-action-hover"
          >
            <Icon name="translate" size={20} />
          </Button>
          <Button
            size="small"
            isButtonIcon
            aria-label={t("header.actions.toggleTheme")}
            onClick={toggleTheme}
            tooltip={t("header.actions.toggleTheme")}
            className="!h-10 !w-10 !text-text-secondary hover:!bg-action-hover"
          >
            {!isDarkMode ? (
              <Icon name="lightMode" size={20} />
            ) : (
              <Icon name="darkMode" size={20} />
            )}
          </Button>
          <Button
            size="small"
            isButtonIcon
            aria-label={t("header.actions.notifications")}
            onClick={() => navigate("/notifications")}
            tooltip={t("header.actions.notifications")}
            className="!h-10 !w-10 !text-text-secondary hover:!bg-action-hover"
          >
            <Icon name="notificationsNone" size={20} />
          </Button>
          <Dropdown
            align="right"
            trigger={
              <Button
                aria-label={t("header.menu.account")}
                tooltip={t("header.menu.account")}
                className="!h-11 !gap-2 !rounded-full !px-1.5 text-left hover:!bg-action-hover sm:!px-2"
              >
                <IdentityAvatar
                  name={displayName}
                  avatarUrl={user?.profile.avatarUrl}
                  size="small"
                  className="!h-8 !w-8"
                />
                <span className="hidden max-w-36 flex-col items-start text-left leading-tight md:flex">
                  <span className="max-w-full truncate text-xs font-semibold text-text-primary">
                    {displayName}
                  </span>
                  <span className="max-w-full truncate text-[10px] text-text-secondary">
                    {user?.email ?? t("header.user")}
                  </span>
                </span>
                <Icon
                  name="arrowDown"
                  size={14}
                  className="hidden text-text-disabled md:block"
                />
              </Button>
            }
          >
            <div className="border-b border-other-divider px-4 py-3">
              <p className="text-body-2 truncate font-semibold text-text-primary">
                {displayName}
              </p>
              {user?.email && (
                <p className="text-caption mt-1 truncate text-text-secondary">
                  {user.email}
                </p>
              )}
            </div>
            <div className="text-caption px-4 pt-3 uppercase tracking-wide text-text-disabled">
              {t("header.menu.title")}
            </div>
            <DropdownItem
              icon={<User size={16} />}
              onClick={() => navigate("/profile")}
            >
              {t("header.menu.profile")}
            </DropdownItem>
            <div className="my-1 border-t border-other-divider" />
            <DropdownItem
              variant="error"
              icon={<LogOut size={16} />}
              onClick={() => void handleLogout()}
            >
              {t("header.menu.logout")}
            </DropdownItem>
          </Dropdown>
        </>
      }
    />
  );
}
