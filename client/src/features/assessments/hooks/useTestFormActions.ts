import { useState } from "react";
import type { FormInstance } from "antd";
import type { NavigateFunction } from "react-router-dom";
import type { TestFormValues } from "@/features/assessments/types/testForm";
import type { Exam } from "@/shared/types";

interface UseTestFormActionsOptions {
  form: FormInstance<TestFormValues>;
  isViewMode: boolean;
  userId?: number;
  updateTestData: (fields: Partial<Exam>) => void;
  navigate: NavigateFunction;
}

export function useTestFormActions({
  form,
  isViewMode,
  userId,
  updateTestData,
  navigate,
}: UseTestFormActionsOptions) {
  const [creatorError, setCreatorError] = useState<string>();

  const handleContinue = async () => {
    if (isViewMode) {
      navigate("questions");
      return;
    }

    try {
      await form.validateFields();
    } catch {
      return;
    }

    if (!userId) {
      setCreatorError("testFormPage.validation.creatorRequired");
      return;
    }

    setCreatorError(undefined);
    updateTestData({ creatorId: userId });
    navigate("questions");
  };

  return { creatorError, handleContinue };
}
