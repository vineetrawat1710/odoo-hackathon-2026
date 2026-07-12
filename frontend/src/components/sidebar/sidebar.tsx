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
    localStorage.removeItem('transitops_logged_in');
    localStorage.removeItem('transitops_token');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 h-screen flex flex-col fixed left-0 top-0 z-20">
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-200/80 flex items-center px-6 gap-2.5">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-1.5 rounded-lg shadow-crystal-btn">
          <Compass className="h-5 w-5" />
        </div>
        <div>
          <span className="text-base font-bold text-slate-900 tracking-tight">TransitOps</span>
          <span className="text-[10px] text-indigo-600 font-semibold block uppercase tracking-wider -mt-1">Fleet OS</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/40">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center font-bold text-indigo-700 text-sm border border-indigo-200/50">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'Loading...'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user ? formatRole(user.role) : ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-2 py-2 mt-3 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50/60 rounded-lg transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Logout System
        </button>
      </div>
    </aside>
  );
};
