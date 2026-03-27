import React from 'react';
import { SGPASubject, asMark, asSubjectCredit } from '../src/domain/types';
import { useAcademicStore } from '../src/domain/store';
import { sanitizeSubjectName } from '../src/core/validation';

// Shared Components
import InputField from './shared/InputField';
import ActionButton from './shared/ActionButton';

interface Props {
  semesterId: string;
  subjects: SGPASubject[];
  onUpdate: (semesterId: string, subjectId: string, updates: Partial<SGPASubject>) => void;
}

const SemesterSubjectTable: React.FC<Props> = ({ semesterId, subjects, onUpdate }) => {
  const { addSubject, removeSubject } = useAcademicStore();
  const MAX_CREDITS_PER_SEM = 21;

  const totalCredits = subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
  const isOverLimit = totalCredits > MAX_CREDITS_PER_SEM;

  const handleInputChange = (subjectId: string, field: keyof SGPASubject, value: string) => {
    let finalVal = value;

    if (field === 'name') finalVal = sanitizeSubjectName(value);
    if (field === 'code') finalVal = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');

    if (field === 'credits') {
      let num = parseInt(value.replace(/\D/g, ''));
      if (isNaN(num)) finalVal = '';
      else {
        if (num > 6) num = 6;
        else finalVal = num.toString();
      }
    }

    if (field === 'marks') {
      let num = parseInt(value.replace(/\D/g, ''));
      if (isNaN(num)) finalVal = '';
      else {
        if (num > 100) num = 100;
        finalVal = num.toString();
      }
    }

    const updates: Partial<SGPASubject> = {};
    if (field === 'name') updates.name = finalVal;
    if (field === 'code') updates.code = finalVal;
    if (field === 'credits') updates.credits = asSubjectCredit(Number(finalVal) || 0);
    if (field === 'marks') updates.marks = finalVal === '' ? '' : asMark(Number(finalVal));

    onUpdate(semesterId, subjectId, updates);
  };

  return (
    <div className="w-full space-y-6">
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-left min-w-[700px] border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="px-5 py-3 text-[10px] font-black font-label text-zinc-600 uppercase tracking-[0.2em] w-[35%]">
                Course Name
              </th>
              <th className="px-5 py-3 text-[10px] font-black font-label text-zinc-600 uppercase tracking-[0.2em] w-[15%] text-center">
                Course Code
              </th>
              <th className="px-2 py-3 text-[10px] font-black font-label text-zinc-600 uppercase tracking-[0.2em] w-[12%] text-center">
                Credit Hours
              </th>
              <th className="px-2 py-3 text-[10px] font-black font-label text-zinc-600 uppercase tracking-[0.2em] w-[12%] text-center">
                Obtained Marks
              </th>
              <th className="px-2 py-3 text-[10px] font-black font-label text-zinc-600 uppercase tracking-[0.2em] w-[10%] text-center">
                Grade Points
              </th>
              <th className="px-2 py-3 text-[10px] font-black font-label text-zinc-600 uppercase tracking-[0.2em] w-[10%] text-center">
                Grade Letter
              </th>
              <th className="px-5 py-3 w-[6%]"></th>
            </tr>
          </thead>
          <tbody className="">
            {subjects.map((sub) => (
              <tr
                key={sub.id}
                className="group bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300"
              >
                <td className="px-5 py-3 first:rounded-l-2xl">
                  <InputField
                    value={sub.name}
                    onChange={(val) => handleInputChange(sub.id, 'name', val)}
                    placeholder="Enter course name"
                    className="!p-0"
                  />
                </td>
                <td className="px-5 py-3 text-center">
                  <InputField
                    value={sub.code || ''}
                    onChange={(val) => handleInputChange(sub.id, 'code', val)}
                    placeholder="CS-101"
                    align="center"
                    mono
                    className="w-24 mx-auto"
                  />
                </td>
                <td className="px-2 py-3 text-center">
                  <InputField
                    type="number"
                    value={sub.credits}
                    onChange={(val) => handleInputChange(sub.id, 'credits', val)}
                    align="center"
                    mono
                    className="w-16 mx-auto"
                    dataTestId="subject-credits-input"
                  />
                </td>
                <td className="px-2 py-3 text-center">
                  <InputField
                    type="number"
                    value={sub.marks}
                    onChange={(val) => handleInputChange(sub.id, 'marks', val)}
                    placeholder="00"
                    align="center"
                    mono
                    className="w-16 mx-auto"
                    dataTestId="subject-marks-input"
                  />
                </td>
                <td className="px-2 py-3 text-center">
                  <span className="text-sm font-black font-mono text-primary/80 group-hover:text-primary transition-colors">
                    {sub.gradePoint.toFixed(2)}
                  </span>
                </td>
                <td className="px-2 py-3 text-center">
                  <span
                    className={`text-[10px] font-black font-mono px-2 py-1 rounded-lg ${
                      sub.gradeLetter === 'F'
                        ? 'bg-error/10 text-error'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {sub.gradeLetter}
                  </span>
                </td>
                <td className="px-5 py-3 last:rounded-r-2xl text-right">
                  {subjects.length > 1 && (
                    <ActionButton
                      onClick={() => removeSubject(semesterId, sub.id)}
                      variant="ghost"
                      icon="delete_sweep"
                      className="w-10 h-10 !p-0 hover:!text-error"
                    >
                      {null}
                    </ActionButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-bg-surface-lowest/30 p-4 rounded-2xl border border-white/5">
        <ActionButton
          onClick={() => addSubject(semesterId)}
          variant="secondary"
          icon="add_circle"
          className="w-full sm:w-auto"
          disabled={totalCredits >= MAX_CREDITS_PER_SEM}
          dataTestId="add-course-btn"
        >
          Append Registry Item
        </ActionButton>
        <div className="flex items-center gap-3">
          <div className="h-2 w-24 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${isOverLimit ? 'bg-error shadow-glow-error' : 'bg-primary shadow-glow'}`}
              style={{ width: `${Math.min((totalCredits / MAX_CREDITS_PER_SEM) * 100, 100)}%` }}
            ></div>
          </div>
          <span
            className={`text-[10px] font-black font-mono uppercase tracking-widest ${isOverLimit ? 'text-error' : 'text-zinc-600'}`}
          >
            {totalCredits}/{MAX_CREDITS_PER_SEM} CR
          </span>
        </div>
      </div>
    </div>
  );
};

export default SemesterSubjectTable;
