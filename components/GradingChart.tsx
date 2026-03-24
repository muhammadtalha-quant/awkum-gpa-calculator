import React from 'react';
import { GRADE_RANGES } from '../constants';

interface Props {
  theme?: any;
}

const GradingChart: React.FC<Props> = () => {
  return (
    <div className="bg-[#121215] rounded-xl p-6 border border-[#27272a] mb-8">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[#fafafa] mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#a78bfa] text-[18px]">table_chart</span>
        AWKUM Grading Chart
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {GRADE_RANGES.map((range) => (
          <div
            key={range.label}
            className="flex flex-col items-center p-3 rounded-lg border border-[#27272a] bg-[#18181b] text-center transition-colors hover:border-[#a78bfa]/40"
          >
            <span className="text-lg font-bold text-[#a78bfa]">{range.label}</span>
            <span className="text-xs text-[#71717a] font-medium">{range.min}–{range.max}</span>
            <div className="mt-1 text-[10px] text-[#52525b] font-mono">{range.gpRange} GP</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradingChart;
