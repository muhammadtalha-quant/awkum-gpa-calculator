import React, { useState } from 'react';
import { useAcademicStore } from '../src/domain/store';
import {
  calculateCGPA,
  distributeRetakeMarks,
  RetakeDistributionResult,
} from '../src/domain/gpa/engine';

interface Props {
  children?: React.ReactNode;
}

const RetakeOptimizer: React.FC<Props> = () => {
  const { semesters } = useAcademicStore();

  const currentCGPA = Number(
    calculateCGPA(semesters.map((s) => ({ sgpa: s.sgpa, credits: s.credits }))).toFixed(2),
  );
  const [targetCGPA, setTargetCGPA] = useState<string>(Math.min(4.0, currentCGPA + 0.5).toFixed(2));

  const hasSubjects = semesters.some((s) => s.subjects && s.subjects.length > 0);

  if (!hasSubjects) {
    return (
      <div className="p-10 text-center border-2 border-dashed border-[#27272a] rounded-xl bg-[#121215]">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 leading-relaxed">
          Strategy engine requires Subject-wise data.
          <br />
          <span className="opacity-60">
            Switch to Expert Mode and add subjects to optimize your CGPA.
          </span>
        </p>
      </div>
    );
  }

  const parsedTarget = parseFloat(targetCGPA);
  const isTargetValid = !isNaN(parsedTarget) && parsedTarget > currentCGPA && parsedTarget <= 4.0;

  const result = isTargetValid ? distributeRetakeMarks(semesters as any, parsedTarget) : null;

  const recommendations: RetakeDistributionResult[] = Array.isArray(result) ? result : [];
  const isTooHigh = result === 'TARGET_TOO_HIGH';
  const isNoEligible = result === 'NO_ELIGIBLE';

  return (
    <div className="p-8 sm:p-10 rounded-[2.5rem] border border-white/5 bg-bg-surface shadow-2xl animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl">rocket_launch</span>
          </div>
          <div>
            <h3 className="text-xl font-black font-headline text-white uppercase tracking-tight">
              Retake Strategy Engine
            </h3>
            <p className="text-[10px] font-bold font-label text-zinc-500 uppercase tracking-widest">
              Intelligence-driven mark optimization across eligible courses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-bg-surface-lowest px-6 py-4 rounded-2xl border border-white/5 shadow-inner-glow">
          <div className="text-right">
            <label className="block text-[9px] font-black font-label text-zinc-600 uppercase tracking-widest mb-0.5">
              Target CGPA
            </label>
            <input
              type="number"
              step="0.01"
              min={currentCGPA}
              max="4.00"
              value={targetCGPA}
              onChange={(e) => setTargetCGPA(e.target.value)}
              className={`w-20 bg-transparent outline-none text-right font-black font-headline text-2xl tracking-tighter transition-colors ${isTargetValid ? 'text-primary' : 'text-error'}`}
            />
          </div>
          <div className="w-px h-10 bg-white/5"></div>
          <div className="text-center">
            <p className="text-[9px] font-black text-zinc-600 uppercase">Current</p>
            <p className="text-lg font-black font-headline text-zinc-400">
              {currentCGPA.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Validation & Errors */}
      {!isTargetValid && (
        <div className="p-6 bg-error/10 border border-error/20 rounded-[2rem] text-error flex items-center justify-center gap-3 animate-bounce-short mb-8">
          <span className="material-symbols-outlined text-xl">warning</span>
          <p className="text-[10px] font-black uppercase tracking-widest">
            Target must be between {currentCGPA.toFixed(2)} and 4.00
          </p>
        </div>
      )}

      {isTooHigh && (
        <div className="p-6 bg-error/10 border border-error/20 rounded-[2rem] text-error flex items-center justify-center gap-3 animate-shake mb-8">
          <span className="material-symbols-outlined text-xl">block</span>
          <p className="text-[10px] font-black uppercase tracking-widest">
            Target mathematically unreachable with eligible retakes.
          </p>
        </div>
      )}

      {isNoEligible && (
        <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-bg-surface-lowest">
          <span className="material-symbols-outlined text-4xl text-zinc-800 mb-4">
            notifications_off
          </span>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 leading-relaxed max-w-sm mx-auto">
            No eligible retakes detected. <br />
            <span className="text-[10px] opacity-40 normal-case tracking-normal">
              Courses with scores ≥ 60 are ineligible under AWKUM policy.
            </span>
          </p>
        </div>
      )}

      {/* Strategy recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4 animate-slide-in-top">
          <div className="hidden sm:grid grid-cols-6 gap-4 px-8 mb-2 text-[9px] font-black font-label text-zinc-600 uppercase tracking-widest">
            <span className="col-span-2">Acquisition Target</span>
            <span className="text-center">Current Scan</span>
            <span className="text-center">Optimized Target</span>
            <span className="text-center">Metric Leap</span>
            <span className="text-right">Weight</span>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec) => {
              const jump = rec.requiredMarks - rec.currentMarks;
              return (
                <div
                  key={rec.subjectId}
                  className={`relative overflow-hidden group flex flex-col sm:grid sm:grid-cols-6 gap-4 items-center p-6 sm:p-8 rounded-[2rem] border bg-bg-surface-lowest transition-all duration-500 ${!rec.feasible ? 'border-error/20 opacity-60' : 'border-white/5 hover:border-primary/30 hover:shadow-primary/5 hover:-translate-y-1'}`}
                >
                  {/* Subject Identity */}
                  <div className="col-span-2 w-full flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-2xl">auto_modify</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black font-headline text-white truncate group-hover:text-primary transition-colors">
                        {rec.name}
                      </h4>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                        {rec.credits} Semester Credits
                      </p>
                    </div>
                  </div>

                  {/* Data Points */}
                  <div className="text-center w-full sm:w-auto">
                    <p className="sm:hidden text-[9px] font-black text-zinc-700 uppercase mb-1">
                      Current Scan
                    </p>
                    <span className="font-black font-mono text-zinc-700 line-through decoration-error/50 text-xl">
                      {rec.currentMarks}
                    </span>
                  </div>

                  <div className="text-center w-full sm:w-auto">
                    <p className="sm:hidden text-[9px] font-black text-zinc-700 uppercase mb-1">
                      Target Score
                    </p>
                    <div className="flex flex-col items-center">
                      <span
                        className={`font-black font-headline text-2xl tracking-tighter ${rec.feasible ? 'text-primary' : 'text-error'}`}
                      >
                        {rec.feasible ? rec.requiredMarks : 'FAIL'}
                      </span>
                      {!rec.feasible && (
                        <span className="text-[8px] font-black text-error uppercase">
                          Exceeds Cap
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-center w-full sm:w-auto">
                    <p className="sm:hidden text-[9px] font-black text-zinc-700 uppercase mb-1">
                      Metric Leap
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-black font-mono text-xs shadow-glow-sm">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span>+
                      {jump}
                    </div>
                  </div>

                  {/* Radial Weight Indicator */}
                  <div className="flex justify-end items-center gap-3 w-full sm:w-auto">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-white">{rec.weightPercent}%</p>
                      <p className="text-[8px] font-black text-zinc-700 uppercase tracking-tighter">
                        Impact
                      </p>
                    </div>
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 32 32">
                        <circle
                          cx="16"
                          cy="16"
                          r="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="text-zinc-900"
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="text-primary"
                          strokeDasharray={`${(rec.weightPercent / 100) * 88} 88`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-8 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-center gap-6 group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:animate-pulse">
              <span className="material-symbols-outlined text-3xl">lightbulb</span>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h5 className="text-xs font-black font-headline text-primary uppercase tracking-[0.1em] mb-2 text-shadow-glow">
                Intelligence Note
              </h5>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed italic">
                Marks are distributed proportionally based on credit weighting. Higher-weight
                subjects carry more impact on CGPA elevation. According to official AWKUM policy,
                only courses with scores strictly below 60 are eligible for retake optimization.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetakeOptimizer;
