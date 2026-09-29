import React, { useState } from 'react';
import {
  Bot,
  User,
  Copy,
  Check,
  Volume2,
  ExternalLink,
  Calendar,
  CheckSquare,
  Search,
  FileText,
  Mail,
  Cpu,
  Database,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Message, SourceReference, ToolExecution } from '../../types/index.js';

interface MessageItemProps {
  message: Message;
  onPlayAudio?: (text: string) => void;
  onConfirmAction?: (actionType: string, payload: any, approved: boolean) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onPlayAudio,
  onConfirmAction,
}) => {
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'calendar':
        return <Calendar className="w-3.5 h-3.5 text-blue-400" />;
      case 'tasks':
      case 'reminders':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case 'webSearch':
      case 'researchPlanner':
        return <Search className="w-3.5 h-3.5 text-amber-400" />;
      case 'documents':
        return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-rose-400" />;
      case 'dataAnalysis':
        return <Database className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-violet-400" />;
    }
  };

  return (
    <div
      className={`group flex flex-col w-full my-3 transition-all duration-200 ${
        isAssistant ? 'items-start' : 'items-end'
      }`}
    >
      <div
        className={`flex items-start gap-3 max-w-[92%] sm:max-w-[85%] md:max-w-[78%] ${
          isAssistant ? 'flex-row' : 'flex-row-reverse'
        }`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm ${
            isAssistant
              ? 'bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 border-cyan-400/40 text-white'
              : 'bg-gradient-to-tr from-slate-700 to-slate-800 border-slate-600 text-slate-300'
          }`}
        >
          {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>

        {/* Bubble */}
        <div
          className={`relative px-4 py-3.5 rounded-2xl text-sm leading-relaxed border transition-all ${
            isAssistant
              ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-md backdrop-blur-md rounded-tl-sm'
              : 'bg-gradient-to-r from-sky-600 to-blue-600 border-sky-500/50 text-white shadow-md rounded-tr-sm'
          }`}
        >
          {/* Tool execution cards if any */}
          {message.toolExecutions && message.toolExecutions.length > 0 && (
            <div className="mb-3 space-y-1.5 border-b border-slate-800/80 pb-2.5">
              {message.toolExecutions.map((t: ToolExecution) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/70 text-xs text-slate-300"
                >
                  {getToolIcon(t.toolName)}
                  <span className="font-semibold text-slate-200 capitalize">
                    {t.toolName.replace(/([A-Z])/g, ' $1')}:
                  </span>
                  <span className="text-slate-400 truncate">{t.actionDescription}</span>
                  <span className="ml-auto text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">
                    Done
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Formatted Message Content */}
          <div className="whitespace-pre-wrap font-normal select-text">
            {message.content.split('\n').map((line, idx) => {
              if (line.startsWith('• ') || line.startsWith('- ')) {
                return (
                  <div key={idx} className="flex items-start gap-2 my-0.5 ml-1">
                    <span className="text-cyan-400 text-base leading-none">•</span>
                    <span>{line.replace(/^[•\-]\s*/, '')}</span>
                  </div>
                );
              }
              if (line.startsWith('> ')) {
                return (
                  <blockquote
                    key={idx}
                    className="border-l-2 border-cyan-500/50 pl-2.5 py-1 my-1.5 italic text-slate-300 bg-slate-950/40 rounded-r"
                  >
                    {line.replace(/^>\s*/, '')}
                  </blockquote>
                );
              }
              return (
                <p key={idx} className={line === '' ? 'h-2' : 'my-0.5'}>
                  {line}
                </p>
              );
            })}
          </div>

          {/* High Impact Action Confirmation Box */}
          {message.requiresActionConfirmation && onConfirmAction && (
            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Action Confirmation Required</span>
              </div>
              <p className="text-slate-300 mb-2">{message.requiresActionConfirmation.title}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onConfirmAction(
                      message.requiresActionConfirmation!.actionType,
                      message.requiresActionConfirmation!.payload,
                      true
                    )
                  }
                  className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold active:scale-95 transition-all cursor-pointer"
                >
                  Confirm & Send
                </button>
                <button
                  onClick={() =>
                    onConfirmAction(
                      message.requiresActionConfirmation!.actionType,
                      message.requiresActionConfirmation!.payload,
                      false
                    )
                  }
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Source Citations */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-800/80">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Sources & References
              </p>
              <div className="flex flex-wrap gap-1.5">
                {message.sources.map((src: SourceReference, sIdx: number) => (
                  <a
                    key={sIdx}
                    href={src.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-[11px] text-cyan-300 hover:text-cyan-200 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{src.title}</span>
                    {src.date && <span className="text-slate-500 text-[10px]">({src.date})</span>}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Message Meta & Action Buttons */}
          <div
            className={`flex items-center justify-between gap-3 mt-2 text-[10px] text-slate-400 ${
              isAssistant ? 'border-t border-slate-800/60 pt-1.5' : 'text-sky-100'
            }`}
          >
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 opacity-60" />
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>

            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              {isAssistant && onPlayAudio && (
                <button
                  onClick={() => onPlayAudio(message.content)}
                  className="p-1 hover:text-cyan-300 transition-colors cursor-pointer"
                  title="Speak message aloud"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleCopy}
                className="p-1 hover:text-cyan-300 transition-colors cursor-pointer"
                title="Copy text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
