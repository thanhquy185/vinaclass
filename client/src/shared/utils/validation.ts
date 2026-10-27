import type { Rule } from "antd/es/form";

export interface RequiredFieldRuleOptions {
  whitespace?: boolean;
}

export type ValidationErrorKeyResolver<TValue> = (
  value: TValue,
) => string | undefined;

export type FormValidationErrorKeyResolver<
  TValues,
  TField extends keyof TValues,
> = (
  field: TField,
  value: unknown,
  currentValues: Partial<TValues>,
) => string | undefined;

export function translatedValidationRule<TValue>(
  getErrorKey: ValidationErrorKeyResolver<TValue>,
  translate: (key: string) => string,
): Rule {
  return {
    validator: (_rule, value: TValue) => {
      const errorKey = getErrorKey(value);

      return errorKey
        ? Promise.reject(new Error(translate(errorKey)))
        : Promise.resolve();
    },
  };
}

export function translatedFormValidationRule<
  TValues,
  TField extends keyof TValues,
>(
  field: TField,
  getValues: () => Partial<TValues>,
  getErrorKey: FormValidationErrorKeyResolver<TValues, TField>,
  translate: (key: string) => string,
): Rule {
  return {
    validator: (_rule, value: unknown) => {
      const errorKey = getErrorKey(field, value, getValues());

      return errorKey
        ? Promise.reject(new Error(translate(errorKey)))
        : Promise.resolve();
    },
  };
}

export function requiredFieldRule(
  message: string,
  options: RequiredFieldRuleOptions = {},
): Rule {
  return {
    required: true,
    ...(options.whitespace ? { whitespace: true } : {}),
    message,
  };
}

export function maxLengthRule(max: number, message: string): Rule {
  return { max, message };
}
