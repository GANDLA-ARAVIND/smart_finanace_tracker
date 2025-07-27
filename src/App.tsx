import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { CurrencyProvider } from '@/contexts/currency-context';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { FinanceProvider } from '@/contexts/finance-context';
import { Toaster } from '@/components/ui/sonner';

// Pages
import LoginPage from '@/pages/auth/login';
import SignUpPage from '@/pages/auth/signup';
import Dashboard from '@/pages/dashboard';
import Transactions from '@/pages/transactions';
import Budgets from '@/pages/budgets';
import Reports from '@/pages/reports';
import AIAssistant from '@/pages/ai-assistant';
import Settings from '@/pages/settings';

// Layout
import Layout from '@/components/layout/layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <SignUpPage />
        </PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="reports" element={<Reports />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="finance-theme">
      <AuthProvider>
        <CurrencyProvider>
          <FinanceProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <AppRoutes />
                <Toaster />
              </div>
            </Router>
          </FinanceProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;