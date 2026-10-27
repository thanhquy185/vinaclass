import type { RouteObject } from "react-router-dom";
import PermissionRoute from "@/features/authorization/components/PermissionRoute";
import { lazyRoutePage } from "@/app/routing/lazyRoutePage";

const DifficultyLevelPage = lazyRoutePage(
  () => import("@/features/catalogs/pages/DifficultyLevelPage")
);
const SubjectPage = lazyRoutePage(() =>
  import("@/features/catalogs/pages/SubjectPage").then(({ SubjectPage }) => ({
    default: SubjectPage,
  }))
);

export const catalogRoutes: RouteObject[] = [
  {
    path: "difficulty-level",
    element: (
      <PermissionRoute functionName="do_kho">
        <DifficultyLevelPage />
      </PermissionRoute>
    ),
  },
  {
    path: "subjects",
    element: <PermissionRoute functionName="mon_hoc" />,
    children: [{ index: true, element: <SubjectPage /> }],
  },
];
