import React from 'react';
import { GRADE_RANGES } from '../../constants';

const UniversityRules: React.FC = () => {
  return (
    <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10">

      {/* Hero */}
      <section className="mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-[#fafafa]">Academic Regulations</h2>
        <p className="text-[#71717a] max-w-2xl text-lg mt-2">
          Detailed grading policy, mathematical frameworks, and institutional rules for AWKUM students.
        </p>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Grading Policy Table — 8 cols */}
        <div className="md:col-span-8 bg-[#121215] border border-[#27272a] rounded-xl p-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#a78bfa]">table_chart</span>
            <h3 className="text-xl font-bold tracking-tight text-[#fafafa]">Grading Policy Table</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272a] text-[#71717a] text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Marks Range</th>
                  <th className="py-3 px-4 font-medium">Letter Grade</th>
                  <th className="py-3 px-4 font-medium">Grade Point</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-[#fafafa]">
                {GRADE_RANGES.map((range, idx) => (
                  <tr
                    key={range.label}
                    className={`border-b border-[#27272a]/50 hover:bg-[#18181b] transition-colors ${idx === GRADE_RANGES.length - 1 ? 'border-none' : ''}`}
                  >
                    <td className="py-3 px-4 text-sm">{range.min === 0 ? 'Below 50%' : `${range.min}% - ${range.max}%`}</td>
                    <td className={`py-3 px-4 font-bold ${
                      range.label === 'F' ? 'text-[#ef4444]' :
                      range.label.startsWith('A') ? 'text-[#34d399]' :
                      range.label.startsWith('B') ? 'text-[#a78bfa]' : 'text-[#a1a1aa]'
                    }`}>
                      {range.label}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">{range.gpRange}</td>
                    <td className="py-3 px-4 text-sm text-[#a1a1aa]">
                      {range.label === 'F' ? 'Fail' :
                       range.label.startsWith('A') ? 'Excellent' :
                       range.label.startsWith('B') ? 'Very Good' : 'Good'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column — 4 cols */}
        <div className="md:col-span-4 space-y-6">

          {/* Passing Criteria */}
          <div className="bg-[#121215] border border-[#27272a] rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-2 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-7xl text-[#34d399]">check_circle</span>
            </div>
            <h3 className="text-xs font-bold text-[#34d399] uppercase tracking-widest mb-4">Passing Criteria</h3>
            <p className="text-4xl font-black mb-2 text-[#fafafa]">
              50% <span className="text-base font-normal text-[#71717a]">Minimum</span>
            </p>
            <p className="text-[#71717a] text-sm leading-relaxed">
              Students must secure at least 50% marks in both internal and external assessments to pass a course.
            </p>
          </div>

          {/* Academic Probation */}
          <div className="bg-[#121215] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#ef4444]">warning</span>
              <h3 className="font-bold text-[#fafafa]">Academic Probation</h3>
            </div>
            <ul className="space-y-4 text-sm text-[#a1a1aa]">
              <li className="flex gap-3">
                <span className="text-[#a78bfa] font-bold shrink-0">01</span>
                <span>A student is placed on probation if their CGPA falls below 2.00.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#a78bfa] font-bold shrink-0">02</span>
                <span>Two consecutive probations lead to dismissal from the program.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Formula Cards — full width */}
        <div className="md:col-span-6 bg-[#0c0c0f] border border-[#27272a] rounded-xl p-8 flex flex-col items-center text-center">
          <span className="text-xs font-black tracking-[0.2em] text-[#a78bfa] uppercase mb-6">SGPA Formula</span>
          <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-6 w-full mb-6 font-mono text-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <span className="border-b border-[#fafafa] px-4 pb-2 text-sm">∑(Grade Points × Credit Hours)</span>
              <span className="pt-2 text-sm">Total Credit Hours</span>
            </div>
          </div>
          <p className="text-sm text-[#71717a]">Calculated per semester based on individual course performance.</p>
        </div>

        <div className="md:col-span-6 bg-[#0c0c0f] border border-[#27272a] rounded-xl p-8 flex flex-col items-center text-center">
          <span className="text-xs font-black tracking-[0.2em] text-[#34d399] uppercase mb-6">CGPA Formula</span>
          <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-6 w-full mb-6 font-mono text-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <span className="border-b border-[#fafafa] px-4 pb-2 text-sm">∑(SGPA × Semester Credits)</span>
              <span className="pt-2 text-sm">Total Accumulated Credits</span>
            </div>
          </div>
          <p className="text-sm text-[#71717a]">Cumulative average of all semesters completed to date.</p>
        </div>

        {/* Marks → GP Formula */}
        <div className="md:col-span-12 bg-[#121215] border border-[#27272a] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[#a78bfa]">info</span>
            <h3 className="text-sm font-bold text-[#fafafa] uppercase tracking-wider">Marks → Grade Point Conversion</h3>
          </div>
          <div className="bg-[#0c0c0f] border border-[#27272a] rounded-lg p-5 font-mono text-sm space-y-2 border-l-4 border-l-[#a78bfa]">
            <p><span className="text-[#71717a]">IF</span> Marks ≥ 90:&nbsp;<span className="text-[#34d399]">GP = 4.00</span></p>
            <p><span className="text-[#71717a]">IF</span> 50 ≤ Marks &lt; 90:&nbsp;<span className="text-[#34d399]">GP = 2.00 + (Marks − 50) × 0.05</span></p>
            <p><span className="text-[#71717a]">IF</span> Marks &lt; 50:&nbsp;<span className="text-[#ef4444]">GP = 0.00 (Fail)</span></p>
          </div>
          <p className="text-xs text-[#71717a] mt-3">AWKUM uses a linear scaling system where every mark above 50 adds 0.05 to the Grade Point.</p>
        </div>

        {/* Decorative banner */}
        <div className="md:col-span-12 relative h-40 rounded-xl overflow-hidden group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "linear-gradient(135deg, #18181b 0%, #0c0c0f 50%, #1e1e22 100%)" }}
          />
          <div className="absolute inset-0 flex flex-col justify-center px-10">
            <h4 className="text-2xl font-bold tracking-tight text-[#fafafa]">Institutional Excellence</h4>
            <p className="text-[#c4b5fd] max-w-sm mt-2 text-sm">
              Adhering to the standard credit hour system mandated by the Higher Education Commission.
            </p>
          </div>
          <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10">
            <span className="material-symbols-outlined text-[100px] text-[#a78bfa]">school</span>
          </div>
        </div>

      </div>
    </main>
  );
};

export default UniversityRules;
