import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CreditCard,
  PiggyBank,
  BarChart3,
  Bot,
  Settings,
  X,
  TrendingUp
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Budgets', href: '/budgets', icon: PiggyBank },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  FinanceTracker
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Smart Financial Management
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  )
                }
                onClick={() => setOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}