import type { RouteObject } from "react-router-dom";
import PermissionRoute from "@/features/authorization/components/PermissionRoute";
import { lazyRoutePage } from "@/app/routing/lazyRoutePage";

const CourseElement = lazyRoutePage(
  () => import("@/features/classrooms/pages/CourseElement")
);
const CourseGroupPage = lazyRoutePage(() =>
  import("@/features/classrooms/pages/CourseGroupPage").then(
    ({ CourseGroupPage }) => ({ default: CourseGroupPage })
  )
);
const CourseGroupStudentPage = lazyRoutePage(() =>
  import("@/features/classrooms/pages/CourseGroupStudentPage").then(
    ({ CourseGroupStudentPage }) => ({ default: CourseGroupStudentPage })
  )
);
const CoursePage = lazyRoutePage(() =>
  import("@/features/classrooms/pages/CoursePage").then(({ CoursePage }) => ({
    default: CoursePage,
  }))
);
const NotificationPage = lazyRoutePage(() =>
  import("@/features/classrooms/pages/NotificationPage").then(
    ({ NotificationPage }) => ({ default: NotificationPage })
  )
);

export const classroomRoutes: RouteObject[] = [
  {
    path: "courses",
    element: <PermissionRoute functionName="hoc_phan" />,
    children: [
      { index: true, element: <CoursePage /> },
      { path: ":id", element: <CourseElement /> },
    ],
  },
  {
    path: "course-group",
    element: <PermissionRoute functionName="hoc_phan" />,
    children: [
      { index: true, element: <CourseGroupPage /> },
      {
        path: ":courseId/groups/:groupId/students",
        element: <CourseGroupStudentPage />,
      },
    ],
  },
  {
    path: "notifications",
    element: <PermissionRoute functionName="thong_bao" />,
    children: [{ index: true, element: <NotificationPage /> }],
  },
];
