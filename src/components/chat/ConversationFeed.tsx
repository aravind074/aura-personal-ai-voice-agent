import React, { useRef, useEffect, useState } from 'react';
import { Send, Sparkles, Mic, ArrowDown } from 'lucide-react';
import { Message } from '../../types/index.js';
import { MessageItem } from './MessageItem.js';

interface ConversationFeedProps {
  messages: Message[];
  interimTranscript: string;
  isListening: boolean;
  onSendMessage: (text: string) => void;
  onPlayAudio?: (text: string) => void;
  onConfirmAction?: (actionType: string, payload: any, approved: boolean) => void;
  onStartListening?: () => void;
}

const SAMPLE_COMMANDS = [
  "What's on my schedule today?",
  "What tasks are pending?",
  "Remind me tomorrow at 10 AM to submit my assignment",
  "Summarize my project report",
  "Research the best laptops under budget and compare them",
  "Draft an email to my professor",
  "Analyze my Q3 sales CSV dataset",
  "Explain this code and optimize it",
];

export const ConversationFeed: React.FC<ConversationFeedProps> = ({
  messages,
  interimTranscript,
  isListening,
  onSendMessage,
  onPlayAudio,
  onConfirmAction,
  onStartListening,
}) => {
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            onPlayAudio={onPlayAudio}
            onConfirmAction={onConfirmAction}
          />
        ))}

        {/* Real-time Interim User Speech Transcript */}
        {isListening && interimTranscript && (
          <div className="flex flex-col items-end my-2">
            <div className="flex items-center gap-2 max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-sm bg-sky-500/20 border border-sky-400/40 text-sky-200 text-sm italic backdrop-blur-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>{interimTranscript}...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested Quick Voice Prompts */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Try asking:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {SAMPLE_COMMANDS.map((cmd, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(cmd)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-cyan-300 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Alternative Text Input Form */}
      <div className="p-3 sm:p-4 bg-slate-900/70 border-t border-slate-800/80 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Speak to Aura, or type your request..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/60 transition-all pr-12"
            />
            {onStartListening && (
              <button
                type="button"
                onClick={onStartListening}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all cursor-pointer"
                title="Speak"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md active:scale-95 transition-all cursor-pointer flex-shrink-0"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
