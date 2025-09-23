import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
