import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/layout/Header/app-header";
import { AppSidebar } from "@/components/layout/AppSidebar/app-sidebar";
import { AppFooter } from "@/components/layout/Footer/app-footer";

export function AppLayout() {
  return (
    <div className="flex flex-col h-dvh bg-background text-foreground">
      <AppHeader />
      <main className="flex-1 min-w-0 p-0 pt-16">
        <AppSidebar />
        <div className="px-2 md:ml-19 md:p-0">
          <Outlet />
          <AppFooter />
        </div>
      </main>
    </div>
  );
}
