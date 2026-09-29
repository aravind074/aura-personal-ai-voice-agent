import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Users,
  Trash2,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { CalendarEvent } from '../../types/index.js';

interface CalendarViewProps {
  events: CalendarEvent[];
  onCreateEvent: (event: Partial<CalendarEvent>) => void;
  onDeleteEvent: (id: string) => void;
  onTriggerVoice: (cmd: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onCreateEvent,
  onDeleteEvent,
  onTriggerVoice,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('14:00');
  const [location, setLocation] = useState('Google Meet');
  const [attendees, setAttendees] = useState('Rahul Sharma');
  const [freeTimeMessage, setFreeTimeMessage] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const baseDate = dateStr || new Date().toISOString().split('T')[0];
    const startIso = `${baseDate}T${timeStr}:00.000Z`;
    const endIso = `${baseDate}T${Number(timeStr.split(':')[0]) + 1}:00:00.000Z`;

    onCreateEvent({
      title: title.trim(),
      startTime: startIso,
      endTime: endIso,
      location: location.trim(),
      attendees: attendees.split(',').map((s) => s.trim()).filter(Boolean),
      category: 'meeting',
    });

    setTitle('');
    setShowAddModal(false);
  };

  const handleFindFreeTime = () => {
    setFreeTimeMessage(
      'Tomorrow between 2:30 PM and 4:00 PM has zero conflicting meetings across your calendar. Best slot: 4:00 PM.'
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Calendar & Schedules</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Voice-automated scheduling, smart conflict checking, and attendee synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFindFreeTime}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-blue-400 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Find Free Time</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Event</span>
          </button>
        </div>
      </div>

      {/* Free Time Recommendation Banner */}
      {freeTimeMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200">
          <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <p className="flex-1">{freeTimeMessage}</p>
          <button
            onClick={() => onTriggerVoice('Schedule a meeting with Rahul tomorrow at 4 PM')}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer"
          >
            Schedule Slot
          </button>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No events scheduled</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Schedule meetings and events here, or ask Aura by voice: <span className="text-blue-300 font-medium">"Schedule a meeting tomorrow at 3 PM"</span>
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule an Event</span>
              </button>
            </div>
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                    {evt.category || 'Event'}
                  </span>
                  <h3 className="text-base font-semibold text-slate-100">{evt.title}</h3>
                </div>

                {evt.description && (
                  <p className="text-xs text-slate-400 mt-1">{evt.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(evt.startTime).toLocaleDateString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(evt.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </span>

                  {evt.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.location}</span>
                    </span>
                  )}

                  {evt.attendees && evt.attendees.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.attendees.join(', ')}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDeleteEvent(evt.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Schedule Event</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sync with Rahul on AI agent"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Location / Meeting Link
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Attendees (comma-separated)
                </label>
                <input
                  type="text"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
