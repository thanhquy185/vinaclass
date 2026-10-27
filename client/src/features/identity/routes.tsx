import type { RouteObject } from "react-router-dom";
import PermissionRoute from "@/features/authorization/components/PermissionRoute";
import { lazyRoutePage } from "@/app/routing/lazyRoutePage";

const UserPage = lazyRoutePage(() =>
  import("@/features/identity/pages/UserPage").then(({ UserPage }) => ({
    default: UserPage,
  }))
);
const ProfilePage = lazyRoutePage(
  () => import("@/features/identity/pages/ProfilePage")
);

export const identityRoutes: RouteObject[] = [
  { path: "profile", element: <ProfilePage /> },
  {
    path: "users",
    element: <PermissionRoute functionName="nguoi_dung" />,
    children: [{ index: true, element: <UserPage /> }],
  },
];
