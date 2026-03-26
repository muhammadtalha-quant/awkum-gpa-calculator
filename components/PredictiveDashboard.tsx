import React from 'react';
import { useAcademicStore } from '../src/domain/store';
import { calculateProjectedCGPA } from '../src/domain/gpa/engine';

const PredictiveDashboard: React.FC = () => {
  const { semesters, projectionMode, setProjectionMode, futureCredits, setFutureCredits } =
    useAcademicStore();

  const projectedCGPA = calculateProjectedCGPA(semesters, projectionMode as any, futureCredits);

  const modes = [
    { id: 'current', label: 'Current Path', icon: '🎯' },
    { id: 'best', label: 'Best Case (4.00)', icon: '🚀' },
    { id: 'expected', label: 'Expected (Avg)', icon: '📊' },
    { id: 'worst', label: 'Worst Case (2.00)', icon: '⚠️' },
  ];

  return (
    <div className="p-8 sm:p-12 rounded-[3rem] border border-white/5 bg-bg-surface shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-slide-in-top relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 transition-colors duration-1000"></div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </div>
            <h3 className="text-[11px] font-black font-headline text-primary uppercase tracking-[0.4em]">
              Trajectory Simulation Engine
            </h3>
          </div>
          <p className="text-[10px] font-bold font-label text-zinc-600 uppercase tracking-widest pl-1">
            Predictive modeling for strategic academic planning
          </p>
        </div>

        <div className="flex items-center gap-4 bg-bg-surface-lowest p-1.5 rounded-2xl border border-white/5 shadow-inner-glow">
          <label className="text-[9px] font-black font-label text-zinc-600 uppercase tracking-widest ml-4">
            Residual Credits
          </label>
          <input
            type="number"
            min="0"
            max="120"
            value={futureCredits}
            onChange={(e) => setFutureCredits(parseInt(e.target.value) || 0)}
            className="w-24 px-4 py-2.5 bg-zinc-900/50 border border-white/5 rounded-xl outline-none text-center font-black text-primary transition-all focus:border-primary/50 shadow-soft"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16 relative z-10">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setProjectionMode(mode.id as any)}
            className={`group/btn p-8 rounded-[2rem] border transition-all duration-500 flex flex-col items-center gap-4 relative overflow-hidden ${
              projectionMode === mode.id
                ? 'border-primary/30 bg-primary/5 shadow-glow'
                : 'border-white/5 bg-bg-surface-lowest hover:border-white/10 hover:bg-white/[0.02]'
            }`}
          >
            <span className="text-3xl transition-transform duration-700 group-hover/btn:scale-125 group-hover/btn:rotate-6">
              {mode.icon}
            </span>
            <span
              className={`text-[9px] font-black font-label uppercase tracking-[0.2em] transition-colors ${projectionMode === mode.id ? 'text-primary' : 'text-zinc-600 group-hover/btn:text-zinc-400'}`}
            >
              {mode.label}
            </span>
            {projectionMode === mode.id && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-primary animate-slide-in-top"></div>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center py-12 text-center border-t border-white/5 bg-bg-surface-lowest rounded-b-[2.5rem] mt-4 relative z-10 shadow-inner-glow">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-bg-surface border border-white/5 -mt-4">
          <p className="text-[8px] font-black font-label text-zinc-500 uppercase tracking-[0.3em]">
            Projected Graduation Vector
          </p>
        </div>

        <div className="relative group/result">
          <span
            className={`text-8xl font-black font-headline tracking-tighter transition-all duration-1000 ${
              projectionMode === 'best'
                ? 'text-primary'
                : projectionMode === 'worst'
                  ? 'text-error'
                  : projectionMode === 'expected'
                    ? 'text-primary-fixed-dim'
                    : 'text-white'
            } text-shadow-glow`}
          >
            {projectedCGPA.toFixed(2)}
          </span>
          <div className="absolute -top-6 -right-12">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-current shadow-soft backdrop-blur-md animate-bounce-slow ${
                projectionMode === 'current'
                  ? 'bg-zinc-900/40 text-zinc-400'
                  : projectionMode === 'best'
                    ? 'bg-primary/20 text-primary'
                    : projectionMode === 'expected'
                      ? 'bg-primary-fixed-dim/20 text-primary-fixed-dim'
                      : 'bg-error/20 text-error'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              <span className="text-[9px] font-black font-label uppercase tracking-widest">
                Live Model
              </span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-[10px] font-bold font-label text-zinc-600 max-w-md leading-relaxed uppercase tracking-widest px-8">
          Executing logic on <span className="text-zinc-400">{futureCredits}</span> additional units
          at{' '}
          <span className="text-zinc-400">
            {projectionMode === 'best'
              ? 'Maximum 4.0 Efficiency'
              : projectionMode === 'worst'
                ? 'Critical 2.0 Maintenance'
                : projectionMode === 'expected'
                  ? 'Historical Performance Mean'
                  : 'Current Trajectory Baseline'}
          </span>
          .
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 opacity-20 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0">
        <span className="material-symbols-outlined text-[14px]">verified</span>
        <span className="text-[8px] font-black font-mono tracking-widest">
          COMPUTATIONAL PROJECTION V4.1
        </span>
      </div>
    </div>
  );
};

export default PredictiveDashboard;
