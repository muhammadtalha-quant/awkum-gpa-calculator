import React from 'react';
import { SGPASubject } from '../src/domain/types';

interface Props {
  subjects: SGPASubject[];
  onUpdate?: (id: string, field: string, value: string) => void;
  onRemove?: (id: string) => void;

  enableCodes?: boolean;
  maxCredits?: number;
}

const SubjectList: React.FC<Props> = ({ subjects, onUpdate, onRemove }) => {
  if (subjects.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-bg-surface shadow-2xl relative group">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-surface-lowest border-b border-white/5">
              <th className="px-8 py-5 text-[9px] font-black font-label uppercase tracking-[0.3em] text-zinc-500">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">label</span>
                  Registry Entry
                </div>
              </th>
              <th className="px-6 py-5 text-[9px] font-black font-label uppercase tracking-[0.3em] text-zinc-500 text-center">
                Units
              </th>
              <th className="px-6 py-5 text-[9px] font-black font-label uppercase tracking-[0.3em] text-zinc-500 text-center">
                Score
              </th>
              <th className="px-6 py-5 text-[9px] font-black font-label uppercase tracking-[0.3em] text-zinc-500 text-center">
                GP
              </th>
              <th className="px-8 py-5 text-[9px] font-black font-label uppercase tracking-[0.3em] text-zinc-500 text-right">
                Command
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {subjects.map((sub) => (
              <tr
                key={sub.id}
                className="group/row hover:bg-white/[0.01] transition-all duration-300"
              >
                <td className="px-8 py-6">
                  <div className="relative group/input">
                    <input
                      type="text"
                      value={sub.name}
                      onChange={(e) => onUpdate?.(sub.id, 'name', e.target.value)}
                      placeholder="Course identity…"
                      className="bg-transparent border-none outline-none text-white font-black font-headline text-sm w-full placeholder:text-zinc-800 focus:text-primary transition-colors pr-8"
                    />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/row:opacity-20 transition-opacity">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 text-center">
                  <div className="inline-flex items-center justify-center p-1 rounded-xl bg-bg-surface-lowest border border-white/5 shadow-inner-glow group-hover/row:border-white/10 transition-colors">
                    <input
                      type="number"
                      min={2}
                      max={6}
                      value={sub.credits}
                      onChange={(e) => onUpdate?.(sub.id, 'credits', e.target.value)}
                      className="bg-transparent border-none outline-none text-center w-12 font-black font-mono text-xs text-primary transition-all"
                    />
                  </div>
                </td>
                <td className="px-6 py-6 text-center">
                  <div className="inline-flex items-center justify-center p-1 rounded-xl bg-bg-surface-lowest border border-white/5 shadow-inner-glow group-hover/row:border-white/10 transition-colors">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={sub.marks === '' ? '' : sub.marks}
                      onChange={(e) => onUpdate?.(sub.id, 'marks', e.target.value)}
                      placeholder="00"
                      className="bg-transparent border-none outline-none text-center w-12 font-black font-mono text-xs text-primary transition-all placeholder:text-zinc-800"
                    />
                  </div>
                </td>
                <td className="px-6 py-6 text-center">
                  <span
                    className={`font-black font-mono text-sm px-3 py-1.5 rounded-lg ${
                      sub.gradePoint >= 3.5
                        ? 'text-primary bg-primary/10'
                        : sub.gradePoint >= 2.0
                          ? 'text-primary-fixed-dim bg-white/5'
                          : 'text-zinc-700'
                    }`}
                  >
                    {sub.gradePoint > 0 ? sub.gradePoint.toFixed(2) : '0.00'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button
                    onClick={() => onRemove?.(sub.id)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-error/0 text-error/30 hover:bg-error/10 hover:text-error transition-all group-hover/row:text-error/60"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubjectList;
