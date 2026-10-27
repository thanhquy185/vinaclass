import type { UserBase } from "@/features/identity/types/identity";

export type UserFormValues = UserBase & { password?: string };

export type UserFormMode = "create" | "view" | "update";

export interface UserRoleOption {
  label: string;
  value: number;
}
