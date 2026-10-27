export const userQueryKeys = {
  root: ["users"] as const,
  list: (viewerId?: number) => ["users", "all", viewerId] as const,
  teachers: ["users", "teachers"] as const,
  roles: ["users", "roles"] as const,
};
