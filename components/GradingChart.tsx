import React from 'react';
import { GRADE_RANGES } from '../constants';

interface Props {
  children?: React.ReactNode;
}

const GradingChart: React.FC<Props> = () => {
  return (
    <div className="bg-bg-surface rounded-3xl p-8 sm:p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
        <span className="material-symbols-outlined text-8xl text-primary">analytics</span>
      </div>

      <h3 className="text-sm font-black font-headline text-white uppercase tracking-widest mb-10 flex items-center gap-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[20px]">table_chart</span>
        </div>
        Academic Vector Mapping
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 relative z-10">
        {GRADE_RANGES.map((range) => (
          <div
            key={range.label}
            className="group/item flex flex-col items-center p-6 rounded-2xl border border-white/5 bg-bg-surface-lowest hover:border-primary/30 transition-all duration-300 hover:shadow-primary/5 hover:translate-y-[-2px] relative overflow-hidden"
          >
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary/0 group-hover/item:bg-primary transition-all"></div>
            <span className="text-2xl font-black font-headline text-primary mb-1 tracking-tighter shadow-primary/20">
              {range.label}
            </span>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black font-label text-zinc-500 uppercase tracking-widest">
                {range.min}—{range.max}
              </span>
              <div className="mt-3 px-3 py-1 rounded-lg bg-zinc-900 border border-white/5 text-[9px] font-black font-mono text-zinc-400 group-hover/item:text-primary transition-colors uppercase tracking-widest">
                {range.gpRange} GP
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradingChart;
