import LoginPage from "@/pages/LoginPage/LoginPage";
import RegisterPage from "@/pages/RegisterPage/RegisterPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import ErrorPage from "@/pages/ErrorPage/ErrorPage";
import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "@/components/atomic/templates/MainLayout/MainLayout";
import { DashboardPage } from "@/pages/DashboardPage/DashboardPage";
import App from "@/App";
import HomePage from "@/pages/HomePage/HomePage";
import ErrorBoundaryTestPage from "@/pages/ErrorBoundaryTestPage/ErrorBoundaryTestPage";
import { CoursePage } from "@/pages/CoursePage/CoursePage";
import { ExamPage } from "@/pages/ExamPage/ExamPage";
import { CourseGroupPage } from "@/pages/CourseGroupPage/CourseGroupPage";
import { CourseGroupStudentPage } from "@/pages/CourseGroupStudentPage/CourseGroupStudentPage";
import { QuestionPage } from "@/pages/QuestionPage/QuestionPage";
import { UserPage } from "@/pages/UserPage/UserPage";
import { SubjectPage } from "@/pages/SubjectPage/SubjectPage";
import { AssignmentPage } from "@/pages/AssignmentPage/AssignmentPage";
import { TestPage } from "@/pages/TestPage/TestPage";
import { NotificationPage } from "@/pages/NotificationPage/NotificationPage";
import { PermissionGroupPage } from "@/pages/PermissionGroupPage/PermissionGroupPage";
import TestDesignSystem from "@/pages/TestDesignSystem/TestDesignSystem";
import AddQuestionTestPage from "@/pages/AddQuestionTestPage/AddQuestionTestPage";
import CourseElement from "@/pages/CourseElement/CourseElement";
import ResultPage from "@/pages/ResultPage/ResultPage";
import DoTestPage from "@/pages/DoTestPage/DoTestPage";
import ResultDoTestPage from "@/pages/ResultDoTestPage/ResultDoTestPage";
import { ExamInstruction } from "@/components/atomic/organisms/ExamInstruction/ExamInstruction";
import { ExamDoing } from "@/components/atomic/organisms/ExamDoing/ExamDoing";
import ProtectedRoute from "./ProtectedRoute";
import TestDetailPage from "@/pages/TestDetailPage/TestDetailPage";
import TestFormPage from "@/pages/TestFormPage/TestFormPage";
import ProfilePage from "@/pages/ProfilePage/ProfilePage";
import DifficultyLevelPage from "@/pages/DifficultyLevelPage/DifficultyLevelPage";
import GoogleCallback from "@/pages/GoogleCallbackPage/GoogleCallbackPage";

export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <ProtectedRoute />, // Bọc tất cả children bên dưới
        children: [
          {
            element: <MainLayout />,
            children: [
              { path: "/", element: <HomePage /> },
              { path: "/profile", element: <ProfilePage /> },
              { path: "/difficulty-level", element: <DifficultyLevelPage /> },
              { path: "/dashboard", element: <DashboardPage /> },
              {
                path: "/courses",
                children: [
                  { index: true, element: <CoursePage /> },
                  { path: ":id", element: <CourseElement /> },
                ],
              },
              { path: "/exams", element: <ExamPage /> },
              {
                path: "/course-group",
                children: [
                  { index: true, element: <CourseGroupPage /> },
                  {
                    path: ":courseId/groups/:groupId/students",
                    element: <CourseGroupStudentPage />,
                  },
                ],
              },
              { path: "/question", element: <QuestionPage /> },
              { path: "/users", element: <UserPage /> },
              { path: "/subjects", element: <SubjectPage /> },
              { path: "/assignments", element: <AssignmentPage /> },
              {
                path: "/tests",
                children: [
                  { index: true, element: <TestPage /> },
                  {
                    path: ":id",
                    children: [
                      { index: true, element: <TestDetailPage /> },
                      { path: "result/:id", element: <ResultPage /> },
                      {
                        path: "edit",
                        children: [
                          { index: true, element: <TestFormPage /> }, // Xem thông tin chung
                          {
                            path: "questions",
                            element: <AddQuestionTestPage />,
                          }, // Xem danh sách câu hỏi
                        ],
                      },
                      {
                        path: "view",
                        children: [
                          { index: true, element: <TestFormPage /> }, // Xem thông tin chung
                          {
                            path: "questions",
                            element: <AddQuestionTestPage />,
                          }, // Xem danh sách câu hỏi
                        ],
                      },
                      {
                        path: "take",
                        element: <DoTestPage />,
                        children: [
                          { index: true, element: <ExamInstruction /> },
                          { path: "doing", element: <ExamDoing /> },
                          {
                            path: "result/:attemptId",
                            element: <ResultDoTestPage />,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    path: "add",
                    children: [
                      { index: true, element: <TestFormPage /> },
                      {
                        path: "questions",
                        element: <AddQuestionTestPage />,
                      },
                    ],
                  },
                ],
              },
              { path: "/notifications", element: <NotificationPage /> },
              { path: "/permission-groups", element: <PermissionGroupPage /> },
              { path: "/test-design-system", element: <TestDesignSystem /> },
              { path: "/error-page", element: <ErrorBoundaryTestPage /> },
            ],
          },
        ],
      },

      { path: "/auth/callback", element: <GoogleCallback /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
