import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/app/layout/Header";
import { Sidebar } from "@/app/layout/Sidebar";

export const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches
  );

  return (
    <div className="app-main-shell flex h-dvh overflow-hidden bg-background-body text-text-primary">
      <Sidebar isCollapsed={isSidebarCollapsed} />

      <div className="app-main-content flex min-h-0 min-w-0 flex-1 flex-col">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() =>
            setIsSidebarCollapsed((collapsed) => !collapsed)
          }
        />
        <main className="app-main-scroll scroll-thin min-h-0 flex-1 overflow-y-auto bg-background-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
