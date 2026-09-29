import React from 'react';
import { Mic, MicOff, Volume2, Sparkles, Loader2, AlertCircle, Radio } from 'lucide-react';
import { AgentStatus } from '../../types/index.js';

interface VoiceOrbProps {
  status: AgentStatus;
  isListening: boolean;
  isSpeaking: boolean;
  onToggleListen: () => void;
  onInterrupt: () => void;
  statusDetail?: string;
  isWakeWordEnabled?: boolean;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  status,
  isListening,
  isSpeaking,
  onToggleListen,
  onInterrupt,
  statusDetail,
  isWakeWordEnabled = true,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'LISTENING':
        return {
          label: 'LISTENING',
          detail: 'I am listening...',
          badgeBg: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300',
          dotBg: 'bg-cyan-400 animate-ping',
          orbGlow: 'from-cyan-400/60 via-fuchsia-500/50 to-indigo-600/60 shadow-[0_0_80px_rgba(6,182,212,0.55)]',
          icon: <Mic className="w-10 h-10 text-cyan-200 animate-pulse" />,
        };
      case 'THINKING':
        return {
          label: 'THINKING',
          detail: 'Thinking...',
          badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
          dotBg: 'bg-amber-400 animate-ping',
          orbGlow: 'from-amber-400/50 via-purple-500/50 to-blue-600/40 shadow-[0_0_70px_rgba(245,158,11,0.45)]',
          icon: <Sparkles className="w-10 h-10 text-amber-300 animate-spin" />,
        };
      case 'SEARCHING':
        return {
          label: 'SEARCHING',
          detail: statusDetail || 'Searching the web...',
          badgeBg: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
          dotBg: 'bg-blue-400 animate-ping',
          orbGlow: 'from-blue-500/50 via-cyan-500/40 to-indigo-600/40 shadow-[0_0_70px_rgba(59,130,246,0.45)]',
          icon: <Loader2 className="w-10 h-10 text-blue-300 animate-spin" />,
        };
      case 'USING_TOOL':
        return {
          label: 'ACTION',
          detail: statusDetail || 'Executing requested action...',
          badgeBg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
          dotBg: 'bg-indigo-400 animate-ping',
          orbGlow: 'from-indigo-500/50 via-fuchsia-500/40 to-purple-600/40 shadow-[0_0_70px_rgba(99,102,241,0.45)]',
          icon: <Sparkles className="w-10 h-10 text-indigo-300 animate-pulse" />,
        };
      case 'GENERATING':
        return {
          label: 'GENERATING',
          detail: 'Preparing voice answer...',
          badgeBg: 'bg-violet-500/20 border-violet-500/40 text-violet-300',
          dotBg: 'bg-violet-400 animate-ping',
          orbGlow: 'from-violet-500/50 via-fuchsia-500/40 to-cyan-500/40 shadow-[0_0_75px_rgba(139,92,246,0.45)]',
          icon: <Loader2 className="w-10 h-10 text-violet-300 animate-spin" />,
        };
      case 'SPEAKING':
        return {
          label: 'SPEAKING',
          detail: 'Tap orb or speak to interrupt',
          badgeBg: 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300',
          dotBg: 'bg-fuchsia-400 animate-ping',
          orbGlow: 'from-fuchsia-500/60 via-cyan-400/50 to-indigo-600/60 shadow-[0_0_85px_rgba(217,70,239,0.55)]',
          icon: <Volume2 className="w-10 h-10 text-cyan-200 animate-bounce" />,
        };
      case 'ERROR':
        return {
          label: 'ERROR',
          detail: statusDetail || 'An error occurred',
          badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
          dotBg: 'bg-rose-400',
          orbGlow: 'from-rose-500/50 to-red-600/40 shadow-[0_0_60px_rgba(244,63,94,0.4)]',
          icon: <AlertCircle className="w-10 h-10 text-rose-300" />,
        };
      default:
        return {
          label: 'READY',
          detail: isWakeWordEnabled ? "Say 'Hey Aura', 'Hey Google', or 'Siri'" : 'Tap orb to speak',
          badgeBg: 'bg-slate-800/80 border-slate-700/60 text-slate-300',
          dotBg: 'bg-cyan-400',
          orbGlow: 'from-cyan-500/25 via-fuchsia-600/20 to-indigo-700/30 hover:shadow-[0_0_55px_rgba(6,182,212,0.35)]',
          icon: <Mic className="w-10 h-10 text-slate-200 group-hover:text-cyan-300 transition-colors" />,
        };
    }
  };

  const current = getStatusBadge();

  const handleClick = () => {
    if (isSpeaking) {
      onInterrupt();
    } else {
      onToggleListen();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 px-4">
      {/* Siri / Google Status Pill */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wider uppercase backdrop-blur-xl transition-all duration-300 ${current.badgeBg}`}
        >
          <span className={`w-2 h-2 rounded-full ${current.dotBg}`} />
          <span>{current.label}</span>
        </div>
      </div>

      {/* Main Siri / Google Chromatic Orb */}
      <div className="relative flex items-center justify-center">
        {/* Animated Concentric Glowing Halo Rings */}
        {(isListening || isSpeaking) && (
          <>
            <div className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-cyan-500/30 via-fuchsia-500/25 to-blue-500/30 animate-voice-ripple pointer-events-none" />
            <div className="absolute w-60 h-60 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/15 to-teal-500/20 animate-voice-ripple-slow pointer-events-none" />
          </>
        )}

        {/* Ambient Chromatic Glow */}
        <div
          className={`absolute w-40 h-40 rounded-full bg-gradient-to-tr transition-all duration-500 blur-2xl opacity-80 pointer-events-none ${current.orbGlow}`}
        />

        {/* Central Siri Glass Orb Button */}
        <button
          onClick={handleClick}
          type="button"
          aria-label={isSpeaking ? 'Interrupt speaking' : isListening ? 'Stop listening' : 'Start conversation'}
          className={`group relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center cursor-pointer border border-white/30 transition-all duration-300 transform active:scale-95 focus:outline-none ${
            isListening
              ? 'bg-gradient-to-br from-cyan-500 via-purple-600 to-fuchsia-600 scale-105 shadow-2xl shadow-cyan-500/40 ring-4 ring-cyan-400/40'
              : isSpeaking
              ? 'bg-gradient-to-br from-fuchsia-600 via-pink-600 to-cyan-600 scale-105 shadow-2xl shadow-fuchsia-500/40 ring-4 ring-fuchsia-400/40'
              : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 hover:border-cyan-400/60 hover:scale-105 shadow-xl shadow-black/80'
          }`}
        >
          {/* Internal rotating mesh refraction */}
          <div className="absolute inset-1 rounded-full bg-white/[0.08] backdrop-blur-md pointer-events-none overflow-hidden">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-400/20 via-transparent to-pink-500/20 animate-pulse" />
          </div>

          {/* Central Icon */}
          <div className="relative z-20 flex items-center justify-center">
            {current.icon}
          </div>
        </button>
      </div>

      {/* Siri / Google Style Subtitle Prompter */}
      <p className="mt-4 text-xs sm:text-sm font-medium text-slate-300 text-center tracking-wide transition-all duration-200">
        {current.detail}
      </p>
    </div>
  );
};
