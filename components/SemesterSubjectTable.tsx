import React, { useEffect } from 'react';
import { SGPASubject, asMark, asCredit, Mark, GradePoint } from '../src/domain/types';
import { getLetterFromGP, calculateGradePoint } from '../src/domain/grading/engine';
import { isValidCourseCode, sanitizeSubjectName } from '../src/core/validation';

interface Props {
  semesterId: string;
  subjects: SGPASubject[];
  onUpdate: (semesterId: string, updatedSubjects: SGPASubject[]) => void;
}

const SemesterSubjectTable: React.FC<Props> = ({ semesterId, subjects, onUpdate }) => {
  const MAX_CREDITS_PER_SEM = 21;
  const MAX_ROWS = 7;

  // Credit Hour Pruning logic
  useEffect(() => {
    const totalCredits = subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
    if (totalCredits > MAX_CREDITS_PER_SEM) {
      let current = [...subjects];
      // Remove subjects from the end until we are within limits
      while (
        current.reduce((sum, s) => sum + (Number(s.credits) || 0), 0) > MAX_CREDITS_PER_SEM &&
        current.length > 1
      ) {
        current.pop();
      }
      // Only update if we actually removed something to avoid infinite loops if logic is slightly off
      if (current.length < subjects.length) {
        onUpdate(semesterId, current);
      }
    }
  }, [subjects, semesterId, onUpdate]);

  const addRow = () => {
    const currentTotalCredits = subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
    // Ensure there is room for at least 3 credits (default new subject credits)
    if (subjects.length >= MAX_ROWS || MAX_CREDITS_PER_SEM - currentTotalCredits < 3) return;

    // Create new subject
    const newSubject: SGPASubject = {
      id: (Date.now() + Math.random()).toString(),
      name: '',
      code: '',
      credits: asCredit(3),
      marks: '' as Mark | '',
      gradePoint: 0 as GradePoint,
      gradeLetter: 'F',
    };

    onUpdate(semesterId, [...subjects, newSubject]);
  };

  const removeRow = (subjectId: string) => {
    if (subjects.length <= 1) return; // Keep at least one row? SGPA tab keeps 1.
    const updated = subjects.filter((s) => s.id !== subjectId);
    onUpdate(semesterId, updated);
  };

  const handleInputChange = (subjectId: string, field: keyof SGPASubject, value: string) => {
    const updatedSubjects = subjects.map((s) => {
      if (s.id === subjectId) {
        let finalVal = value;

        // Name validation
        if (field === 'name') finalVal = sanitizeSubjectName(value);

        // Code validation
        if (field === 'code') {
          finalVal = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        }

        // Credits validation (0-6)
        if (field === 'credits') {
          let num = parseInt(value.replace(/\D/g, ''));
          if (isNaN(num)) finalVal = '';
          else {
            if (num > 6) num = 6;
            finalVal = num.toString();
          }
        }

        // Marks validation (0-100)
        if (field === 'marks') {
          let num = parseInt(value.replace(/\D/g, ''));
          if (isNaN(num)) finalVal = '';
          else {
            if (num > 100) num = 100;
            finalVal = num.toString();
          }
        }

        const updated = { ...s };
        if (field === 'name') updated.name = finalVal;
        if (field === 'code') updated.code = finalVal;
        if (field === 'credits') updated.credits = asCredit(Number(finalVal) || 0);
        if (field === 'marks') updated.marks = finalVal === '' ? '' : asMark(Number(finalVal));

        // Calculate Grade Point automatically if marks change
        if (field === 'marks') {
          if (updated.marks !== '') {
            const gp = calculateGradePoint(updated.marks as Mark);
            updated.gradePoint = gp;
            updated.gradeLetter = getLetterFromGP(gp);
          } else {
            updated.gradePoint = 0 as GradePoint;
            updated.gradeLetter = 'F';
          }
        }

        return updated;
      }
      return s;
    });
    onUpdate(semesterId, updatedSubjects);
  };

  const handleBlur = (subjectId: string, field: keyof SGPASubject, value: string) => {
    if (field === 'credits') {
      const num = parseInt(value);
      if (isNaN(num) || num < 1) {
        // 1 or 2 as min? SGPA says 2. Let's use 2 to match SGPA.
        // Actually SGPA Calculator has "if (isNaN(num) || num < 2) handleInputChange(id, 'credits', '2');"
        // I should stick to that.
        handleInputChange(subjectId, 'credits', '2');
      }
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-bg-surface-lowest/50 rounded-3xl p-6 mb-6 border border-white/5 shadow-inner-glow">
      <table className="w-full text-left min-w-[700px] border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th className="px-5 py-3 text-[10px] font-black font-label text-zinc-500 uppercase tracking-[0.2em] w-[30%]">
              Course Name
            </th>
            <th className="px-5 py-3 text-[10px] font-black font-label text-zinc-500 uppercase tracking-[0.2em] w-[15%]">
              Catalog ID
            </th>
            <th className="px-2 py-3 text-[10px] font-black font-label text-zinc-500 uppercase tracking-[0.2em] w-[12%] text-center">
              Weight
            </th>
            <th className="px-2 py-3 text-[10px] font-black font-label text-zinc-500 uppercase tracking-[0.2em] w-[12%] text-center">
              Score
            </th>
            <th className="px-2 py-3 text-[10px] font-black font-label text-zinc-500 uppercase tracking-[0.2em] w-[15%] text-center">
              GP Value
            </th>
            <th className="px-2 py-3 text-[10px] font-black font-label text-zinc-500 uppercase tracking-[0.2em] w-[10%] text-center">
              Level
            </th>
            <th className="px-5 py-3 w-[6%]"></th>
          </tr>
        </thead>
        <tbody className="">
          {subjects.map((sub) => (
            <tr
              key={sub.id}
              className="group bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300"
            >
              <td className="px-4 py-3 first:rounded-l-2xl">
                <input
                  type="text"
                  placeholder="Enter course name"
                  value={sub.name}
                  onChange={(e) => handleInputChange(sub.id, 'name', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-zinc-800"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  placeholder="CS-101"
                  value={sub.code || ''}
                  onChange={(e) => handleInputChange(sub.id, 'code', e.target.value)}
                  className={`w-full px-4 py-2 bg-white/5 border rounded-xl text-xs font-mono font-bold text-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-zinc-800 ${
                    sub.code && !isValidCourseCode(sub.code) ? 'border-error/50' : 'border-white/5'
                  }`}
                />
              </td>
              <td className="px-2 py-3">
                <input
                  type="text"
                  placeholder="3"
                  value={sub.credits}
                  onChange={(e) => handleInputChange(sub.id, 'credits', e.target.value)}
                  onBlur={(e) => handleBlur(sub.id, 'credits', e.target.value)}
                  className="w-full px-2 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-black text-center text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </td>
              <td className="px-2 py-3">
                <input
                  type="text"
                  placeholder="0-100"
                  value={sub.marks}
                  onChange={(e) => handleInputChange(sub.id, 'marks', e.target.value)}
                  className="w-full px-2 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-black text-center text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:opacity-20"
                />
              </td>
              <td className="px-2 py-3 text-center">
                <span className="text-sm font-black font-headline text-primary/80 group-hover:text-primary transition-colors">
                  {sub.gradePoint.toFixed(2)}
                </span>
              </td>
              <td className="px-2 py-3 text-center">
                <span
                  className={`text-[11px] font-black px-2.5 py-1 rounded-lg ${
                    sub.gradeLetter === 'F'
                      ? 'bg-error/10 text-error'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {sub.gradeLetter}
                </span>
              </td>
              <td className="px-4 py-3 last:rounded-r-2xl text-right">
                {subjects.length > 1 && (
                  <button
                    onClick={() => removeRow(sub.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:bg-error/10 hover:text-error transition-all"
                    title="Remove Catalog Item"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 flex justify-start">
        <button
          onClick={addRow}
          className="group flex items-center gap-2 px-6 py-3 rounded-xl border border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all text-zinc-500 hover:text-primary"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform duration-500">
            add_circle
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest font-label">
            Append Registry Item
          </span>
        </button>
      </div>
    </div>
  );
};

export default SemesterSubjectTable;
