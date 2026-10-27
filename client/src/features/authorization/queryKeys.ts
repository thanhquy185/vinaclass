export const authorizationQueryKeys = {
  functionCatalog: ["authorization", "function-catalog"] as const,
  roles: {
    root: ["roles"] as const,
    list: (sortDirection: "asc" | "desc" | null) =>
      ["roles", "list", sortDirection ?? "id-desc"] as const,
    detail: (roleId?: number) => ["roles", roleId] as const,
  },
  roleMatrix: {
    root: ["authorization", "role-matrix"] as const,
    byRole: (roleId: number | null) =>
      ["authorization", "role-matrix", roleId] as const,
  },
  userOverrides: {
    root: ["authorization", "user-overrides"] as const,
    byUser: (userId: number | null) =>
      ["authorization", "user-overrides", userId] as const,
  },
};
