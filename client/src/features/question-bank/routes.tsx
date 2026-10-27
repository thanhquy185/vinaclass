import type { RouteObject } from "react-router-dom";
import PermissionRoute from "@/features/authorization/components/PermissionRoute";
import { lazyRoutePage } from "@/app/routing/lazyRoutePage";

const QuestionBankPage = lazyRoutePage(() =>
  import("@/features/question-bank/pages/QuestionBankPage").then(
    ({ QuestionBankPage }) => ({ default: QuestionBankPage })
  )
);

export const questionBankRoutes: RouteObject[] = [
  {
    path: "question",
    element: <PermissionRoute functionName="cau_hoi" />,
    children: [{ index: true, element: <QuestionBankPage /> }],
  },
];
