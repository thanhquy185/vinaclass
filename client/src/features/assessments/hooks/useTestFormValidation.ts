import { useCallback } from "react";
import type { FormInstance } from "antd";
import { useTranslation } from "react-i18next";
import type {
  TestFieldRuleFactory,
  TestFormValues,
} from "@/features/assessments/types/testForm";
import { getTestFormFieldError } from "@/features/assessments/utils/test-form.validate";
import { translatedFormValidationRule } from "@/shared/utils/validation";

interface UseTestFormValidationOptions {
  form: FormInstance<TestFormValues>;
  userId?: number;
}

export function useTestFormValidation({
  form,
  userId,
}: UseTestFormValidationOptions): TestFieldRuleFactory {
  const { t } = useTranslation();

  return useCallback(
    (field) =>
      translatedFormValidationRule(
        field,
        () => form.getFieldsValue(),
        (currentField, value, values) =>
          getTestFormFieldError(currentField, value, values, userId ?? 0),
        t,
      ),
    [form, t, userId],
  );
}
