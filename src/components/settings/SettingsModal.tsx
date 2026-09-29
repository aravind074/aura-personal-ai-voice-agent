import React, { useState } from 'react';
import {
  X,
  Volume2,
  Cpu,
  Brain,
  Shield,
  Download,
  Trash2,
  Check,
  Radio,
  Sliders,
  Sparkles,
  RefreshCw,
  User as UserIcon,
  LogIn,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { Settings } from '../../types/index.js';
import { User } from 'firebase/auth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
  onClearHistory: () => void;
  onClearMemories: () => void;
  onExportData: () => void;
  user?: User | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearHistory,
  onClearMemories,
  onExportData,
  user,
  onSignIn,
  onSignOut,
}) => {
  const [current, setCurrent] = useState<Settings>(settings);
  const [activeSection, setActiveSection] = useState<'account' | 'voice' | 'ai' | 'memory' | 'privacy' | 'integrations'>('account');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(current);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">AURA Settings & Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'account', label: 'Account & Sync', icon: <UserIcon className="w-4 h-4" /> },
            { id: 'voice', label: 'Voice & Speech', icon: <Volume2 className="w-4 h-4" /> },
            { id: 'ai', label: 'AI Intelligence', icon: <Cpu className="w-4 h-4" /> },
            { id: 'memory', label: 'Memory', icon: <Brain className="w-4 h-4" /> },
            { id: 'privacy', label: 'Privacy & Data', icon: <Shield className="w-4 h-4" /> },
            { id: 'integrations', label: 'Integrations', icon: <Sparkles className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeSection === tab.id
                  ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {/* SECTION 0: ACCOUNT & SYNC */}
          {activeSection === 'account' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
                {user ? (
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3.5">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500/40"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center ring-2 ring-cyan-500/40">
                          {(user.displayName || user.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">
                            {user.displayName || 'Google Account User'}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Signed In
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{user.email}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">UID: {user.uid}</p>
                      </div>
                    </div>

                    <button
                      onClick={onSignOut}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Sign in to AURA</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                        Connect your Google Account to sync tasks, calendar, notes, and memory securely with Firebase Firestore across all your phones and computers.
                      </p>
                    </div>
                    {onSignIn && (
                      <button
                        onClick={onSignIn}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-500/25 active:scale-95 transition-all cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign in with Google</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cloud Storage Status</h4>
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Firebase Firestore Database</span>
                  </div>
                  <span className="font-mono text-cyan-400 font-semibold">Active & Synced</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 1: VOICE */}
          {activeSection === 'voice' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Voice Engine
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'gemini-tts', title: 'Gemini Natural Voice', desc: 'Neural expressive model' },
                    { id: 'browser-tts', title: 'System Web Speech', desc: 'Standard low-latency voice' },
                  ].map((v) => (
                    <div
                      key={v.id}
                      onClick={() =>
                        setCurrent({
                          ...current,
                          voice: { ...current.voice, engine: v.id as any },
                        })
                      }
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        current.voice.engine === v.id
                          ? 'border-cyan-500 bg-cyan-950/30 text-white'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs">{v.title}</div>
                      <div className="text-[10px] text-slate-500">{v.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Gemini Voice Profile
                </label>
                <select
                  value={current.voice.voiceName}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      voice: { ...current.voice, voiceName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Kore">Kore (Warm, Balanced, Natural)</option>
                  <option value="Fenrir">Fenrir (Deep, Direct, Authoritative)</option>
                  <option value="Aoede">Aoede (Clear, Melodic, Expressive)</option>
                  <option value="Puck">Puck (Friendly, Dynamic, Energetic)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Speech Rate</span>
                  <span className="text-cyan-400">{current.voice.rate}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.05"
                  value={current.voice.rate}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      voice: { ...current.voice, rate: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          )}

          {/* SECTION 2: AI INTELLIGENCE */}
          {activeSection === 'ai' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Default Reasoning Model
                </label>
                <select
                  value={current.ai.model}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      ai: { ...current.ai, model: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (Fast, Multimodal & Grounded)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Ultra-Low Latency)</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Google Search Grounding</span>
                    <p className="text-[10px] text-slate-400">Attach verified Google Search citations to factual queries</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={current.ai.webSearchEnabled}
                    onChange={(e) =>
                      setCurrent({
                        ...current,
                        ai: { ...current.ai, webSearchEnabled: e.target.checked },
                      })
                    }
                    className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* SECTION 3: MEMORY */}
          {activeSection === 'memory' && (
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-slate-200">Persistent Personal Memory</span>
                  <p className="text-[10px] text-slate-400">Allow AURA to recall user-approved preferences, goals, and facts across sessions</p>
                </div>
                <input
                  type="checkbox"
                  checked={current.memory.enabled}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      memory: { ...current.memory, enabled: e.target.checked },
                    })
                  }
                  className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Clear All Long-term Memories</span>
                    <p className="text-[10px] text-slate-400">Irreversibly delete stored personal facts and knowledge</p>
                  </div>
                  <button
                    onClick={onClearMemories}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Delete All Memories
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PRIVACY & DATA */}
          {activeSection === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Export All Data (JSON)</span>
                    <p className="text-[10px] text-slate-400">Download tasks, calendar, notes, memories, and documents</p>
                  </div>
                  <button
                    onClick={onExportData}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Clear Conversation History</span>
                    <p className="text-[10px] text-slate-400">Reset voice chat thread</p>
                  </div>
                  <button
                    onClick={onClearHistory}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Messages</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: INTEGRATIONS */}
          {activeSection === 'integrations' && (
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-amber-300">Run in Demo Mode</span>
                  <p className="text-[10px] text-amber-200/80">Simulates tools and external APIs locally without sending live external network calls</p>
                </div>
                <input
                  type="checkbox"
                  checked={current.integrations.demoMode}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      integrations: { ...current.integrations, demoMode: e.target.checked },
                    })
                  }
                  className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span>Firebase Firestore Storage</span>
                  <span className="text-[10px] font-mono text-emerald-400">Connected (Live)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span>Google Calendar API</span>
                  <span className="text-[10px] font-mono text-emerald-400">Connected (Ready)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span>Knowledge Base Vector Index</span>
                  <span className="text-[10px] font-mono text-emerald-400">Indexed (In-Memory)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <span className="text-xs text-emerald-400 font-semibold">
            {savedSuccess ? 'Settings updated successfully!' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
