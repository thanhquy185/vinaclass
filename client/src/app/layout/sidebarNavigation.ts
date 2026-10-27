import type {
  PermissionNavigationNode,
  PermissionNavigationResponse,
  RoleDetailItem,
  SidebarItem,
  SidebarSection,
} from "@/shared/types";
import { flattenPermissionNavigation } from "@/features/authorization/utils/navigationTree";

const NAVIGATION_PRESENTATION: Record<
  string,
  {
    icon: string;
    labelKey: string;
    paths: { ADMIN?: string; TEACHER?: string; STUDENT?: string };
  }
> = {
  "class-groups": {
    icon: "clipboard",
    labelKey: "sidebar.items.courseGroup",
    paths: {
      ADMIN: "/course-group",
      TEACHER: "/course-group",
      STUDENT: "/courses",
    },
  },
  "difficulty-levels": {
    icon: "layers",
    labelKey: "sidebar.items.difficultyLevel",
    paths: { ADMIN: "/difficulty-level", TEACHER: "/difficulty-level" },
  },
  questions: {
    icon: "question",
    labelKey: "sidebar.items.questions",
    paths: { ADMIN: "/question", TEACHER: "/question" },
  },
  users: {
    icon: "user",
    labelKey: "sidebar.items.users",
    paths: { ADMIN: "/users", TEACHER: "/users" },
  },
  subjects: {
    icon: "folder",
    labelKey: "sidebar.items.subjects",
    paths: { ADMIN: "/subjects", TEACHER: "/subjects" },
  },
  assignments: {
    icon: "refresh",
    labelKey: "sidebar.items.assignments",
    paths: { ADMIN: "/assignments", TEACHER: "/assignments" },
  },
  exams: {
    icon: "documentDuplicate",
    labelKey: "sidebar.items.tests",
    paths: { ADMIN: "/tests", TEACHER: "/tests", STUDENT: "/exams" },
  },
  notifications: {
    icon: "massage",
    labelKey: "sidebar.items.notifications",
    paths: {
      ADMIN: "/notifications",
      TEACHER: "/notifications",
      STUDENT: "/notifications",
    },
  },
  "permission-groups": {
    icon: "groupUser",
    labelKey: "sidebar.items.permissionGroups",
    paths: { ADMIN: "/permission-groups" },
  },
  "permission-matrix": {
    icon: "lock",
    labelKey: "sidebar.items.permissionMatrix",
    paths: { ADMIN: "/permission-matrix" },
  },
  "learning-statistics": {
    icon: "chartBar",
    labelKey: "statistics.items.learningOutcomes",
    paths: { ADMIN: "/statistics/learning-outcomes" },
  },
  "exam-statistics": {
    icon: "calendar",
    labelKey: "statistics.items.examActivity",
    paths: { ADMIN: "/statistics/exams" },
  },
  "class-statistics": {
    icon: "users",
    labelKey: "statistics.items.classEnrollment",
    paths: { ADMIN: "/statistics/classes" },
  },
  "question-statistics": {
    icon: "question",
    labelKey: "statistics.items.questionBank",
    paths: { ADMIN: "/statistics/questions" },
  },
};

const NAVIGATION_SECTION_TITLES: Record<string, string> = {
  training_section: "sidebar.sections.training",
  learning_section: "sidebar.sections.learning",
  access_section: "sidebar.sections.access",
  communication_section: "sidebar.sections.communication",
  analytics_section: "sidebar.sections.analytics",
  management_section: "sidebar.sections.management",
  admin_section: "sidebar.sections.admin",
};

const getLocalizedName = (
  node: PermissionNavigationNode,
  language: string
): string | undefined =>
  language.toLowerCase().startsWith("en")
    ? (node.nameEn ?? undefined)
    : (node.nameVi ?? undefined);

const toSidebarItem = (
  node: PermissionNavigationNode,
  roleCode: string,
  language: string
): SidebarItem | null => {
  if (!node.routeKey || !node.actionCodes.includes("VIEW")) return null;

  const presentation = NAVIGATION_PRESENTATION[node.routeKey];
  const pathRoleCode =
    roleCode === "TEACHER" || roleCode === "STUDENT"
      ? roleCode
      : roleCode
        ? "ADMIN"
        : null;
  const path = pathRoleCode ? presentation?.paths[pathRoleCode] : undefined;
  if (!presentation || !path) return null;

  return {
    icon: presentation.icon,
    labelKey: presentation.labelKey,
    labelText: getLocalizedName(node, language),
    to: path,
    permission: node.functionName,
  };
};

const collectSidebarItems = (
  nodes: PermissionNavigationNode[],
  roleCode: string,
  language: string
): SidebarItem[] =>
  flattenPermissionNavigation(nodes).flatMap((node) => {
    const item = toSidebarItem(node, roleCode, language);
    return item ? [item] : [];
  });

const buildPermissionNavigation = (
  navigation: PermissionNavigationResponse,
  language: string
): SidebarSection[] => {
  const roleCode = navigation.roleCode?.trim().toUpperCase() ?? "";
  if (!roleCode || roleCode === "STUDENT") return [];

  if (roleCode === "TEACHER") {
    const teacherItems = flattenPermissionNavigation(navigation.items)
      .filter(
        (node) =>
          ["cau_hoi", "de_thi"].includes(node.functionName) &&
          node.routeKey &&
          node.actionCodes.includes("VIEW")
      )
      .flatMap((node) => {
        const item = toSidebarItem(node, roleCode, language);
        return item ? [item] : [];
      });

    return teacherItems.length > 0
      ? [{ title: "sidebar.sections.learning", items: teacherItems }]
      : [];
  }

  const sections: SidebarSection[] = navigation.items.flatMap((node) => {
    const items = collectSidebarItems([node], roleCode, language);
    if (items.length === 0) return [];
    const sectionTitleKey = NAVIGATION_SECTION_TITLES[node.functionName];

    return [
      {
        title: sectionTitleKey ?? null,
        titleText: sectionTitleKey
          ? getLocalizedName(node, language)
          : undefined,
        items,
      },
    ];
  });

  if (roleCode === "ADMIN") {
    sections.unshift({
      title: null,
      items: [
        {
          icon: "home",
          labelKey: "sidebar.overview",
          to: "/dashboard",
          permission: "public",
        },
      ],
    });
  }

  return sections;
};

const SIDEBAR_SECTIONS_ADMIN: SidebarSection[] = [
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
    title: "sidebar.sections.analytics",
    items: [
      {
        icon: "chartBar",
        labelKey: "statistics.items.learningOutcomes",
        to: "/statistics/learning-outcomes",
        permission: "thong_ke_ket_qua",
      },
      {
        icon: "calendar",
        labelKey: "statistics.items.examActivity",
        to: "/statistics/exams",
        permission: "thong_ke_de_thi",
      },
      {
        icon: "users",
        labelKey: "statistics.items.classEnrollment",
        to: "/statistics/classes",
        permission: "thong_ke_lop_hoc",
      },
      {
        icon: "question",
        labelKey: "statistics.items.questionBank",
        to: "/statistics/questions",
        permission: "thong_ke_cau_hoi",
      },
    ],
  },
  {
    title: "sidebar.sections.training",
    items: [
      {
        icon: "clipboard",
        labelKey: "sidebar.items.courseGroup",
        to: "/course-group",
        permission: "hoc_phan",
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
    ],
  },
  {
    title: "sidebar.sections.learning",
    items: [
      {
        icon: "question",
        labelKey: "sidebar.items.questions",
        to: "/question",
        permission: "cau_hoi",
      },
      {
        icon: "layers",
        labelKey: "sidebar.items.difficultyLevel",
        to: "/difficulty-level",
        permission: "do_kho",
      },
      {
        icon: "documentDuplicate",
        labelKey: "sidebar.items.tests",
        to: "/tests",
        permission: "de_thi",
      },
    ],
  },
  {
    title: "sidebar.sections.access",
    items: [
      {
        icon: "user",
        labelKey: "sidebar.items.users",
        to: "/users",
        permission: "nguoi_dung",
      },
      {
        icon: "groupUser",
        labelKey: "sidebar.items.permissionGroups",
        to: "/permission-groups",
        permission: "nhom_quyen",
      },
      {
        icon: "lock",
        labelKey: "sidebar.items.permissionMatrix",
        to: "/permission-matrix",
        permission: "ma_tran_quyen",
      },
    ],
  },
  {
    title: "sidebar.sections.communication",
    items: [
      {
        icon: "massage",
        labelKey: "sidebar.items.notifications",
        to: "/notifications",
        permission: "thong_bao",
      },
    ],
  },
];

const filterRole = (
  roleDetails: RoleDetailItem[],
  baseList: SidebarSection[],
  roleCode: string
): SidebarSection[] => {
  return baseList
    .map((section) => {
      const filteredItems = section.items.filter((item) => {
        // The overview is an ADMIN workspace entry, not a function grant.
        if (item.permission === "public") return roleCode === "ADMIN";

        // Find the matching function permission.
        const role = roleDetails.find(
          (r) => r.functionName === item.permission
        );

        // Show the item only when view access is granted.
        return role?.canView === true;
      });

      return {
        ...section,
        items: filteredItems,
      };
    })
    .filter((section) => section.items.length > 0);
};

const TEACHER_SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: "sidebar.sections.learning",
    items: [
      {
        icon: "question",
        labelKey: "sidebar.items.questions",
        to: "/question",
        permission: "cau_hoi",
      },
      {
        icon: "documentDuplicate",
        labelKey: "sidebar.items.tests",
        to: "/tests",
        permission: "de_thi",
      },
    ],
  },
];

interface SidebarNavigationOptions {
  permissionNavigationEnabled: boolean;
  navigation?: PermissionNavigationResponse | null;
  hasSession: boolean;
  roleCode: string | null;
  roleDetails: RoleDetailItem[];
  language: string;
}

export const resolveSidebarSections = ({
  permissionNavigationEnabled,
  navigation,
  hasSession,
  roleCode,
  roleDetails,
  language,
}: SidebarNavigationOptions): SidebarSection[] => {
  if (!hasSession || roleCode === "STUDENT") {
    return [];
  }

  if (permissionNavigationEnabled) {
    if (navigation) return buildPermissionNavigation(navigation, language);
    if (roleCode === "TEACHER") return [];
  }

  if (roleCode === "TEACHER") {
    return filterRole(roleDetails, TEACHER_SIDEBAR_SECTIONS, roleCode);
  }

  if (roleCode === "ADMIN") {
    return filterRole(roleDetails, SIDEBAR_SECTIONS_ADMIN, roleCode);
  }
  if (roleCode) {
    return filterRole(roleDetails, SIDEBAR_SECTIONS_ADMIN, roleCode);
  }

  return [];
};
