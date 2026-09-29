import React, { useState } from 'react';
import {
  Brain,
  Trash2,
  Plus,
  Search,
  CheckCircle,
  Shield,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Filter,
  AlertTriangle
} from 'lucide-react';
import { Memory, MemoryCategory } from '../../types/index.js';

interface MemoryManagerViewProps {
  memories: Memory[];
  onAddMemory: (mem: Partial<Memory>) => void;
  onDeleteMemory: (id: string) => void;
  onClearAllMemories: () => void;
  onTriggerVoice: (cmd: string) => void;
}

export const MemoryManagerView: React.FC<MemoryManagerViewProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearAllMemories,
  onTriggerVoice,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCat, setNewCat] = useState<MemoryCategory>('preferences');
  const [memoryEnabled, setMemoryEnabled] = useState(true);

  const filtered = memories.filter((m) => {
    if (!memoryEnabled) return false;
    if (selectedCategory !== 'ALL' && m.category !== selectedCategory) return false;
    if (search.trim() && !m.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    onAddMemory({
      content: newContent.trim(),
      category: newCat,
      importance: 'high',
      source: 'user_input',
      userApproved: true,
    });
    setNewContent('');
    setShowAddModal(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-rose-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Personal AI Memory</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explicitly approved personal knowledge, preferences, and goals retained across conversations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Master Memory Toggle */}
          <button
            onClick={() => setMemoryEnabled(!memoryEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
              memoryEnabled
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            {memoryEnabled ? <ToggleRight className="w-4 h-4 text-rose-400" /> : <ToggleLeft className="w-4 h-4" />}
            <span>Memory {memoryEnabled ? 'Active' : 'Disabled'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
        <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-200">Strict Privacy & Zero Hallucination Guarantee</p>
          <p className="text-slate-400 leading-relaxed">
            AURA only stores facts that you explicitly ask it to remember or confirm. Passwords, auth credentials, and private financial tokens are permanently excluded from memory retention.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved memories..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'preferences', 'work', 'goals', 'contacts', 'facts'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Memories List */}
      <div className="space-y-3">
        {!memoryEnabled ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Personal memory is currently disabled in your settings.
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No memories stored yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Tell Aura what to remember by voice: <span className="text-rose-300 font-medium">"Remember that I prefer TypeScript and concise answers"</span>
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add a Preference or Fact</span>
              </button>
            </div>
          </div>
        ) : (
          filtered.map((mem) => (
            <div
              key={mem.id}
              className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 capitalize">
                    {mem.category}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>User Approved</span>
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-100">{mem.content}</p>
                <p className="text-[10px] text-slate-500">
                  Source: {mem.source.replace('_', ' ')} • Added on{' '}
                  {new Date(mem.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => onDeleteMemory(mem.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Delete memory"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Danger Zone: Clear all memories */}
      {memories.length > 0 && (
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-300">Wipe All Stored Memory</h4>
            <p className="text-[11px] text-slate-500">Permanently erases all long-term context from the agent brain.</p>
          </div>
          <button
            onClick={onClearAllMemories}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold cursor-pointer transition-colors"
          >
            Clear All Memories
          </button>
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2">Remember Information</h2>
            <p className="text-xs text-slate-400 mb-4">
              Aura will recall this approved preference or fact in future interactions.
            </p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as MemoryCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                >
                  <option value="preferences">Personal Preference</option>
                  <option value="work">Work & Projects</option>
                  <option value="goals">Goals & Deadlines</option>
                  <option value="contacts">People & Contacts</option>
                  <option value="facts">General Fact</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Memory Content
                </label>
                <textarea
                  rows={3}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="e.g. Always include code snippets in TypeScript with strict typing."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
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
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  Save to Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
