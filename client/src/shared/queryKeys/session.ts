export const sessionQueryKeys = {
  currentUser: ["me"] as const,
  navigation: (userId?: number) => ["me", userId, "navigation"] as const,
};
