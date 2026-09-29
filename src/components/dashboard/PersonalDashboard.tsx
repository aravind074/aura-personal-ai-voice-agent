import React from 'react';
import {
  Calendar,
  CheckSquare,
  Bell,
  Sparkles,
  Search,
  FileUp,
  Brain,
  ArrowRight,
  Clock,
  ExternalLink,
  Plus,
  Play,
  LogIn,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Task, CalendarEvent, Reminder, DocumentItem } from '../../types/index.js';
import { ActiveTab } from '../layout/Navbar.js';
import { User } from 'firebase/auth';

interface PersonalDashboardProps {
  tasks: Task[];
  events: CalendarEvent[];
  reminders: Reminder[];
  documents: DocumentItem[];
  onTriggerVoiceCommand: (text: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onAddTaskPrompt: () => void;
  onAddReminderPrompt: () => void;
  user?: User | null;
  onSignIn?: () => void;
}

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({
  tasks,
  events,
  reminders,
  documents,
  onTriggerVoiceCommand,
  setActiveTab,
  onAddTaskPrompt,
  onAddReminderPrompt,
  user,
  onSignIn,
}) => {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const userName = user?.displayName
    ? user.displayName.split(' ')[0]
    : user?.email
    ? user.email.split('@')[0]
    : null;

  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED').slice(0, 4);
  const activeReminders = reminders.filter((r) => !r.completed).slice(0, 3);
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800/80 p-6 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{dateFormatted}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {greeting}
              {userName ? (
                <>, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-300">{userName}</span></>
              ) : ''}.
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              {upcomingEvents.length > 0 || pendingTasks.length > 0
                ? `You have ${upcomingEvents.length} events scheduled and ${pendingTasks.length} pending tasks.`
                : 'AURA is ready. Schedule events, organize your tasks, or speak a voice command.'}
            </p>
          </div>

          {/* Quick Voice Trigger & Sign In Actions */}
          <div className="flex items-center flex-wrap gap-2.5">
            {!user && onSignIn && (
              <button
                onClick={onSignIn}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sign in with Google</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('voice')}
              className="flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Talk to Aura</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setActiveTab('calendar')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-center transition-all group cursor-pointer active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform mb-2">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Calendar</span>
          <span className="text-[10px] text-slate-400">Schedule</span>
        </button>

        <button
          onClick={onAddTaskPrompt}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-center transition-all group cursor-pointer active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform mb-2">
            <CheckSquare className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Add Task</span>
          <span className="text-[10px] text-slate-400">Quick todo</span>
        </button>

        <button
          onClick={onAddReminderPrompt}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-center transition-all group cursor-pointer active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform mb-2">
            <Bell className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Set Reminder</span>
          <span className="text-[10px] text-slate-400">Alert / alarm</span>
        </button>

        <button
          onClick={() => setActiveTab('research')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-center transition-all group cursor-pointer active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform mb-2">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Deep Research</span>
          <span className="text-[10px] text-slate-400">Web search</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-center transition-all group cursor-pointer active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform mb-2">
            <FileUp className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Knowledge RAG</span>
          <span className="text-[10px] text-slate-400">Doc search</span>
        </button>

        <button
          onClick={() => setActiveTab('memory')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-center transition-all group cursor-pointer active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform mb-2">
            <Brain className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Long-term Memory</span>
          <span className="text-[10px] text-slate-400">Personal facts</span>
        </button>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Schedule & Active Reminders (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Card */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Today&apos;s Schedule</h3>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <span>View Full Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60 hover:border-cyan-500/30 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-10 rounded-full bg-cyan-500/60 group-hover:bg-cyan-400 transition-colors flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {evt.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {evt.startTime} - {evt.endTime}
                          </span>
                          {evt.location && <span>• {evt.location}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-sm">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>No calendar events scheduled for today.</p>
              </div>
            )}
          </div>

          {/* Pending Tasks Card */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Priority Tasks</h3>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <span>Task Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingTasks.length > 0 ? (
              <div className="space-y-2.5">
                {pendingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          t.priority === 'URGENT'
                            ? 'bg-rose-500'
                            : t.priority === 'HIGH'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <span className="text-sm font-medium text-slate-200">{t.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-sm">
                <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>All priority tasks are completed!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reminders & Voice Suggestions */}
        <div className="space-y-6">
          {/* Active Reminders Card */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-base">Active Reminders</h3>
              </div>
            </div>

            {activeReminders.length > 0 ? (
              <div className="space-y-3">
                {activeReminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60 hover:border-amber-500/30 transition-all"
                  >
                    <h4 className="text-sm font-semibold text-slate-200">{rem.title}</h4>
                    <p className="text-xs text-amber-400/90 mt-1 font-mono">
                      {new Date(rem.datetime).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 text-sm">
                <p>No active reminders right now.</p>
              </div>
            )}
          </div>

          {/* Quick Voice Command Prompts */}
          <div className="rounded-3xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/20 p-5 sm:p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Spoken Capabilities</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Tap any example or speak directly:
            </p>
            <div className="space-y-2">
              {[
                "What's on my schedule today?",
                'What tasks are pending?',
                'Remind me tomorrow at 10 AM to submit assignment',
                'Research the best laptops under budget and compare them',
                'Calculate (45000 * 1.15) / 12',
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onTriggerVoiceCommand(prompt)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/50 hover:bg-cyan-500/10 border border-slate-800/80 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 transition-all cursor-pointer active:scale-98"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
