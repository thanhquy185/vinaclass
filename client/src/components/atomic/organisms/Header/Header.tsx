import { Header as HeaderBar } from "../../molecules/Header/Header";
import { Button, ColorPicker, Icon, Input } from "../../atoms";
import { useThemeStore } from "@/stores/theme.store";
import { useTranslation } from "react-i18next";
import { Dropdown, DropdownItem } from "../../molecules/Dropdown/Dropdown";
import { LogOut, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import { getDefaultAvatar } from "@/utils";

export default function Header() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { t, i18n } = useTranslation();
  const navi = useNavigate();

  const { logout, user } = useAuthStore();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "vi" ? "en" : "vi");
  };
  return (
    <HeaderBar
      left={
        <Input placeholder={t("header.search")} icon={<Icon name="search" />} />
      }
      right={
        <>
          <ColorPicker />
          <Button
            size={"small"}
            onClick={toggleLanguage}
            title={t("navigation.lang")}
            tooltip={t("header.actions.toggleLanguage")}
          >
            <Icon name="translate" />
          </Button>
          <Button
            size={"small"}
            onClick={toggleTheme}
            tooltip={t("header.actions.toggleTheme")}
          >
            {!isDarkMode ? <Icon name="lightMode" /> : <Icon name="darkMode" />}
          </Button>
          <Button size={"small"}>
            <Icon name="notificationsNone" />
          </Button>
          <Dropdown
            align="right"
            trigger={
              <Button className="!p-0">
                <img
                  src={getDefaultAvatar(user?.fullName || "user")}
                  alt="avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
              </Button>
            }
          >
            {/* Header nhỏ sử dụng Typography text-table-header và màu disabled */}
            <div className="text-table-header px-4 py-2 uppercase text-text-disabled">
              {t("header.menu.title")}
            </div>

            <DropdownItem
              icon={<User size={16} />}
              onClick={() => navi("profile")}
            >
              {t("header.menu.profile")}
            </DropdownItem>

            <div className="my-1 border-t border-other-divider" />

            <DropdownItem
              variant="error"
              icon={<LogOut size={16} />}
              onClick={logout}
            >
              {t("header.menu.logout")}
            </DropdownItem>
          </Dropdown>
        </>
      }
    />
  );
}
