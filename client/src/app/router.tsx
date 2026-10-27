import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router-dom";
import App from "@/app/App";
import { lazyRoutePage } from "@/app/routing/lazyRoutePage";
import { MainLayout } from "@/app/layout/MainLayout";
import ErrorPage from "@/app/pages/ErrorPage";
import NotFoundPage from "@/app/pages/NotFoundPage";
import ProtectedRoute from "@/app/ProtectedRoute";
import { assessmentRoutes } from "@/features/assessments/routes";
import { authorizationRoutes } from "@/features/authorization/routes";
import { catalogRoutes } from "@/features/catalogs/routes";
import { classroomRoutes } from "@/features/classrooms/routes";
import { identityRoutes } from "@/features/identity/routes";
import { questionBankRoutes } from "@/features/question-bank/routes";
import { teacherAssignmentRoutes } from "@/features/teacher-assignments/routes";
import ErrorBoundaryTestPage from "@/pages/ErrorBoundaryTestPage/ErrorBoundaryTestPage";
import TestDesignSystem from "@/pages/TestDesignSystem/TestDesignSystem";

const HomePage = lazyRoutePage(() => import("@/app/pages/HomePage"));
const AdminDashboardPage = lazyRoutePage(() =>
  import("@/features/admin/pages/AdminDashboardPage").then(
    ({ AdminDashboardPage }) => ({ default: AdminDashboardPage })
  )
);
const AdminStatisticsPage = lazyRoutePage(
  () => import("@/features/admin/pages/AdminStatisticsPage")
);
const GoogleCallback = lazyRoutePage(
  () => import("@/features/auth/pages/GoogleCallbackPage")
);
const LoginPage = lazyRoutePage(
  () => import("@/features/auth/pages/LoginPage")
);
const RegisterPage = lazyRoutePage(
  () => import("@/features/auth/pages/RegisterPage")
);

const developmentRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      { path: "test-design-system", element: <TestDesignSystem /> },
      { path: "error-page", element: <ErrorBoundaryTestPage /> },
    ]
  : [];

const mainApplicationRoutes: RouteObject[] = [
  { index: true, element: <HomePage /> },
  { path: "dashboard", element: <AdminDashboardPage /> },
  {
    path: "statistics",
    element: <Navigate to="/statistics/learning-outcomes" replace />,
  },
  { path: "statistics/:report", element: <AdminStatisticsPage /> },
  ...catalogRoutes,
  ...classroomRoutes,
  ...questionBankRoutes,
  ...identityRoutes,
  ...teacherAssignmentRoutes,
  ...assessmentRoutes,
  ...authorizationRoutes,
  ...developmentRoutes,
];

export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: mainApplicationRoutes,
          },
        ],
      },
      { path: "auth/callback", element: <GoogleCallback /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
