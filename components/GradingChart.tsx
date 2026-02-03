
import React from 'react';
import { GRADE_RANGES } from '../constants';

const GradingChart: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">AWKUM Grading Chart</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {GRADE_RANGES.map((range) => (
          <div key={range.label} className="flex flex-col items-center p-3 rounded-lg border border-gray-100 bg-gray-50 text-center transition-colors hover:bg-gray-100">
            <span className="text-lg font-bold text-blue-600">{range.label}</span>
            <span className="text-xs text-gray-500 font-medium">{range.min} - {range.max}</span>
            <div className="mt-1 text-[10px] text-gray-400 font-mono">{range.gpRange} GP</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradingChart;
