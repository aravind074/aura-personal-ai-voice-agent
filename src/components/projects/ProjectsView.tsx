import React, { useState } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  FileText,
  Activity,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Project } from '../../types/index.js';

interface ProjectsViewProps {
  projects: Project[];
  onTriggerVoice: (cmd: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onTriggerVoice,
}) => {
  const [selectedProj, setSelectedProj] = useState<Project | null>(projects[0] || null);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Project Workspaces</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Goal tracking, task linkage, milestone timelines, and automated weekly planning.
          </p>
        </div>

        <button
          onClick={() => onTriggerVoice('Create a project plan for my new initiative')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-xs font-semibold cursor-pointer transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>"Prepare project plan"</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No active project workspaces yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Ask Aura to create a structured project with goals and milestones by voice: <span className="text-indigo-300 font-medium">"Create a project plan for my research project"</span>
          </p>
          <div className="pt-2">
            <button
              onClick={() => onTriggerVoice('Create a project workspace for my new initiative')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project with Aura</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Project Cards */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Projects ({projects.length})
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => {
                const isSelected = selectedProj?.id === proj.id;
                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProj(proj)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500/60 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-200 truncate">{proj.name}</span>
                      <span className="font-mono text-indigo-400 font-bold">{proj.progress}%</span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2">{proj.description}</p>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-950 mt-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Project Plan */}
          <div className="md:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-6">
            {selectedProj ? (
              <>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                    Workspace
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">{selectedProj.name}</h2>
                  <p className="text-xs text-slate-300 mt-1">{selectedProj.description}</p>
                </div>

                {/* Goals */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Goals & Objectives
                  </h3>
                  <div className="space-y-1.5">
                    {selectedProj.goals.map((g, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{g}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Linked Tasks */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Linked Tasks ({selectedProj.tasks.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedProj.tasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                      >
                        <span className="text-slate-200 font-medium">{t.title}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            t.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Log */}
                {selectedProj.activityHistory && selectedProj.activityHistory.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Recent Activity
                    </h3>
                    <div className="space-y-2">
                      {selectedProj.activityHistory.map((act) => (
                        <div
                          key={act.id}
                          className="flex items-center gap-2 text-xs text-slate-400 p-2 rounded-xl bg-slate-950/40"
                        >
                          <Activity className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          <span className="text-slate-300">{act.action}</span>
                          <span className="text-[10px] text-slate-500 ml-auto">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center text-slate-500 text-sm">Select a project to view plan details</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
