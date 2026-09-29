import React from 'react';
import { Bell, Clock, CheckCircle2, X, Volume2 } from 'lucide-react';
import { Reminder } from '../../types/index.js';

interface ReminderToastProps {
  reminder: Reminder;
  onSnooze: (reminderId: string, minutes: number) => void;
  onComplete: (reminderId: string) => void;
  onDismiss: () => void;
}

export const ReminderToast: React.FC<ReminderToastProps> = ({
  reminder,
  onSnooze,
  onComplete,
  onDismiss,
}) => {
  const timeFormatted = new Date(reminder.datetime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm w-full bg-slate-900/95 border border-cyan-500/40 shadow-2xl shadow-cyan-500/20 rounded-2xl p-4 backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-cyan-400 animate-bounce">
          <Bell className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Due Now • {timeFormatted}
            </span>
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-sm font-bold text-slate-100 mt-1 line-clamp-2">
            {reminder.title}
          </h3>

          {reminder.notes && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {reminder.notes}
            </p>
          )}

          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800">
            <button
              onClick={() => onComplete(reminder.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Done</span>
            </button>

            <button
              onClick={() => onSnooze(reminder.id, 5)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
              title="Remind me again in 5 minutes"
            >
              Snooze 5m
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
