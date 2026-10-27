import type { RouteObject } from "react-router-dom";
import PermissionRoute from "@/features/authorization/components/PermissionRoute";
import { lazyRoutePage } from "@/app/routing/lazyRoutePage";

const PermissionGroupPage = lazyRoutePage(() =>
  import("@/features/authorization/pages/PermissionGroupPage").then(
    ({ PermissionGroupPage }) => ({ default: PermissionGroupPage })
  )
);
const PermissionMatrixPage = lazyRoutePage(() =>
  import("@/features/authorization/pages/PermissionMatrixPage").then(
    ({ PermissionMatrixPage }) => ({ default: PermissionMatrixPage })
  )
);

export const authorizationRoutes: RouteObject[] = [
  {
    path: "permission-groups",
    element: <PermissionRoute functionName="nhom_quyen" />,
    children: [{ index: true, element: <PermissionGroupPage /> }],
  },
  {
    path: "permission-matrix",
    element: <PermissionRoute functionName="ma_tran_quyen" />,
    children: [{ index: true, element: <PermissionMatrixPage /> }],
  },
];
