import type { Role } from "@/shared/types";
import type { User } from "@/features/identity/types/identity";
import { getUserSystemRoleCode } from "@/shared/utils/role";
import { normalizeSearchText } from "@/shared/utils/normalizeSearchText";

export const STUDENT_FILTER_VALUE = -1;
export type UserSearchCriterion = "fullName" | "username" | "email";

interface FilterUsersOptions {
  users: User[];
  roles: Role[];
  searchTerm: string;
  searchBy: UserSearchCriterion;
  filterRole: number;
  sortDirection: "asc" | "desc";
}

export function filterUsers({
  users,
  roles,
  searchTerm,
  searchBy,
  filterRole,
  sortDirection,
}: FilterUsersOptions): User[] {
  const keyword = normalizeSearchText(searchTerm.trim());

  return users
    .filter((user) => {
      const matchesRole =
        filterRole === 0 ||
        (filterRole === STUDENT_FILTER_VALUE
          ? getUserSystemRoleCode(user, roles) === "STUDENT"
          : user.roleId === filterRole);
      const searchValue = {
        fullName: user.profile.fullName,
        username: user.username,
        email: user.email,
      }[searchBy];
      const matchesSearch =
        !keyword || normalizeSearchText(searchValue).includes(keyword);

      return matchesRole && matchesSearch;
    })
    .sort((first, second) => {
      const result = first.profile.fullName.localeCompare(
        second.profile.fullName,
        "vi",
        { sensitivity: "base" }
      );
      return sortDirection === "asc" ? result : -result;
    });
}
