import React, { useState } from 'react';
import { calculateRequiredSGPA } from '../src/domain/gpa/engine';

interface Props {
  currentCGPA: number;
  currentCredits: number;
  theme?: any;
}

const ForecastingTool: React.FC<Props> = ({ currentCGPA, currentCredits }) => {
  const [targetCGPA, setTargetCGPA] = useState<string>('');
  const [nextCredits, setNextCredits] = useState<number>(18);
  const [result, setResult] = useState<number | null | 'IMPOSSIBLE' | 'ACHIEVED'>(null);

  const handleCalculate = () => {
    const target = parseFloat(targetCGPA);
    if (isNaN(target) || target < 0 || target > 4.0) return;

    const required = calculateRequiredSGPA(currentCGPA, currentCredits, target, nextCredits);
    setResult(required);
  };

  return (
    <div className="p-8 sm:p-10 rounded-[2.5rem] border border-white/5 bg-bg-surface shadow-2xl animate-in zoom-in-95 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[20px]">timeline</span>
        </div>
        <div>
          <h3 className="text-sm font-black font-headline text-white uppercase tracking-widest text-shadow-glow">
            GPA Projection
          </h3>
          <p className="text-[9px] font-bold font-label text-zinc-600 uppercase tracking-widest mt-0.5">
            Predictive Academic Modeling
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black font-label text-zinc-500 uppercase tracking-widest ml-1">
              Target CGPA
            </label>
            <input
              type="text"
              placeholder="e.g. 3.00"
              value={targetCGPA}
              onChange={(e) => setTargetCGPA(e.target.value.replace(/[^0-9.]/g, ''))}
              className="w-full px-5 py-3.5 bg-bg-surface-lowest border border-white/5 rounded-2xl outline-none focus:border-primary text-sm font-bold text-white transition-all placeholder:text-zinc-800 shadow-inner-glow"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black font-label text-zinc-500 uppercase tracking-widest ml-1">
              Next Cycle Credits
            </label>
            <input
              type="number"
              min="1"
              max="21"
              value={nextCredits}
              onChange={(e) => setNextCredits(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-5 py-3.5 bg-bg-surface-lowest border border-white/5 rounded-2xl outline-none focus:border-primary text-sm font-bold text-white transition-all shadow-inner-glow"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black font-label text-zinc-400 uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary hover:border-primary transition-all duration-300 active:scale-[0.98] shadow-soft flex items-center justify-center gap-2 group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:animate-pulse">
            bolt
          </span>
          Execute Forecast
        </button>

        {result !== null && (
          <div className="mt-4 p-8 rounded-[2rem] bg-bg-surface-lowest border border-white/5 animate-in slide-in-from-bottom-4 duration-500 shadow-inner-glow">
            {result === 'IMPOSSIBLE' ? (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-2xl">error_outline</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-error uppercase tracking-widest">
                    Out of Range
                  </p>
                  <p className="text-[10px] text-zinc-600 leading-relaxed mt-1">
                    This target requires a GPA exceeding the 4.00 limitation in a single cycle.
                  </p>
                </div>
              </div>
            ) : result === 'ACHIEVED' ? (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                    Milestone Locked
                  </p>
                  <p className="text-[10px] text-zinc-600 leading-relaxed mt-1">
                    Your current metrics already satisfy or exceed this target threshold.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                  Required Vector
                </p>
                <div className="relative inline-block">
                  <h4 className="text-5xl font-black font-headline text-primary tracking-tighter shadow-primary/20">
                    {typeof result === 'number' ? result.toFixed(2) : result}
                  </h4>
                  <div className="absolute -top-1 -right-6">
                    <span className="px-1.5 py-0.5 rounded-md bg-primary/20 text-primary text-[8px] font-black uppercase">
                      Next
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 font-medium italic mt-4 px-4 leading-relaxed">
                  Execute with this SGPA across {nextCredits} credit units to finalize{' '}
                  {parseFloat(targetCGPA).toFixed(2)} CGPA.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between opacity-30 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">info</span>
          <span className="text-[8px] font-black uppercase tracking-widest">
            Simulation Mode Active
          </span>
        </div>
        <span className="text-[8px] font-black font-mono">V2.0.4 PRD</span>
      </div>
    </div>
  );
};

export default ForecastingTool;
