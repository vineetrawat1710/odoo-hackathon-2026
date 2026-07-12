import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastProvider } from './components/toast/toast';
import { Sidebar } from './components/sidebar/sidebar';
import { Navbar } from './components/navbar/navbar';
import { LandingPage } from './views/LandingPage';
import { Auth } from './views/Auth';
import { Dashboard } from './views/Dashboard';
import { Vehicles } from './views/Vehicles';
import { Drivers } from './views/Drivers';
import { Trips } from './views/Trips';
import { Maintenance } from './views/Maintenance';
import { FuelLogs } from './views/FuelLogs';
import { Expenses } from './views/Expenses';
import { Analytics } from './views/Analytics';
import { Settings } from './views/Settings';

// Guard: redirect to /login if not authenticated
const ProtectedRoute: React.FC = () => {
  const isLoggedIn = localStorage.getItem('transitops_logged_in') === 'true';
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Navbar />
        <main className="flex-1 overflow-y-auto pt-16 px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Guard: redirect to /dashboard if already logged in
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = localStorage.getItem('transitops_logged_in') === 'true';
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><Auth /></PublicRoute>} />

          {/* Protected dashboard routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/fuel-logs" element={<FuelLogs />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center font-sans">
              <p className="text-8xl font-black text-slate-200 tracking-tight">404</p>
              <h1 className="text-xl font-bold text-slate-900 mt-4">Route Not Found</h1>
              <p className="text-sm text-slate-500 mt-2">This page does not exist in the TransitOps fleet console.</p>
              <a href="/dashboard" className="mt-6 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Return to Dashboard
              </a>
            </div>
          } />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
