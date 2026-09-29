import React from 'react';
import {
  Mic,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Search,
  FileSearch,
  BarChart3,
  Brain,
  Code2
} from 'lucide-react';
import { ActiveTab } from './Navbar.js';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'voice', label: 'Voice', icon: <Mic className="w-5 h-5" /> },
    { id: 'dashboard', label: 'Today', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { id: 'documents', label: 'Docs', icon: <FileSearch className="w-5 h-5" /> },
    { id: 'research', label: 'Research', icon: <Search className="w-5 h-5" /> },
    { id: 'coding', label: 'Code', icon: <Code2 className="w-5 h-5" /> },
    { id: 'data', label: 'Data', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'memory', label: 'Memory', icon: <Brain className="w-5 h-5" /> },
  ] as const;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around overflow-x-auto no-scrollbar shadow-2xl"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ActiveTab)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-all active:scale-90 cursor-pointer min-w-[52px] ${
              isActive
                ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`transition-transform ${isActive ? 'scale-110 text-cyan-300' : ''}`}>
              {tab.icon}
            </div>
            <span className="mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
