import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "../../atoms";
import Logo from "../../molecules/Logo/Logo";
import { useAuthStore } from "@/stores/auth.store";
import type { RoleDetailItem, SidebarSection } from "@/types";

const SIDEBAR_SECTIONS_STUDENT: SidebarSection[] = [
  {
    title: "sidebar.sections.student",
    items: [
      {
        icon: "users",
        labelKey: "sidebar.items.courses",
        to: "/courses",
        permission: "public",
      },
      {
        icon: "calendar",
        labelKey: "sidebar.items.exams",
        to: "/exams",
        permission: "public",
      },
    ],
  },
];

const SIDEBAR_SECTIONS_TEACHER: SidebarSection[] = [
  {
    title: "sidebar.sections.management",
    items: [
      {
        icon: "clipboard",
        labelKey: "sidebar.items.courseGroup",
        to: "/course-group",
        permission: "hoc_phan",
      },
      {
        icon: "layers",
        labelKey: "sidebar.items.difficultyLevel",
        to: "/difficulty-level",
        permission: "do_kho",
      },
      {
        icon: "question",
        labelKey: "sidebar.items.questions",
        to: "/question",
        permission: "cau_hoi",
      },
      {
        icon: "user",
        labelKey: "sidebar.items.users",
        to: "/users",
        permission: "nguoi_dung",
      },
      {
        icon: "folder",
        labelKey: "sidebar.items.subjects",
        to: "/subjects",
        permission: "mon_hoc",
      },
      {
        icon: "refresh",
        labelKey: "sidebar.items.assignments",
        to: "/assignments",
        permission: "phan_cong",
      },
      {
        icon: "documentDuplicate",
        labelKey: "sidebar.items.tests",
        to: "/tests",
        permission: "de_thi",
      },
      {
        icon: "massage",
        labelKey: "sidebar.items.notifications",
        to: "/notifications",
        permission: "thong_bao",
      },
    ],
  },
  {
    title: "sidebar.sections.admin",
    items: [
      {
        icon: "groupUser",
        labelKey: "sidebar.items.permissionGroups",
        to: "/permission-groups",
        permission: "nhom_quyen",
      },
    ],
  },
];
const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: null,
    items: [
      {
        icon: "home",
        labelKey: "sidebar.overview",
        to: "/dashboard",
        permission: "public",
      },
    ],
  },
  {
    title: "sidebar.sections.management",
    items: [
      {
        icon: "clipboard",
        labelKey: "sidebar.items.courseGroup",
        to: "/course-group",
        permission: "hoc_phan",
      },
      {
        icon: "layers",
        labelKey: "sidebar.items.difficultyLevel",
        to: "/difficulty-level",
        permission: "do_kho",
      },
      {
        icon: "question",
        labelKey: "sidebar.items.questions",
        to: "/question",
        permission: "cau_hoi",
      },
      {
        icon: "user",
        labelKey: "sidebar.items.users",
        to: "/users",
        permission: "nguoi_dung",
      },
      {
        icon: "folder",
        labelKey: "sidebar.items.subjects",
        to: "/subjects",
        permission: "mon_hoc",
      },
      {
        icon: "refresh",
        labelKey: "sidebar.items.assignments",
        to: "/assignments",
        permission: "phan_cong",
      },
      {
        icon: "documentDuplicate",
        labelKey: "sidebar.items.tests",
        to: "/tests",
        permission: "de_thi",
      },
      {
        icon: "massage",
        labelKey: "sidebar.items.notifications",
        to: "/notifications",
        permission: "thong_bao",
      },
    ],
  },
  {
    title: "sidebar.sections.admin",
    items: [
      {
        icon: "groupUser",
        labelKey: "sidebar.items.permissionGroups",
        to: "/permission-groups",
        permission: "nhom_quyen",
      },
    ],
  },
];

const filterRole = (
  roleDetails: RoleDetailItem[],
  baseList: SidebarSection[]
): SidebarSection[] => {
  return baseList
    .map((section) => {
      const filteredItems = section.items.filter((item) => {
        // Public thì luôn cho xem
        if (item.permission === "public") return true;

        // Tìm quyền tương ứng
        const role = roleDetails.find(
          (r) => r.functionName === item.permission
        );

        // Chỉ hiển thị nếu có quyền xem
        return role?.canView === true;
      });

      return {
        ...section,
        items: filteredItems,
      };
    })
    .filter((section) => section.items.length > 0); // bỏ section rỗng
};

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();
  const { user, role } = useAuthStore();

  // const userRole =
  //   !user && !role
  //     ? []
  //     : user?.isStudent
  //       ? SIDEBAR_SECTIONS_STUDENT
  //       : filterRole(role ? role.role_details : []);

  let userRole: SidebarSection[] = [];

  if (!user && !role) {
    userRole = [];
  } else if (user?.isStudent) {
    userRole = SIDEBAR_SECTIONS_STUDENT;
  } else if (role?.roleName === "teacher") {
    const roleDetails = role ? role.roleDetails : [];
    userRole = filterRole(roleDetails, SIDEBAR_SECTIONS_TEACHER);
  } else {
    const roleDetails = role ? role.roleDetails : [];
    userRole = filterRole(roleDetails, SIDEBAR_SECTIONS);
  }

  return (
    <div
      className={`flex h-screen flex-col ${isCollapsed ? "w-fit" : "min-w-[260px] max-w-[260px]"}`}
    >
      {/* Header */}
      <div className={`relative flex justify-between p-3`}>
        {!isCollapsed && <Logo />}
        <Button
          className={(isCollapsed && "rotate-180") + ""}
          onClick={() => {
            setIsCollapsed(!isCollapsed);
          }}
        >
          <Icon name="menuArrow" size={22} />
        </Button>
      </div>

      {/* Menu */}
      <div
        className={`flex flex-1 flex-col pt-0 ${isCollapsed && "justify-center"}`}
      >
        {userRole.map((item, idx) => {
          if (!item.title) {
            const child = item.items[0];
            return (
              <div key={idx} className="px-3">
                <NavLink to={child.to}>
                  {({ isActive }) => (
                    <Button
                      className={`w-full ${isActive && "bg-primary-background text-primary-main"}`}
                      tooltip={isCollapsed ? t(child.labelKey) : undefined}
                    >
                      <Icon name={child.icon} className="shrink-0" />
                      {!isCollapsed && t(child.labelKey)}
                    </Button>
                  )}
                </NavLink>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className={`${!isCollapsed && "mt-4"} flex flex-col gap-0.5`}
            >
              {!isCollapsed && (
                <div className="flex items-center gap-4">
                  <span className="h-0.5 w-4 bg-other-divider" />
                  <span className="text-caption overflow-hidden text-nowrap text-text-disabled">
                    {t(item.title)}
                  </span>
                </div>
              )}

              <div className="m-3 flex flex-col gap-1">
                {item.items.map((child, childIdx) => (
                  <NavLink key={childIdx} to={child.to}>
                    {({ isActive }) => (
                      <Button
                        className={`w-full ${isActive && "bg-action-selected text-primary-main"}`}
                        tooltip={isCollapsed ? t(child.labelKey) : undefined}
                      >
                        <Icon name={child.icon} className="shrink-0" />
                        {!isCollapsed && t(child.labelKey)}
                      </Button>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
