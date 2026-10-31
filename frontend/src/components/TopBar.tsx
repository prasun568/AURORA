import React, { useState } from 'react';
import { Search, Bell, Wifi, WifiOff } from 'lucide-react';
import { User } from '../types';

interface TopBarProps {
  user?: User | null;
  isConnected?: boolean;
}

export default function TopBar({ user, isConnected = false }: TopBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 sticky top-0 shadow-sm shrink-0">
      {/* Search Input (Left) */}
      <div className="relative w-72 sm:w-80">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search reviews, papers, DOIs..."
          className="block w-full pl-9 pr-3.5 py-1.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-aurora-500 focus:border-aurora-500 transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Connection Status Badge */}
        <div
          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
            isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Sync Connected</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
              <WifiOff className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Offline Mode</span>
            </>
          )}
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => alert('No unread notifications.')}
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-aurora-600 rounded-full" />
        </button>
      </div>
    </header>
  );
}
