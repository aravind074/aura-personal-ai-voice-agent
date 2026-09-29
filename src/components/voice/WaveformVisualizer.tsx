import React, { useEffect, useRef, useState } from 'react';
import { audioService } from '../../services/audioService.js';
import { AgentStatus } from '../../types/index.js';
import { Sparkles } from 'lucide-react';

export type VisualizerTheme = 'siri' | 'google' | 'bars';

interface WaveformVisualizerProps {
  status: AgentStatus;
  isActive: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ status, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [theme, setTheme] = useState<VisualizerTheme>('siri');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const freqData = audioService.getFrequencyData();
      let avgVolume = 0;
      for (let i = 0; i < freqData.length; i++) {
        avgVolume += freqData[i];
      }
      avgVolume = avgVolume / freqData.length;
      const energy = isActive && (status === 'LISTENING' || status === 'SPEAKING') ? Math.max(0.15, avgVolume / 180) : 0.05;

      phase += 0.06 + energy * 0.12;

      // 1. THEME: SIRI ACOUSTIC RIBBON
      if (theme === 'siri') {
        const lines = [
          { color: 'rgba(34, 211, 238, 0.85)', speed: 1.0, freq: 0.02, amp: 26 }, // Cyan
          { color: 'rgba(236, 72, 153, 0.8)', speed: -0.8, freq: 0.025, amp: 22 }, // Pink
          { color: 'rgba(168, 85, 247, 0.85)', speed: 1.3, freq: 0.018, amp: 24 }, // Purple
          { color: 'rgba(52, 211, 153, 0.75)', speed: -1.1, freq: 0.03, amp: 18 }, // Emerald
        ];

        ctx.lineWidth = 2.5;
        lines.forEach((line) => {
          ctx.beginPath();
          ctx.strokeStyle = line.color;
          ctx.shadowBlur = isActive ? 12 : 3;
          ctx.shadowColor = line.color;

          for (let x = 0; x <= width; x += 3) {
            // Windowing envelope to taper edges smoothly
            const envelope = Math.sin((x / width) * Math.PI);
            const y =
              height / 2 +
              Math.sin(x * line.freq + phase * line.speed) *
                (line.amp * energy * 1.8 + 2) *
                envelope;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
      }

      // 2. THEME: GOOGLE ASSISTANT 4 DOTS
      else if (theme === 'google') {
        const dots = [
          { color: '#4285F4', baseOffset: 0 }, // Google Blue
          { color: '#EA4335', baseOffset: 0.5 }, // Google Red
          { color: '#FBBC05', baseOffset: 1.0 }, // Google Yellow
          { color: '#34A853', baseOffset: 1.5 }, // Google Green
        ];

        const spacing = 34;
        const startX = width / 2 - (dots.length - 1) * (spacing / 2);

        dots.forEach((dot, idx) => {
          const x = startX + idx * spacing;
          const bounce = Math.sin(phase * 2 + dot.baseOffset) * (energy * 18 + 2);
          const y = height / 2 + (isActive ? bounce : 0);
          const radius = Math.max(5, Math.min(10, 6 + energy * 6));

          ctx.beginPath();
          ctx.fillStyle = dot.color;
          ctx.shadowBlur = isActive ? 14 : 4;
          ctx.shadowColor = dot.color;
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      }

      // 3. THEME: EQUALIZER BARS
      else {
        const barCount = 32;
        const barWidth = Math.max(3, width / barCount - 3);

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * (freqData.length / 2));
          const val = freqData[dataIndex] || 15;
          const barHeight = Math.max(4, (val / 255) * (height * 0.85) * (isActive ? 1 : 0.2));
          const x = i * (barWidth + 3) + 6;
          const y = (height - barHeight) / 2;

          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, '#38bdf8');
          gradient.addColorStop(0.5, '#818cf8');
          gradient.addColorStop(1, '#c084fc');
          ctx.fillStyle = gradient;

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 4);
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [status, isActive, theme]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-1">
      <canvas
        ref={canvasRef}
        width={380}
        height={56}
        className="w-full max-w-[380px] h-14"
      />

      {/* Siri / Google / Spectrum Visualizer Mode Selector */}
      <div className="flex items-center gap-1.5 mt-1 bg-slate-900/50 p-1 rounded-full border border-slate-800/60">
        <button
          onClick={() => setTheme('siri')}
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
            theme === 'siri'
              ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Siri Wave
        </button>
        <button
          onClick={() => setTheme('google')}
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
            theme === 'google'
              ? 'bg-slate-800 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Google Dots
        </button>
        <button
          onClick={() => setTheme('bars')}
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
            theme === 'bars'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Bars
        </button>
      </div>
    </div>
  );
};
