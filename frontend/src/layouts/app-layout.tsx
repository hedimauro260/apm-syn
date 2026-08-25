import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <Outlet />
    </main>
  );
}
