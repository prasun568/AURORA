import React, { useState, useEffect } from 'react';
import { Search, Bell, Wifi, WifiOff, CheckCircle2, Activity } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface TopBarProps {
  user?: User | null;
  isConnected?: boolean;
  isGenerating?: boolean;
}

export default function TopBar({ user, isConnected = false, isGenerating = false }: TopBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);

  // Poll backend health periodically to accurately reflect server status
  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      try {
        const healthy = await api.checkHealth();
        if (isMounted) setIsBackendHealthy(healthy);
      } catch {
        if (isMounted) setIsBackendHealthy(false);
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="h-20 bg-[#24090F]/90 backdrop-blur-md border-b border-[#75502F] px-6 flex items-center justify-between z-10 sticky top-0 shrink-0">
      {/* Search Input (Left) */}
      <div className="relative w-72 sm:w-88">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C69B48]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search manuscript vault, DOIs, publications..."
          className="block w-full pl-10 pr-4 py-2 border border-[#75502F] rounded-xl text-xs sm:text-sm text-[#F6EBD5] placeholder-[#C8B99F]/50 bg-[#350E18] focus:border-[#C69B48] focus:outline-none focus:ring-1 focus:ring-[#C69B48] font-academic transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Connection Status Badge */}
        {isConnected || isGenerating ? (
          <div
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-serif border bg-[#350E18] text-[#E5C477] border-[#C69B48] shadow-[0_0_12px_rgba(229,196,119,0.25)] transition-all"
            title="LangGraph deterministic agent state stream is active"
          >
            <span className="w-2 h-2 rounded-full bg-[#E5C477] animate-pulse shrink-0" />
            <Activity className="w-3.5 h-3.5 text-[#E5C477]" />
            <span className="hidden sm:inline font-medium">LangGraph Live Stream</span>
          </div>
        ) : isBackendHealthy ? (
          <div
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-serif border bg-[#350E18]/80 text-[#F6EBD5] border-[#75502F] hover:border-[#C69B48]/60 transition-all cursor-default"
            title="AURORA backend & 12 AI agents are online and ready for research dispatch"
          >
            <span className="w-2 h-2 rounded-full bg-[#C69B48] shrink-0" />
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C69B48]" />
            <span className="hidden sm:inline font-medium text-[#E5C477]">Orchestrator Ready</span>
          </div>
        ) : (
          <div
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-serif border bg-[#24090F] text-[#C8B99F] border-[#75502F] transition-all"
            title="Unable to connect to AURORA backend server"
          >
            <span className="w-2 h-2 rounded-full bg-[#8B2635] shrink-0" />
            <WifiOff className="w-3.5 h-3.5 text-[#C8B99F]" />
            <span className="hidden sm:inline">Backend Offline</span>
          </div>
        )}

        {/* Notification Bell */}
        <button
          onClick={() => alert('No unread research dispatches.')}
          className="relative p-2.5 text-[#C8B99F] hover:text-[#E5C477] hover:bg-[#350E18] rounded-xl transition-all border border-transparent hover:border-[#75502F]"
          title="Scholarly Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C69B48]"></span>
        </button>
      </div>
    </header>
  );
}
