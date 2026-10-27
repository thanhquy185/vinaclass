import type { OwnProfileUpdate } from "@/features/identity/types/identity";

export type ProfileFormValues = Omit<
  OwnProfileUpdate,
  "phone" | "dateOfBirth"
> & {
  phone: string;
  dateOfBirth: string;
};
