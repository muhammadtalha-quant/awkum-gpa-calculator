import React from 'react';
import { GRADE_RANGES } from '../../constants';
import GradingChart from '../GradingChart';
import CalculationInfo from '../CalculationInfo';

const UniversityRules: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section>
        <h1
          className="text-4xl md:text-5xl font-black font-headline text-white tracking-tighter"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Academic Regulations
        </h1>
        <p className="text-zinc-500 font-body mt-2 max-w-2xl">
          Institutional framework and mathematical models governing the AWKUM grading system.
        </p>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Grading Policy Table — 8 cols */}
        <div className="lg:col-span-8 bg-bg-surface border border-white/5 rounded-[2rem] p-4 sm:p-8 overflow-hidden shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
              <span className="material-symbols-outlined">table_chart</span>
            </div>
            <h3 className="text-xl font-bold font-headline text-white">
              Institutional Grading Scale
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-zinc-500 font-label text-[10px] uppercase tracking-[0.2em] font-bold">
                  <th className="py-4 px-4">Marks Range</th>
                  <th className="py-4 px-4">Letter</th>
                  <th className="py-4 px-4">Grade Point</th>
                  <th className="py-4 px-4 text-right">Academic Status</th>
                </tr>
              </thead>
              <tbody className="text-on-surface">
                {GRADE_RANGES.map((range) => (
                  <tr
                    key={range.label}
                    className="border-b border-white/5 hover:bg-zinc-900/30 transition-colors group"
                  >
                    <td className="py-5 px-4 text-sm font-medium text-zinc-300">
                      {range.min === 0 ? 'Below 50%' : `${range.min}% - ${range.max}%`}
                    </td>
                    <td className="py-5 px-4 font-headline">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-black ${
                          range.label === 'F'
                            ? 'bg-error/10 text-error border border-error/20'
                            : range.label.startsWith('A')
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {range.label}
                      </span>
                    </td>
                    <td className="py-5 px-4 font-mono text-sm text-zinc-400">{range.gpRange}</td>
                    <td className="py-5 px-4 text-right text-xs font-label uppercase font-bold tracking-widest text-zinc-500">
                      {range.label === 'F'
                        ? 'Failure'
                        : range.label.startsWith('A')
                          ? 'Exceptional'
                          : range.label.startsWith('B')
                            ? 'Competent'
                            : 'Proficient'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column — 4 cols */}
        <div className="lg:col-span-4 space-y-8">
          {/* Passing Criteria */}
          <div className="bg-primary text-on-primary p-4 sm:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span
                className="material-symbols-outlined text-8xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-4">
              Passing Threshold
            </p>
            <div className="text-6xl font-black font-headline tracking-tighter mb-2">50%</div>
            <p className="text-sm opacity-80 leading-relaxed font-body">
              Mandatory minimum marks required across all assessment components to qualify for
              credit issuance.
            </p>
          </div>

          {/* Academic Probation */}
          <div className="bg-surface-container-low border border-white/5 rounded-[2rem] p-4 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-error">warning</span>
              <h3 className="font-headline font-bold text-white uppercase tracking-tight">
                Probation Policy
              </h3>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 border border-white/5">
                  <span className="text-[10px] font-bold text-primary">01</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed font-body">
                  Calculated at the end of each semester. Any CGPA below{' '}
                  <span className="text-white font-bold">2.00</span> triggers automatic probation
                  status.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 border border-white/5">
                  <span className="text-[10px] font-bold text-primary">02</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed font-body">
                  Two consecutive semesters on probation will result in{' '}
                  <span className="text-error font-bold">Dismissal</span> from the program
                  registration.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Math Models */}
        <div className="lg:col-span-6 bg-surface-container-low border border-white/5 rounded-[2rem] p-6 sm:p-10 flex flex-col items-center text-center shadow-lg">
          <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase mb-8">
            SGPA Model
          </span>
          <div className="w-full py-8 px-6 bg-zinc-950/50 rounded-2xl border border-white/5 mb-8">
            <div className="flex flex-col items-center gap-2 font-mono text-zinc-400">
              <span className="border-b border-zinc-700 pb-2 text-sm">
                ∑(Quality Points × Credit Hours)
              </span>
              <span className="text-sm">Total Semester Credits</span>
            </div>
          </div>
          <p className="text-xs text-zinc-600 font-label uppercase tracking-widest font-bold">
            Semester Assessment Metric
          </p>
        </div>

        <div className="lg:col-span-6 bg-surface-container-low border border-white/5 rounded-[2rem] p-6 sm:p-10 flex flex-col items-center text-center shadow-lg">
          <span className="text-[10px] font-black tracking-[0.2em] text-[#34d399] uppercase mb-8">
            CGPA Model
          </span>
          <div className="w-full py-8 px-6 bg-zinc-950/50 rounded-2xl border border-white/5 mb-8">
            <div className="flex flex-col items-center gap-2 font-mono text-zinc-400">
              <span className="border-b border-zinc-700 pb-2 text-sm">
                ∑(SGPA × Semester Credits)
              </span>
              <span className="text-sm">Total Program Credits</span>
            </div>
          </div>
          <p className="text-xs text-zinc-600 font-label uppercase tracking-widest font-bold">
            Cumulative Degree Metric
          </p>
        </div>

        {/* Marks to GP Conversion */}
        <div className="lg:col-span-12 bg-surface-container-low border border-white/5 rounded-[2rem] p-6 sm:p-10 shadow-lg glow-bg">
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-primary text-3xl">functions</span>
            <h3 className="text-xl font-bold font-headline text-white">
              Linear Transformation Logic
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-zinc-950/50 rounded-2xl border border-white/5 font-mono text-sm">
              <span className="text-zinc-600">RANGE A [90-100]</span>
              <p className="text-primary mt-2">GP = 4.00</p>
            </div>
            <div className="p-6 bg-zinc-950/50 rounded-2xl border border-white/5 font-mono text-sm relative overflow-hidden group">
              <span className="text-zinc-600">RANGE B-D [50-89]</span>
              <p className="text-[#34d399] mt-2 italic">GP = 2.00 + (M − 50) × 0.05</p>
            </div>
            <div className="p-6 bg-zinc-950/50 rounded-2xl border border-white/5 font-mono text-sm">
              <span className="text-zinc-600">RANGE F [0-49]</span>
              <p className="text-error mt-2">GP = 0.00</p>
            </div>
          </div>
          <p className="mt-8 text-sm text-zinc-500 font-body max-w-2xl leading-relaxed">
            AWKUM employs a high-resolution linear scaling system. For every single mark earned
            above 50, a student qualifies for an additional{' '}
            <span className="text-white font-bold">0.05</span> Grade Point, ensuring precise
            academic differentiation.
          </p>
        </div>
      </div>

      {/* Visual Grade Chart */}
      <GradingChart />

      {/* Calculation Formula Reference */}
      <CalculationInfo />
    </div>
  );
};

export default UniversityRules;
