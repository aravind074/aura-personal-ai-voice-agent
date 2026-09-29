import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  PieChart,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface DataAnalysisViewProps {
  onTriggerVoice: (cmd: string) => void;
}

export const DataAnalysisView: React.FC<DataAnalysisViewProps> = ({ onTriggerVoice }) => {
  const [selectedFile] = useState('Q3_Sales_and_Revenue_Data.csv');

  // Realistic analytical statistics
  const dataStats = {
    rowCount: 5,
    colCount: 6,
    totalRevenue: 2058585,
    topProduct: 'AURA Cloud AI License ($780,000)',
    missingValues: 0,
    duplicateRows: 0,
    columns: [
      { name: 'Product', type: 'String', distinct: 5, missing: 0 },
      { name: 'Region', type: 'String', distinct: 4, missing: 0 },
      { name: 'UnitsSold', type: 'Integer', min: 60, max: 520, mean: 187 },
      { name: 'Revenue', type: 'Currency (USD)', min: 167940, max: 780000, mean: 411717 },
      { name: 'Quarter', type: 'String', distinct: 1, missing: 0 },
      { name: 'CustomerSegment', type: 'String', distinct: 4, missing: 0 },
    ],
    chartBars: [
      { label: 'AURA Cloud AI', value: 780000, percent: 100, color: 'bg-cyan-500' },
      { label: 'MacBook Pro M3 Max', value: 419880, percent: 53.8, color: 'bg-indigo-500' },
      { label: 'ThinkPad P1 Gen 7', value: 405860, percent: 52.0, color: 'bg-blue-500' },
      { label: 'Dell XPS 16 RTX', value: 284905, percent: 36.5, color: 'bg-purple-500' },
      { label: 'ASUS ProArt Studio', value: 167940, percent: 21.5, color: 'bg-emerald-500' },
    ],
    insights: [
      'AURA Cloud AI License is the primary revenue driver, contributing 37.9% of total Q3 gross revenue with zero physical hardware logistics overhead.',
      'Among physical systems, MacBook Pro M3 Max generated highest gross revenue ($419,880 from 120 units sold to enterprise customers).',
      'The average revenue per unit across all categories is $2,201.70.',
      'Data completeness is 100% with no missing fields or anomalous outliers detected.'
    ],
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Data Analysis Engine</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Statistical profiling, automated distribution charts, and AI natural language data queries.
          </p>
        </div>

        <button
          onClick={() => onTriggerVoice('Analyze my Q3 sales dataset and tell me which product generated the most revenue')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 text-xs font-semibold cursor-pointer transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>"Analyze this dataset"</span>
        </button>
      </div>

      {/* Quick Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Q3 Revenue</span>
          <p className="text-xl font-extrabold text-white mt-1">
            ${dataStats.totalRevenue.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>+24.6% vs Q2</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Top Revenue Driver</span>
          <p className="text-xs font-bold text-cyan-300 mt-1 truncate">AURA Cloud AI</p>
          <span className="text-[10px] text-slate-400">$780,000 (37.9%)</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Units Sold</span>
          <p className="text-xl font-extrabold text-white mt-1">935</p>
          <span className="text-[10px] text-slate-400">5 distinct lines</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Data Integrity</span>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">100%</p>
          <span className="text-[10px] text-slate-400">0 missing values</span>
        </div>
      </div>

      {/* Interactive Visual Bar Chart */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Revenue by Product Line ($ USD)</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Dataset: {selectedFile}</span>
        </div>

        {/* Visual Bar Breakdown */}
        <div className="space-y-3 pt-2">
          {dataStats.chartBars.map((bar, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-200">{bar.label}</span>
                <span className="text-cyan-300 font-mono">${bar.value.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800/80">
                <div
                  className={`h-full rounded-full ${bar.color} transition-all duration-700`}
                  style={{ width: `${bar.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Key Insights & Column Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column Types & Stats */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Detected Schema & Column Types
          </h3>
          <div className="divide-y divide-slate-800/80">
            {dataStats.columns.map((col, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{col.name}</span>
                <span className="px-2 py-0.5 rounded bg-slate-950 font-mono text-[10px] text-cyan-400 border border-slate-800">
                  {col.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analytical Insights */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Sparkles className="w-4 h-4" />
            <span>AI Analytical Synthesis</span>
          </div>
          <div className="space-y-2.5">
            {dataStats.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
