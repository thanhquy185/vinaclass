import type { RouteObject } from "react-router-dom";
import PermissionRoute from "@/features/authorization/components/PermissionRoute";
import { lazyRoutePage } from "@/app/routing/lazyRoutePage";

const AddQuestionTestPage = lazyRoutePage(
  () => import("@/features/assessments/pages/AddQuestionTestPage"),
);
const DoTestPage = lazyRoutePage(
  () => import("@/features/assessments/pages/DoTestPage"),
);
const ExamPage = lazyRoutePage(() =>
  import("@/features/assessments/pages/ExamPage").then(({ ExamPage }) => ({
    default: ExamPage,
  })),
);
const ResultDoTestPage = lazyRoutePage(
  () => import("@/features/assessments/pages/ResultDoTestPage"),
);
const ResultPage = lazyRoutePage(
  () => import("@/features/assessments/pages/ResultPage"),
);
const TestDetailPage = lazyRoutePage(
  () => import("@/features/assessments/pages/TestDetailPage"),
);
const TestFormPage = lazyRoutePage(
  () => import("@/features/assessments/pages/TestFormPage"),
);
const TestPage = lazyRoutePage(() =>
  import("@/features/assessments/pages/TestPage").then(({ TestPage }) => ({
    default: TestPage,
  })),
);
const ExamDoing = lazyRoutePage(() =>
  import("@/features/assessments/components/exam/ExamDoing").then(
    ({ ExamDoing }) => ({ default: ExamDoing }),
  ),
);
const ExamInstruction = lazyRoutePage(() =>
  import("@/features/assessments/components/exam/ExamInstruction").then(
    ({ ExamInstruction }) => ({ default: ExamInstruction }),
  ),
);

export const assessmentRoutes: RouteObject[] = [
  {
    path: "exams",
    element: <PermissionRoute functionName="de_thi" />,
    children: [{ index: true, element: <ExamPage /> }],
  },
  {
    path: "tests",
    children: [
      {
        index: true,
        element: (
          <PermissionRoute functionName="de_thi">
            <TestPage />
          </PermissionRoute>
        ),
      },
      {
        path: ":id",
        children: [
          {
            index: true,
            element: (
              <PermissionRoute functionName="de_thi">
                <TestDetailPage />
              </PermissionRoute>
            ),
          },
          {
            path: "result/:courseGroupId",
            element: (
              <PermissionRoute functionName="de_thi">
                <ResultPage />
              </PermissionRoute>
            ),
          },
          {
            path: "edit",
            element: (
              <PermissionRoute functionName="de_thi" actionCode="UPDATE" />
            ),
            children: [
              { index: true, element: <TestFormPage /> },
              { path: "questions", element: <AddQuestionTestPage /> },
            ],
          },
          {
            path: "view",
            element: <PermissionRoute functionName="de_thi" />,
            children: [
              { index: true, element: <TestFormPage /> },
              { path: "questions", element: <AddQuestionTestPage /> },
            ],
          },
          {
            path: "take",
            element: (
              <PermissionRoute functionName="de_thi">
                <DoTestPage />
              </PermissionRoute>
            ),
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
        element: <PermissionRoute functionName="de_thi" actionCode="CREATE" />,
        children: [
          { index: true, element: <TestFormPage /> },
          { path: "questions", element: <AddQuestionTestPage /> },
        ],
      },
    ],
  },
];
