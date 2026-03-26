import React, { useState } from 'react';
import { calculateRequiredMarks } from '../src/domain/gpa/engine';

interface Props {
  subjects: any[];
}

const RequiredMarksTool: React.FC<Props> = ({ subjects }) => {
  const [targetSGPA, setTargetSGPA] = useState<string>('');
  const [result, setResult] = useState<number | null | 'IMPOSSIBLE' | 'ACHIEVED'>(null);

  const handleCalculate = () => {
    const target = parseFloat(targetSGPA);
    if (isNaN(target) || target < 0 || target > 4.0) return;

    const filledSubjects = subjects.filter((s) => s.marks !== '');
    const remainingSubjects = subjects.filter((s) => s.marks === '');

    const filledWeightedGP = filledSubjects.reduce(
      (sum, s) => sum + Number(s.gradePoint) * Number(s.credits),
      0,
    );
    const totalCredits = subjects.reduce((sum, s) => sum + Number(s.credits), 0);
    const remainingCredits = remainingSubjects.reduce((sum, s) => sum + Number(s.credits), 0);

    const required = calculateRequiredMarks(
      filledWeightedGP,
      totalCredits,
      remainingCredits,
      target,
    );
    setResult(required);
  };

  const remainingCount = subjects.filter((s) => s.marks === '').length;

  // ... (JSX reflects this in previous edit style)

  return (
    <div className="animate-zoom-in h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[18px]">query_stats</span>
        </div>
        <h3 className="text-sm font-black font-headline text-white uppercase tracking-widest text-shadow-glow">
          Marks Predictor
        </h3>
      </div>

      {remainingCount > 0 ? (
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black font-label text-zinc-500 uppercase tracking-widest ml-1">
                Target SGPA
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 3.50"
                  value={targetSGPA}
                  onChange={(e) => setTargetSGPA(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="flex-1 px-4 py-3 bg-bg-surface-lowest border border-white/5 rounded-xl outline-none focus:border-primary text-sm font-bold text-on-surface transition-all placeholder:text-zinc-600"
                />
                <button
                  onClick={handleCalculate}
                  className="px-6 py-3 rounded-xl bg-primary text-on-primary font-black font-label text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Predict
                </button>
              </div>
            </div>

            {result !== null && (
              <div className="mt-4 p-6 rounded-2xl bg-bg-surface-lowest border border-white/5 animate-slide-in-top">
                {result === 'IMPOSSIBLE' ? (
                  <div className="text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-2">
                      <span className="material-symbols-outlined text-xl">block</span>
                    </div>
                    <p className="text-[10px] font-black text-error uppercase tracking-widest">
                      Unattainable Goal
                    </p>
                    <p className="text-[10px] text-zinc-500 leading-relaxed px-4">
                      This target requires exceeding the 100-mark limitation in remaining subjects.
                    </p>
                  </div>
                ) : result === 'ACHIEVED' ? (
                  <div className="text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                      <span className="material-symbols-outlined text-xl">stars</span>
                    </div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                      Milestone Secured
                    </p>
                    <p className="text-[10px] text-zinc-500 leading-relaxed px-4">
                      Your current GPA metrics already satisfy or exceed this target threshold.
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                      Required Target Avg.
                    </p>
                    <h4 className="text-4xl font-black font-headline text-primary tracking-tighter shadow-primary/20">
                      {typeof result === 'number' ? result : result}
                    </h4>
                    <div className="pt-2">
                      <p className="text-[9px] text-zinc-500 font-medium italic leading-relaxed">
                        Average of {result} marks across {remainingCount} subjects required for{' '}
                        {parseFloat(targetSGPA).toFixed(2)} SGPA.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="material-symbols-outlined text-primary text-[16px]">
              pending_actions
            </span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
              {remainingCount} Subjects Remaining
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-bg-surface-lowest rounded-2xl border border-white/5 border-dashed">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 text-zinc-700">
            <span className="material-symbols-outlined text-3xl">done_all</span>
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            Calculations Finalized
          </p>
          <p className="text-[9px] text-zinc-700 mt-2 leading-relaxed">
            All subject marks have been recorded. No further predictions are applicable.
          </p>
        </div>
      )}
    </div>
  );
};

export default RequiredMarksTool;
