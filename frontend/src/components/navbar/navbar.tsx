import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Shield, RefreshCw } from 'lucide-react';
import { useToast } from '../toast/toast';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { success } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute view title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Fleet Dashboard';
    if (path.startsWith('/vehicles')) return 'Vehicles Directory';
    if (path.startsWith('/drivers')) return 'Driver Operations';
    if (path.startsWith('/trips')) return 'Trip Control Center';
    if (path.startsWith('/maintenance')) return 'Maintenance Workshop';
    if (path.startsWith('/fuel-logs')) return 'Fuel Logs Ledger';
    if (path.startsWith('/expenses')) return 'Operating Expenses';
    if (path.startsWith('/analytics')) return 'Performance Analytics';
    if (path.startsWith('/settings')) return 'ERP Settings';
    return 'TransitOps';
  };

  const handleSync = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      success('Fleet telematics synchronized successfully.');
    }, 1000);
  };

  const mockAlerts = [
    { id: 1, text: 'Vehicle MH15UV4321 overdue for radiator flush', time: '1 hour ago' },
    { id: 2, text: 'Driver License warning logged: Rakesh Singh (2 weeks)', time: '4 hours ago' }
  ];

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10 shadow-2xs">
      {/* Title */}
      <div>
        <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">{getPageTitle()}</h1>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        
        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50/90 rounded-full border border-emerald-200/80 text-emerald-700 text-xs font-semibold shadow-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Telematics Online
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={isRefreshing}
          className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all focus:outline-none disabled:opacity-50 border border-transparent hover:border-blue-200/60"
          title="Synchronize Data"
        >
          <RefreshCw className={`h-4.5 w-4.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all relative focus:outline-none border border-transparent hover:border-blue-200/60"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 ring-2 ring-white animate-pulse"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2.5 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-300/40 z-40 py-2 animate-fade-in overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100/80 flex items-center justify-between bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-900">Operational Alerts</span>
                  <span className="text-[10px] text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full font-bold">2 New</span>
                </div>
                <div className="divide-y divide-slate-100/60">
                  {mockAlerts.map(alert => (
                    <div key={alert.id} className="px-4 py-3 hover:bg-blue-50/40 transition-colors">
                      <p className="text-xs font-medium text-slate-700 leading-normal">{alert.text}</p>
                      <span className="text-[10px] font-semibold text-slate-400 mt-1 block">{alert.time}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-slate-100/80 text-center bg-slate-50/50">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      success('All notifications marked read');
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold focus:outline-none"
                  >
                    Clear all alerts
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Security / Role Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold border-l border-slate-200/80 pl-5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Shield className="h-4 w-4" />
          </div>
          <span>Dispatcher Console</span>
        </div>
      </div>
    </header>
  );
};
