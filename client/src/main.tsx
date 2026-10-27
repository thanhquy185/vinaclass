import "@/styles/global.css";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { queryClient } from "@/app/queryClient";
import ErrorBoundary from "@/app/providers/ErrorBoundary";
import { AuthQueryCacheBoundary } from "@/app/providers/AuthQueryCacheBoundary";
import "./i18n";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppProviders } from "@/app/providers/AppProviders";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <AuthQueryCacheBoundary>
          <RouterProvider router={router} />
        </AuthQueryCacheBoundary>
      </AppProviders>
    </QueryClientProvider>
  </ErrorBoundary>
);
