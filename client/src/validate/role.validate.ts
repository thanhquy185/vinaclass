import type { RoleDetailItem } from "@/types";

export interface RoleCreate {
  roleName: string;
  roleDetails: RoleDetailItem[];
}

export type RoleError = Partial<Record<keyof RoleCreate, string>>;

export class RoleValidate {
  static create(data: RoleCreate): RoleError {
    const errors: RoleError = {};

    // validate tên nhóm quyền
    if (!data.roleName || data.roleName.trim() === "") {
      errors.roleName = "Tên nhóm quyền không được để trống";
    }

    // validate danh sách quyền
    if (!data.roleDetails || data.roleDetails.length === 0) {
      errors.roleDetails = "Role phải có ít nhất 1 quyền";
    }

    return errors;
  }
}
