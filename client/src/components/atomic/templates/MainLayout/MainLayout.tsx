import { Outlet } from "react-router-dom";
import { Sidebar } from "../../organisms/Sidebar/Sidebar";
import Header from "../../organisms/Header/Header";

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-background-body-background">
      <Sidebar />

      <div className="flex max-h-screen flex-1 flex-col">
        <Header />
        <main className="scroll-thin flex flex-1 justify-center overflow-auto bg-background-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
