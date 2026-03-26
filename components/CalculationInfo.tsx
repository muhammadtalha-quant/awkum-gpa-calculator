import React from 'react';

const CalculationInfo: React.FC = () => {
  return (
    <div className="bg-bg-surface rounded-3xl p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
        <span className="material-symbols-outlined text-8xl text-primary">analytics</span>
      </div>

      <div className="relative">
        <h3 className="text-sm font-black font-headline text-white uppercase tracking-widest mb-10 flex items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">functions</span>
          </span>
          Logic Framework
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="space-y-6">
            <div className="space-y-1">
              <h4 className="text-[10px] font-black font-label text-zinc-500 uppercase tracking-widest ml-1">
                Value Conversion Algorithm
              </h4>
              <p className="text-[11px] text-zinc-600 font-medium">
                Standard AWKUM linear scaling model (0.05 GP increments per unit mark).
              </p>
            </div>

            <div className="bg-bg-surface-lowest p-8 rounded-[2rem] font-mono text-xs border border-white/5 space-y-3 shadow-inner-glow">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-600 uppercase text-[9px] font-black tracking-widest">
                  Mark Threshold
                </span>
                <span className="text-zinc-600 uppercase text-[9px] font-black tracking-widest">
                  GP Coefficient
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white font-bold tracking-tight">Score ≥ 90</span>
                <span className="text-primary font-black text-lg">4.00</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-400">50 ≤ Score &lt; 90</span>
                <div className="text-right">
                  <span className="text-primary/60 font-black text-xs block">
                    2.00 + (Δ * 0.05)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-700">Score &lt; 50</span>
                <span className="text-error/40 font-black">0.00</span>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h4 className="text-[10px] font-black font-label text-zinc-500 uppercase tracking-widest ml-1">
              Computational Formulas
            </h4>
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 group/formula hover:bg-primary/10 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-[9px] font-black font-label text-primary uppercase tracking-widest">
                    Sessional Metric (SGPA)
                  </span>
                </div>
                <code className="block text-sm font-black font-mono text-zinc-400 group-hover/formula:text-white transition-colors">
                  ∑ (GP * Credits) / ∑ Credits
                </code>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 group/formula hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
                  <span className="text-[9px] font-black font-label text-zinc-500 uppercase tracking-widest">
                    Cumulative Metric (CGPA)
                  </span>
                </div>
                <code className="block text-sm font-black font-mono text-zinc-600 group-hover/formula:text-white transition-colors">
                  ∑ (SGPA * Sem. Credits) / ∑ Total Credits
                </code>
              </div>
            </div>
            <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest leading-relaxed">
              Official academic regulations apply to all automated calculations. Final transcript
              results may vary based on university records.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CalculationInfo;
