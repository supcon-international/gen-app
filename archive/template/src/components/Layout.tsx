import { Link, Outlet } from 'react-router-dom';
import { Home, Info } from 'lucide-react';

export default function Layout() {
  return (

    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <Outlet />
    </main>

  );
}