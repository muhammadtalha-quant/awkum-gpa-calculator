import React from 'react';
import { getProbationStatus } from '../src/domain/gpa/engine';

interface Props {
  cgpa: number;
  theme?: any;
}

const ProbationAlert: React.FC<Props> = ({ cgpa }) => {
  const status = getProbationStatus(cgpa);

  if (status === 'GOOD') return null;

  const isWarning = status === 'WARNING';

  // High-contrast styles for maximum visibility
  const containerStyles = isWarning
    ? 'bg-warning/10 border-warning/20 text-warning shadow-warning/10'
    : 'bg-error border-error/20 text-on-error shadow-error/20';

  const iconColor = isWarning ? 'text-warning' : 'text-on-error';
  const subtextColor = isWarning ? 'text-zinc-400' : 'text-white/80';
  const titleColor = isWarning ? 'text-warning' : 'text-white';

  const icon = isWarning ? 'warning' : 'report_problem';

  return (
    <div
      className={`mt-10 p-8 rounded-[2.5rem] border ${containerStyles} shadow-2xl animate-in fade-in slide-in-from-top-8 duration-1000 relative overflow-hidden group`}
    >
      {/* Background Accent */}
      {!isWarning && (
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <span className="material-symbols-outlined text-9xl">dangerous</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${isWarning ? 'bg-warning/10' : 'bg-white/20 shadow-inner'}`}
        >
          <span className={`material-symbols-outlined text-3xl ${iconColor}`}>{icon}</span>
        </div>
        <div className="text-center sm:text-left">
          <h4
            className={`text-[11px] font-black font-headline uppercase tracking-[0.4em] mb-3 ${titleColor} text-shadow-glow`}
          >
            {isWarning ? 'Academic Boundary Alert' : 'Critical Performance Status'}
          </h4>
          <p
            className={`text-base font-bold font-headline leading-relaxed italic ${isWarning ? 'text-white' : 'text-white'}`}
          >
            {isWarning
              ? `Current CGPA stands at ${cgpa.toFixed(2)}. This metric is approaching the 2.00 regulatory threshold. Strategic performance elevation in the upcoming cycle is imperative.`
              : `Current CGPA has fallen to ${cgpa.toFixed(2)}. AWKUM institutional policy mandates professional probation below 2.00. Sequential occurrences trigger immediate revocation of academic standing.`}
          </p>
          <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-4">
            <div
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 ${isWarning ? 'bg-white/5 text-zinc-400' : 'bg-white/10 text-white'}`}
            >
              Threshold 2.00
            </div>
            <div
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 ${isWarning ? 'bg-white/5 text-zinc-400' : 'bg-white/10 text-white'}`}
            >
              Policy Segment §4B
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProbationAlert;
