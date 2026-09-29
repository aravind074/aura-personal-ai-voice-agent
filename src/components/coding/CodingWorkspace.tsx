import React, { useState } from 'react';
import {
  Code2,
  Play,
  FileCode,
  Terminal,
  Sparkles,
  Copy,
  Check,
  FolderTree,
  Bug,
  HelpCircle,
  Database
} from 'lucide-react';

interface VirtualFile {
  path: string;
  name: string;
  language: string;
  content: string;
}

const INITIAL_FILES: VirtualFile[] = [
  {
    path: 'agentOrchestrator.ts',
    name: 'agentOrchestrator.ts',
    language: 'typescript',
    content: `// AURA Voice Agent Core Orchestrator
import { GoogleGenAI } from "@google/genai";

export interface ToolExecutionContext {
  toolName: string;
  parameters: Record<string, unknown>;
  userConfirmed: boolean;
}

export class AgentBrain {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async executePlan(query: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: \`Process voice request: \${query}\`,
    });
    return response.text || "Execution finished.";
  }
}`,
  },
  {
    path: 'schema.sql',
    name: 'schema.sql',
    language: 'sql',
    content: `-- PostgreSQL Relational Schema for Personal Voice Agent
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  user_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,
  },
  {
    path: 'dataPipeline.py',
    name: 'dataPipeline.py',
    language: 'python',
    content: `# Data processing and vector indexing
import numpy as np

def compute_cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    dot_product = np.dot(vec_a, vec_b)
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot_product / (norm_a * norm_b))

print("Vector search module loaded successfully.")`,
  },
];

interface CodingWorkspaceProps {
  onTriggerVoice: (cmd: string) => void;
}

export const CodingWorkspace: React.FC<CodingWorkspaceProps> = ({ onTriggerVoice }) => {
  const [files] = useState<VirtualFile[]>(INITIAL_FILES);
  const [activeFile, setActiveFile] = useState<VirtualFile>(INITIAL_FILES[0]);
  const [editorContent, setEditorContent] = useState(INITIAL_FILES[0].content);
  const [terminalOutput, setTerminalOutput] = useState<string>(
    `[AURA Terminal Sandbox v2.4]\nReady. TypeScript compiler active.\nRun 'Compile & Execute' to safely test code.`
  );
  const [copied, setCopied] = useState(false);

  const handleSelectFile = (file: VirtualFile) => {
    setActiveFile(file);
    setEditorContent(file.content);
  };

  const handleRunCode = () => {
    setTerminalOutput(`Executing ${activeFile.name} in virtual environment...\n`);
    setTimeout(() => {
      if (activeFile.language === 'typescript') {
        setTerminalOutput(
          `> tsc --noEmit ${activeFile.name}\n✓ Type-check passed with 0 errors.\n✓ Simulated sandbox runtime output:\n[AgentBrain] Initialized with GoogleGenAI client.\n[AgentBrain] Model 'gemini-3.8-flash' verified.`
        );
      } else if (activeFile.language === 'sql') {
        setTerminalOutput(
          `> psql -d aura_db -f ${activeFile.name}\nCREATE TABLE users (OK)\nCREATE TABLE user_memories (OK)\n✓ 2 relational tables created successfully.`
        );
      } else {
        setTerminalOutput(
          `> python3 ${activeFile.name}\nVector search module loaded successfully.\nExit code 0 (Success).`
        );
      }
    }, 400);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editorContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-sky-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Coding Assistant & Workspace</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate, explain, debug algorithms, SQL schemas, and inspect project code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onTriggerVoice('Explain the active code and suggest performance optimizations')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-sky-300 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>"Explain this code"</span>
          </button>
          <button
            onClick={handleRunCode}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Sandbox</span>
          </button>
        </div>
      </div>

      {/* Editor & Explorer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl">
        {/* Left: Virtual File Tree Explorer */}
        <div className="p-4 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/60 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <FolderTree className="w-4 h-4 text-sky-400" />
            <span>Project Files</span>
          </div>

          <div className="space-y-1">
            {files.map((f) => (
              <button
                key={f.path}
                onClick={() => handleSelectFile(f)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono text-left transition-all cursor-pointer ${
                  activeFile.path === f.path
                    ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{f.name}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400 mb-2">AI Code Actions</p>
            <div className="space-y-1.5">
              <button
                onClick={() => onTriggerVoice(`Generate unit tests for ${activeFile.name}`)}
                className="w-full text-left text-[11px] p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-300 transition-colors cursor-pointer"
              >
                + Generate Unit Tests
              </button>
              <button
                onClick={() => onTriggerVoice(`Check ${activeFile.name} for security vulnerabilities`)}
                className="w-full text-left text-[11px] p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-300 transition-colors cursor-pointer"
              >
                + Security Audit
              </button>
              <button
                onClick={() => onTriggerVoice('Generate a PostgreSQL schema for tasks and reminders')}
                className="w-full text-left text-[11px] p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-300 transition-colors cursor-pointer"
              >
                + Generate SQL Schema
              </button>
            </div>
          </div>
        </div>

        {/* Right: Code Editor & Terminal */}
        <div className="md:col-span-3 flex flex-col h-[520px]">
          {/* File Tab Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-300 font-semibold">{activeFile.name}</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {activeFile.language}
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Editor Area */}
          <div className="flex-1 bg-slate-950 p-4 overflow-auto">
            <textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="w-full h-full bg-transparent font-mono text-xs leading-relaxed text-slate-200 resize-none focus:outline-none selection:bg-sky-500/30"
              spellCheck={false}
            />
          </div>

          {/* Virtual Terminal Console */}
          <div className="h-40 border-t border-slate-800 bg-slate-950/95 p-3 font-mono text-xs text-slate-300 overflow-y-auto">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Execution Terminal Output</span>
            </div>
            <pre className="whitespace-pre-wrap text-emerald-300/90 leading-tight">
              {terminalOutput}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
