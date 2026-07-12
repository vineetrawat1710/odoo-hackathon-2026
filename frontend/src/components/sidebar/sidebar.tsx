import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Navigation, 
  Wrench, 
  Fuel, 
  IndianRupee, 
  BarChart3, 
  Settings, 
  LogOut,
  Compass
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicles', path: '/vehicles', icon: Truck },
    { name: 'Drivers', path: '/drivers', icon: Users },
    { name: 'Trips & Dispatch', path: '/trips', icon: Navigation },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Fuel Logs', path: '/fuel-logs', icon: Fuel },
    { name: 'Expenses', path: '/expenses', icon: IndianRupee },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const [user, setUser] = useState<{name: string, role: string} | null>(null);

  useEffect(() => {
    apiClient.get<{name: string, role: string}>('/auth/me')
      .then(res => setUser(res))
      .catch(console.error);
  }, []);

  const formatRole = (r: string) => {
    return r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  const handleLogout = () => {
    // Clear login flag or mock state
    localStorage.removeItem('transitops_logged_in');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white/85 backdrop-blur-xl border-r border-slate-200/80 h-screen flex flex-col fixed left-0 top-0 z-20 shadow-xs">
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-200/80 flex items-center px-6 gap-3">
        <div className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white p-2 rounded-xl shadow-md shadow-blue-500/25">
          <Compass className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <span className="text-base font-extrabold text-slate-900 tracking-tight block">TransitOps</span>
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block -mt-1">Fleet OS</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-0.5'
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/70">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-white/80 border border-slate-200/60 shadow-2xs">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Loading...'}</p>
            <p className="text-[10px] font-semibold text-blue-600 truncate">{user ? formatRole(user.role) : ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 px-3 py-2 mt-3 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-all border border-transparent hover:border-rose-200/60"
        >
          <LogOut className="h-4 w-4" />
          Logout System
        </button>
      </div>
    </aside>
  );
};
