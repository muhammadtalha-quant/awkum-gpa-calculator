import React from 'react';
import { useAcademicStore } from '../src/domain/store';
import GPATrendChart from '../src/features/analytics/GPATrendChart';
import GradeDistributionChart from '../src/features/analytics/GradeDistributionChart';

interface Props {
  children?: React.ReactNode;
}

const AnalyticsDashboard: React.FC<Props> = () => {
  const { semesters } = useAcademicStore();

  // Prepare GPA Trend Data
  const trendData = semesters
    .filter((s) => s.sgpa > 0)
    .map((s, idx) => ({
      name: `Sem ${idx + 1}`,
      sgpa: Number(s.sgpa),
    }));

  // Prepare Grade Distribution Data
  const gradeCounts: { [key: string]: number } = {};
  semesters.forEach((s) => {
    if (s.subjects) {
      s.subjects.forEach((sub) => {
        gradeCounts[sub.gradeLetter] = (gradeCounts[sub.gradeLetter] || 0) + 1;
      });
    }
  });
  const distributionData = Object.entries(gradeCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([grade, count]) => ({ grade, count }));

  if (semesters.length === 0 || trendData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-bg-surface-lowest rounded-[3rem] border-2 border-dashed border-white/5 animate-in">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-zinc-800 mb-6">
          <span className="material-symbols-outlined text-4xl">analytics</span>
        </div>
        <h3 className="text-sm font-black font-headline text-zinc-500 uppercase tracking-widest">
          Analytics Layer Offline
        </h3>
        <p className="text-[10px] text-zinc-700 mt-2 text-center max-w-xs leading-relaxed">
          Populate your academic registry with course data to initialize the neural performance
          visualization engine.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-12 animate-slide-in-top">
      <div className="flex items-center gap-6">
        <div className="h-px bg-white/5 flex-1"></div>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[20px]">insights</span>
          <span className="text-[11px] font-black font-label text-zinc-500 uppercase tracking-[0.4em]">
            Intelligence Repository
          </span>
        </div>
        <div className="h-px bg-white/5 flex-1"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GPA Trend */}
        <div className="group p-10 rounded-[2.5rem] border border-white/5 bg-bg-surface hover:border-primary/20 transition-all duration-500 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl text-primary">trending_up</span>
          </div>
          <div className="relative">
            <h4 className="text-sm font-black font-headline text-white uppercase tracking-tight mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">show_chart</span>
              </span>
              Progression Analysis
            </h4>
            <GPATrendChart data={trendData} />
            <p className="mt-6 text-[9px] font-bold text-zinc-600 uppercase tracking-widest text-center italic">
              GPA development vector across temporal academic segments
            </p>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="group p-10 rounded-[2.5rem] border border-white/5 bg-bg-surface hover:border-primary/20 transition-all duration-500 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl text-primary">equalizer</span>
          </div>
          <div className="relative">
            <h4 className="text-sm font-black font-headline text-white uppercase tracking-tight mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">bar_chart</span>
              </span>
              Metric Distribution
            </h4>
            <GradeDistributionChart data={distributionData} />
            <p className="mt-6 text-[9px] font-bold text-zinc-600 uppercase tracking-widest text-center italic">
              Frequency density of mastered course classifications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
