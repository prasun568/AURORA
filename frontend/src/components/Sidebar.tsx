import React from 'react';
import { LayoutDashboard, History, LayoutTemplate, Settings, Sparkles, LogOut } from 'lucide-react';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  activeTab: 'new' | 'history' | 'templates' | 'settings';
  setActiveTab: (tab: 'new' | 'history' | 'templates' | 'settings') => void;
  user?: User | null;
}

export default function Sidebar({ activeTab, setActiveTab, user }: SidebarProps) {
  const { logout } = useAuth();

  const navItems = [
    { id: 'new' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'templates' as const, label: 'Templates', icon: LayoutTemplate },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-[240px] bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen select-none">
      {/* Top Header & Navigation */}
      <div>
        {/* Logo Section */}
        <div className="h-16 px-5 flex items-center space-x-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-aurora-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-aurora-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight gradient-text">AURORA</span>
            <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase -mt-0.5">
              Review AI
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 transform hover:scale-[1.02] active:scale-[0.95] ${
                  isActive
                    ? 'bg-aurora-600 text-white shadow-md shadow-aurora-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout at Bottom */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center space-x-3 p-2 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-aurora-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
            {user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Researcher'}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email || 'user@aurora.ai'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full mt-2 flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
