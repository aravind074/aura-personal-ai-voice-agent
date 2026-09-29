import React from 'react';
import { Square, Hand, Trash2, Mic, VolumeX, Volume2 } from 'lucide-react';

interface VoiceControlsProps {
  isSpeaking: boolean;
  isListening: boolean;
  onStopSpeaking: () => void;
  onInterrupt: () => void;
  onClearConversation: () => void;
  onToggleMute?: () => void;
  isMuted?: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isSpeaking,
  isListening,
  onStopSpeaking,
  onInterrupt,
  onClearConversation,
  onToggleMute,
  isMuted = false,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2 px-3">
      {/* Interrupt Button (Visible when speaking or active) */}
      {isSpeaking && (
        <button
          onClick={onInterrupt}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all active:scale-95 shadow-sm cursor-pointer"
          title="Interrupt speech and start speaking"
        >
          <Hand className="w-3.5 h-3.5" />
          <span>Interrupt</span>
        </button>
      )}

      {/* Stop Speaking */}
      {isSpeaking && (
        <button
          onClick={onStopSpeaking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all active:scale-95 shadow-sm cursor-pointer"
          title="Stop voice playback"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Stop Speaking</span>
        </button>
      )}

      {/* Mute Toggle */}
      {onToggleMute && (
        <button
          onClick={onToggleMute}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95 cursor-pointer ${
            isMuted
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
          }`}
          title={isMuted ? 'Unmute voice' : 'Mute voice'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span>{isMuted ? 'Muted' : 'Sound On'}</span>
        </button>
      )}

      {/* Clear Conversation */}
      <button
        onClick={onClearConversation}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200 transition-all active:scale-95 cursor-pointer"
        title="Clear chat history"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Clear Chat</span>
      </button>
    </div>
  );
};
