import type { RouteObject } from "react-router-dom";
import PermissionRoute from "@/features/authorization/components/PermissionRoute";
import { lazyRoutePage } from "@/app/routing/lazyRoutePage";

const AssignmentPage = lazyRoutePage(() =>
  import("@/features/teacher-assignments/pages/AssignmentPage").then(
    ({ AssignmentPage }) => ({ default: AssignmentPage })
  )
);

export const teacherAssignmentRoutes: RouteObject[] = [
  {
    path: "assignments",
    element: <PermissionRoute functionName="phan_cong" />,
    children: [{ index: true, element: <AssignmentPage /> }],
  },
];
