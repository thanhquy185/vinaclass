import { useEffect, type PropsWithChildren } from "react";
import { queryClient } from "@/app/queryClient";
import { useAuthStore } from "@/shared/stores/useAuthStore";

export function AuthQueryCacheBoundary({ children }: PropsWithChildren) {
  useEffect(
    () =>
      useAuthStore.subscribe((state, previousState) => {
        const sessionChanged =
          state.token !== previousState.token ||
          state.user?.id !== previousState.user?.id;

        if (!sessionChanged) return;

        void queryClient.cancelQueries();
        queryClient.clear();
      }),
    []
  );

  return children;
}
