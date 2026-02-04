
import React from 'react';
import { GRADE_RANGES } from '../constants';

interface Props {
  theme: any;
}

const GradingChart: React.FC<Props> = ({ theme }) => {
  return (
    <div className={`${theme.card} rounded-2xl p-6 shadow-sm border ${theme.border} mb-8`}>
      <h3 className="text-lg font-semibold mb-4">AWKUM Grading Chart</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {GRADE_RANGES.map((range) => (
          <div key={range.label} className={`flex flex-col items-center p-3 rounded-lg border bg-black/5 text-center transition-colors hover:bg-black/10 ${theme.border}`}>
            <span className={`text-lg font-bold ${theme.accent}`}>{range.label}</span>
            <span className="text-xs opacity-60 font-medium">{range.min} - {range.max}</span>
            <div className="mt-1 text-[10px] opacity-40 font-mono">{range.gpRange} GP</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradingChart;
