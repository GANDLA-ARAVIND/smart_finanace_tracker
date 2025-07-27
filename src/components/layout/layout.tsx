import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import Header from './header';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}