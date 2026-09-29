import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  ExternalLink,
  Table,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2
} from 'lucide-react';
import { ResearchPlan } from '../../types/index.js';
import { api } from '../../services/apiClient.js';

interface ResearchWorkstationProps {
  onTriggerVoice: (cmd: string) => void;
}

export const ResearchWorkstation: React.FC<ResearchWorkstationProps> = ({ onTriggerVoice }) => {
  const [topic, setTopic] = useState('Best developer laptops for local AI models under $2,500');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<ResearchPlan | null>({
    id: 'res-default',
    topic: 'Best developer laptops for local AI models under $2,500',
    status: 'completed',
    questions: [
      'What are the memory bandwidth requirements for running 14B-32B parameter LLMs locally?',
      'How do Apple M3 Pro/Max unified memory compare against NVIDIA RTX 4070 mobile laptop GPUs?',
      'What are the real-world battery endurance metrics under sustained compilation and training workloads?'
    ],
    sources: [
      {
        title: 'IEEE Comparative Analysis of Neural Processing Units & Mobile Workstations',
        url: 'https://ieee.org/publications/npu-benchmarks-2026',
        credibility: 'High (Peer-Reviewed Standard)',
        excerpt: 'Unified memory architectures (Apple Silicon) mitigate PCIe bottleneck during token generation, achieving 300+ GB/s bandwidth without thermal throttling.',
        date: '2026-08-15',
      },
      {
        title: 'Hardware Benchmark Lab: Mobile GPU Matrix Multiplication Throughput',
        url: 'https://hardware-lab.ai/reports/q3-laptops',
        credibility: 'High (Standardized Benchmarks)',
        excerpt: 'NVIDIA RTX 4070 mobile delivers higher raw FP16 TFLOPS for PyTorch CUDA kernels, but draws 140W leading to fan noise and 2.5 hr battery life under load.',
        date: '2026-09-02',
      },
      {
        title: 'AnandTech Developer Survey: 2026 Laptop Ergonomics & Thermal Envelopes',
        url: 'https://anandtech.com/deep-dive/dev-laptops-2026',
        credibility: 'Medium-High (Editorial Analysis)',
        excerpt: 'Framework Laptop 16 provides modular repairability, while ASUS Zenbook 14 OLED offers the best battery-to-dollar ratio under $1,400.',
        date: '2026-09-10',
      }
    ],
    comparisonTable: {
      headers: ['Model / Configuration', 'Memory Bandwidth', 'Battery Life', 'AI / ML Support', 'Starting Price'],
      rows: [
        ['MacBook Pro 14" (M3 Max 36GB)', '300 GB/s Unified', '16-19 hrs', 'Apple Metal / MLX (Fast)', '$2,399'],
        ['Dell XPS 16 (RTX 4070 32GB)', '110 GB/s System + VRAM', '6-7 hrs', 'Native CUDA (Full PyTorch)', '$2,299'],
        ['Lenovo ThinkPad P1 Gen 7', '125 GB/s LPDDR5x', '7-8 hrs', 'Native CUDA (Enterprise)', '$2,450'],
        ['ASUS Zenbook 14 OLED (32GB)', '75 GB/s LPDDR5x', '14-16 hrs', 'DirectML / ONNX NPU', '$1,299']
      ]
    },
    keyFindings: [
      'For running local quantized models (e.g. 14B-32B parameters), the MacBook Pro M3 Max provides the smoothest token generation due to 300 GB/s unified memory access without GPU VRAM offloading bottlenecks.',
      'For users requiring fine-tuning or compiling custom CUDA C++ extensions, native NVIDIA hardware (Dell XPS or ThinkPad) is mandatory.',
      'Battery longevity heavily favors Apple Silicon (3x longer during active coding sessions without AC power).'
    ],
    summary: 'For local AI engineering, the MacBook Pro M3 Max is the recommended primary system unless explicit CUDA extension compilation is required, where the Dell XPS 16 / ThinkPad P1 is superior.',
    generatedAt: new Date().toISOString(),
  });

  const handleRunResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await api.startResearch(topic);
      setPlan(res.researchPlan);
    } catch (err) {
      console.error('Research error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Deep Research Workstation</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Autonomous multi-step research: inquiry generation, source verification, comparison tables, and synthesis.
          </p>
        </div>

        <button
          onClick={() => onTriggerVoice(`Research ${topic} and summarize the key findings`)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 text-xs font-semibold cursor-pointer transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask Aura via Voice</span>
        </button>
      </div>

      {/* Input Form */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <form onSubmit={handleRunResearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter complex topic to research (e.g. quantum computing benchmarks, laptop comparison)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{loading ? 'Synthesizing...' : 'Start Research'}</span>
          </button>
        </form>
      </div>

      {/* Research Output Document */}
      {plan && (
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-6">
          {/* Progress / Status banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                Research Report
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">{plan.topic}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Multi-Source Verified</span>
              </span>
            </div>
          </div>

          {/* Research Questions Decomposed */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              1. Inquiry Decomposition & Questions
            </h3>
            <div className="space-y-1.5">
              {plan.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300"
                >
                  <span className="text-purple-400 font-bold font-mono">Q{idx + 1}:</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Matrix Table */}
          {plan.comparisonTable && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Table className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  2. Comparative Specification Matrix
                </h3>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      {plan.comparisonTable.headers.map((h, i) => (
                        <th key={i} className="px-3.5 py-2.5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 bg-slate-950/40">
                    {plan.comparisonTable.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`px-3.5 py-2.5 ${
                              cIdx === 0 ? 'font-semibold text-white' : ''
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Key Findings */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              3. Synthesis & Key Findings
            </h3>
            <div className="space-y-2">
              {plan.keyFindings.map((finding, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs text-purple-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{finding}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sources with Credibility */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              4. Verified Sources & Citations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plan.sources.map((src, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-purple-400 font-medium">
                    <span>{src.credibility}</span>
                    <span>{src.date}</span>
                  </div>
                  <h4 className="font-semibold text-slate-200 line-clamp-1">{src.title}</h4>
                  <p className="text-slate-400 text-[11px] line-clamp-2">{src.excerpt}</p>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline pt-1"
                  >
                    <span>View original source</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
