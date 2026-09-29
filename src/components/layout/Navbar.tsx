import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  FileText,
  FileSearch,
  Search,
  Code2,
  BarChart3,
  Brain,
  FolderKanban,
  Settings as SettingsIcon,
  Bell,
  Sparkles,
  Wifi,
  WifiOff,
  AlertTriangle,
  Info,
  Radio,
  LogIn,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { User } from 'firebase/auth';
import { AgentStatus } from '../../types/index.js';

export type ActiveTab =
  | 'voice'
  | 'dashboard'
  | 'tasks'
  | 'calendar'
  | 'notes'
  | 'documents'
  | 'research'
  | 'coding'
  | 'data'
  | 'projects'
  | 'memory';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  agentStatus: AgentStatus;
  isDemoMode: boolean;
  onOpenSettings: () => void;
  pendingRemindersCount: number;
  isOffline: boolean;
  onToggleOfflineSimulation: () => void;
  isWakeWordEnabled: boolean;
  onToggleWakeWord: () => void;
  user?: User | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  notificationPermission?: 'default' | 'granted' | 'denied' | 'unsupported';
  onRequestNotificationPermission?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  agentStatus,
  isDemoMode,
  onOpenSettings,
  pendingRemindersCount,
  isOffline,
  onToggleOfflineSimulation,
  isWakeWordEnabled,
  onToggleWakeWord,
  user,
  onSignIn,
  onSignOut,
  notificationPermission = 'default',
  onRequestNotificationPermission,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-4 py-2 sm:py-2.5">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-2">
        {/* Left: Branding & Tagline */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div
            onClick={() => setActiveTab('voice')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
              <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-white">
                  AURA
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  AI VOICE AGENT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden lg:block">
                Your intelligent voice-powered personal assistant
              </p>
            </div>
          </div>
        </div>

        {/* Center: Top Navigation Modes (Desktop) */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Agent</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Today</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>Docs</span>
          </button>

          <button
            onClick={() => setActiveTab('research')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'research'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Research</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'memory'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Memory</span>
          </button>
        </nav>

        {/* Right: User Account Profile + Status Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Hands-Free Wake Word Toggle (Desktop/Tablet) */}
          <button
            onClick={onToggleWakeWord}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
              isWakeWordEnabled
                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={isWakeWordEnabled ? "Wake word active: Say 'Hey Aura', 'Hey Google', or 'Siri'" : "Click to enable hands-free 'Hey Aura' wake word"}
          >
            <Radio className={`w-3 h-3 ${isWakeWordEnabled ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{isWakeWordEnabled ? 'Hey Aura ON' : 'Wake Word'}</span>
          </button>

          {/* Network Status Badge */}
          <div className="relative hidden sm:block" ref={tooltipRef}>
            {isOffline ? (
              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 border border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)] animate-pulse cursor-pointer hover:bg-rose-500/25 transition-all"
              >
                <WifiOff className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span className="font-bold">Offline</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer transition-all bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
              >
                <Wifi className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span>Online</span>
              </button>
            )}

            {showTooltip && (
              <div
                className="absolute right-0 top-full mt-2 w-72 sm:w-80 p-4 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl text-xs z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-start gap-2.5 mb-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100">Network Connected</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Cloud Sync & Gemini Live Active</span>
                  </div>
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed border-t border-slate-800/80 pt-2.5 mb-3">
                  AURA is connected to Firebase Firestore and Google Gemini Live intelligence.
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Test mode:</span>
                  <button
                    onClick={onToggleOfflineSimulation}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer"
                  >
                    {isOffline ? 'Restore Online' : 'Simulate Offline'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Reminders Bell */}
          {pendingRemindersCount > 0 && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
              title={`${pendingRemindersCount} pending reminders`}
            >
              <Bell className="w-4 h-4 text-cyan-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {pendingRemindersCount}
              </span>
            </button>
          )}

          {/* USER ACCOUNT SIGN-IN & PROFILE BADGE (PROMINENT ON ALL DEVICES) */}
          <div className="relative" ref={userMenuRef}>
            {user ? (
              <div>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer shadow-sm group"
                  aria-label="User Account Menu"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-cyan-500/30 group-hover:ring-cyan-400"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-cyan-500/30">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-200 max-w-[90px] sm:max-w-[130px] truncate">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </button>

                {/* User Profile Dropdown Card */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl p-4 z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500/40"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold flex items-center justify-center">
                          {(user.displayName || user.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-white truncate">
                          {user.displayName || 'Authenticated User'}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="py-2.5 space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Google Account & Firestore Connected</span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        UID: {user.uid.slice(0, 16)}...
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenSettings();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          if (onSignOut) onSignOut();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                title="Sign in with Google Account"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Settings & Privacy"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
