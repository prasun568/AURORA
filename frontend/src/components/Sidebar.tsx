import React from 'react';
import { LayoutDashboard, History, LayoutTemplate, Settings, Scroll, LogOut, ArrowLeft, BookOpen, Feather } from 'lucide-react';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

interface SidebarProps {
  activeTab: 'new' | 'history' | 'templates' | 'settings';
  setActiveTab: (tab: 'new' | 'history' | 'templates' | 'settings') => void;
  user?: User | null;
}

export default function Sidebar({ activeTab, setActiveTab, user }: SidebarProps) {
  const { logout } = useAuth();

  const navItems = [
    { id: 'new' as const, label: 'Research Scribe', icon: Feather },
    { id: 'history' as const, label: 'Manuscript Vault', icon: History },
    { id: 'templates' as const, label: 'Publishing Formats', icon: LayoutTemplate },
    { id: 'settings' as const, label: 'Twelve Agents', icon: Settings },
  ];

  return (
    <aside className="w-[250px] bg-[#24090F] border-r border-[#75502F] flex flex-col justify-between shrink-0 h-screen select-none text-[#F6EBD5]">
      {/* Top Header & Navigation */}
      <div>
        {/* Logo Section */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-[#75502F]">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <img
                src="/aurora-logo.png"
                alt="AURORA Emblem"
                className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(229,196,119,0.4)]"
              />
            </div>
            <div>
              <span className="font-serif font-extrabold text-lg tracking-widest text-[#F6EBD5] group-hover:text-[#E5C477] transition-colors">
                AURORA
              </span>
              <span className="block text-[9px] font-serif font-bold tracking-widest text-[#C69B48] uppercase -mt-1">
                Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-2 mt-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-serif font-bold tracking-wider uppercase transition-all duration-150 ${
                  isActive
                    ? 'bg-[#350E18] border border-[#C69B48] text-[#E5C477] shadow-lg shadow-[#24090F]'
                    : 'text-[#C8B99F] hover:text-[#F6EBD5] hover:bg-[#350E18]/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#E5C477]' : 'text-[#C69B48]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-[#75502F]">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#350E18] border border-[#75502F]">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#C69B48] to-[#E5C477] text-[#24090F] flex items-center justify-center text-xs font-serif font-bold shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-serif font-bold text-[#F6EBD5] truncate block">
                {user?.name || user?.email?.split('@')[0] || 'Scholar'}
              </span>
              <span className="text-[10px] font-academic text-[#C8B99F] truncate block">
                {user?.email || 'Authenticated'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-[#C8B99F] hover:text-[#E5C477] hover:bg-[#24090F] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <Link
          to="/"
          className="mt-2 w-full py-2 px-3 text-[11px] font-serif uppercase tracking-widest text-[#C8B99F] hover:text-[#E5C477] flex items-center justify-center space-x-1.5 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Exit to Great Hall</span>
        </Link>
      </div>
    </aside>
  );
}
