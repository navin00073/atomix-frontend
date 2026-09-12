import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { Play, Square, CheckCircle2, ChevronRight } from 'lucide-react';

export const OneClickDemoBanner: React.FC = () => {
  const { demoProgress, stopDemo, theme } = useHospital();

  if (!demoProgress.isRunning) return null;

  const pct = Math.round((demoProgress.step / demoProgress.totalSteps) * 100);

  return (
    <div className={`fixed bottom-4 right-4 left-4 md:left-auto md:right-8 md:w-[480px] z-50 backdrop-blur-2xl rounded-3xl p-4.5 shadow-2xl transition-all duration-300 border ${
      theme === 'dark'
        ? 'bg-slate-900/90 border-cyan-500/40 shadow-cyan-950/80 text-white'
        : 'bg-white/95 border-cyan-400/50 shadow-slate-300/80 text-slate-900'
    }`}>
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
          <span className="font-tech text-cyan-500 text-sm font-bold tracking-wider uppercase flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 fill-cyan-500" />
            End-to-End Hospital Demo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono-tech px-2.5 py-0.5 rounded-full border font-semibold ${
            theme === 'dark'
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60'
              : 'bg-cyan-50 text-cyan-700 border-cyan-200'
          }`}>
            Step {demoProgress.step} of {demoProgress.totalSteps} ({pct}%)
          </span>
          <button
            onClick={stopDemo}
            className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 transition font-semibold"
            title="Stop Demo"
          >
            <Square className="w-3 h-3" />
            Stop
          </button>
        </div>
      </div>

      <div className={`w-full h-2 rounded-full overflow-hidden mb-3 p-0.5 border ${
        theme === 'dark' ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-100 border-slate-200'
      }`}>
        <div
          className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm shadow-cyan-400/50"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-start gap-2.5">
        <div className="mt-0.5">
          <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-semibold flex items-center gap-1 ${
            theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
          }`}>
            {demoProgress.title}
          </h4>
          <p className={`text-xs mt-0.5 leading-relaxed ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {demoProgress.description}
          </p>
        </div>
      </div>

      <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-mono-tech ${
        theme === 'dark' ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-500'
      }`}>
        <span>Team AtomiX IoT Engine</span>
        <span className="text-cyan-500 flex items-center gap-1 font-semibold">
          Auto-navigating modules <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
