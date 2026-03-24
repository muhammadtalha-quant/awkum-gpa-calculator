import React from 'react';
import { SGPASubject } from '../src/domain/types';

interface Props {
  subjects: SGPASubject[];
  onUpdate?: (id: string, field: string, value: string) => void;
  onRemove?: (id: string) => void;
  theme?: any;
  enableCodes?: boolean;
  maxCredits?: number;
}

const SubjectList: React.FC<Props> = ({ subjects, onUpdate, onRemove }) => {
  if (subjects.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#18181b] border-b border-[#27272a]">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#71717a]">Course Name</th>
            <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-[#71717a] text-center">Cr. Hours</th>
            <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-[#71717a] text-center">Marks</th>
            <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-[#71717a] text-center">GPA</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#71717a] text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#27272a]">
          {subjects.map(sub => (
            <tr key={sub.id} className="hover:bg-[#18181b] transition-colors">
              <td className="px-6 py-4">
                <input
                  type="text"
                  value={sub.name}
                  onChange={e => onUpdate?.(sub.id, 'name', e.target.value)}
                  placeholder="Course name…"
                  className="bg-transparent border-none outline-none text-[#fafafa] w-full placeholder:text-[#52525b]"
                />
              </td>
              <td className="px-4 py-4 text-center">
                <input
                  type="number"
                  min={2} max={6}
                  value={sub.credits}
                  onChange={e => onUpdate?.(sub.id, 'credits', e.target.value)}
                  className="bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-center w-16 focus:border-[#a78bfa] outline-none text-[#fafafa]"
                />
              </td>
              <td className="px-4 py-4 text-center">
                <input
                  type="number"
                  min={0} max={100}
                  value={sub.marks === '' ? '' : sub.marks}
                  onChange={e => onUpdate?.(sub.id, 'marks', e.target.value)}
                  placeholder="0-100"
                  className="bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-center w-16 focus:border-[#a78bfa] outline-none text-[#fafafa] placeholder:text-[#52525b]"
                />
              </td>
              <td className="px-4 py-4 text-center font-mono text-[#34d399] font-bold">
                {sub.gradePoint > 0 ? sub.gradePoint.toFixed(2) : '—'}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onRemove?.(sub.id)}
                  className="text-[#ef4444] opacity-60 hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubjectList;
