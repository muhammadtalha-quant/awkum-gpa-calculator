import React, { useState, useEffect } from 'react';
import { UserInfo, Credit, Mark, GradePoint, SGPASubject } from '../src/domain/types';
import { useAcademicStore } from '../src/domain/store';
import { isValidCourseCode } from '../src/core/validation';
import { exportSGPA_PDF } from '../services/pdfService';
import { calculateGradePoint } from '../src/domain/grading/engine';
import { calculateSGPA } from '../src/domain/gpa/engine';
import { getLetterFromGP } from '../src/domain/grading/engine';
import UserInfoModal from './UserInfoModal';
import MISParserModal from './MISParserModal';
import RequiredMarksTool from './RequiredMarksTool';
import { GRADE_RANGES } from '../constants';

interface Props {
  onExportReady?: (fn: () => void) => void;
}

const SGPACalculator: React.FC<Props> = ({ onExportReady }) => {
  const { subjects, setSubjects } = useAcademicStore();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMISModalOpen, setIsMISModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [prevCgpa, setPrevCgpa] = useState('');
  const [prevCredits, setPrevCredits] = useState('');

  const MAX_CREDITS = 21;

  // Register export handler with parent
  useEffect(() => {
    if (onExportReady) {
      onExportReady(() => setIsExportModalOpen(true));
    }
  }, [onExportReady]);

  // Credit pruning
  useEffect(() => {
    const total = subjects.reduce((s, c) => s + (Number(c.credits) || 0), 0);
    if (total > MAX_CREDITS) {
      const copy = [...subjects];
      while (copy.reduce((s, c) => s + (Number(c.credits) || 0), 0) > MAX_CREDITS && copy.length > 1) copy.pop();
      setSubjects(copy);
      setErrorMsg('Automatically adjusted subjects to maintain the 21-credit hour limit.');
    }
  }, [subjects, setSubjects]);

  const sgpaValue = calculateSGPA(subjects.map(s => ({ gradePoint: s.gradePoint, credits: s.credits })));
  const finalGrade = getLetterFromGP(sgpaValue);

  // Projected CGPA
  const sgpaNum = Number(sgpaValue);
  const currentCredits = subjects.reduce((s, c) => s + (Number(c.credits) || 0), 0);
  const projectedCgpa = (() => {
    const pc = parseFloat(prevCgpa);
    const ph = parseFloat(prevCredits);
    if (!isNaN(pc) && !isNaN(ph) && ph > 0 && currentCredits > 0 && sgpaNum > 0) {
      return ((pc * ph + sgpaNum * currentCredits) / (ph + currentCredits)).toFixed(2);
    }
    return null;
  })();

  const getGpaBadge = (gpa: number) => {
    if (gpa >= 3.75) return { label: 'Distinction', color: 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20' };
    if (gpa >= 3.0)  return { label: 'Excellent Progress', color: 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20' };
    if (gpa >= 2.5)  return { label: 'Good Standing', color: 'bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/20' };
    if (gpa >= 2.0)  return { label: 'Satisfactory', color: 'bg-[#71717a]/10 text-[#a1a1aa] border-[#71717a]/20' };
    return            { label: 'At Risk', color: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20' };
  };

  const handlePdfExport = (userInfo: UserInfo) => {
    exportSGPA_PDF(subjects, Number(sgpaValue), finalGrade, userInfo);
  };

  const handleMISImport = (imported: SGPASubject[]) => {
    const merged = [...subjects];
    for (const imp of imported) {
      const idx = merged.findIndex(s => s.code === imp.code);
      if (idx >= 0) merged[idx] = imp; else merged.push(imp);
    }
    setSubjects(merged);
  };

  const addCourse = () => {
    const newSub: SGPASubject = {
      id: (Date.now() + Math.random()).toString(),
      name: '',
      code: '',
      credits: 3 as Credit,
      marks: '' as unknown as Mark,
      gradePoint: 0 as GradePoint,
      gradeLetter: 'F',
    };
    setSubjects([...subjects, newSub]);
    setErrorMsg('');
  };

  const updateSubject = (id: string, field: keyof SGPASubject, raw: string) => {
    setSubjects(subjects.map(s => {
      if (s.id !== id) return s;
      if (field === 'name') return { ...s, name: raw };
      if (field === 'credits') {
        const v = parseInt(raw);
        return { ...s, credits: (isNaN(v) ? s.credits : v) as Credit };
      }
      if (field === 'marks') {
        if (raw === '') return { ...s, marks: '' as unknown as Mark, gradePoint: 0 as GradePoint, gradeLetter: 'F' };
        const v = parseInt(raw);
        if (isNaN(v) || v < 0 || v > 100) return s;
        const gp = calculateGradePoint(v as Mark);
        return { ...s, marks: v as Mark, gradePoint: gp, gradeLetter: getLetterFromGP(gp) };
      }
      return s;
    }));
  };

  const removeSubject = (id: string) => setSubjects(subjects.filter(s => s.id !== id));

  const allCodesFilled = subjects.every(s => s.code && isValidCourseCode(s.code));
  const isExportUnlocked = allCodesFilled && subjects.length > 0;
  const badge = sgpaNum > 0 ? getGpaBadge(sgpaNum) : null;



  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-10">
      {/* Modals */}
      <UserInfoModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSubmit={handlePdfExport}
        title="Semester Grade Sheet Details"
        theme={null}
      />
      <MISParserModal
        isOpen={isMISModalOpen}
        onClose={() => setIsMISModalOpen(false)}
        onImport={handleMISImport}
        existingSubjectCodes={subjects.map(s => s.code || '').filter(Boolean)}
        theme={null}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: 8 */}
        <div className="lg:col-span-8 space-y-6">

          {/* Header card */}
          <div className="bg-[#121215] border border-[#27272a] rounded-xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#fafafa]">SGPA Calculator</h1>
                <p className="text-[#71717a] text-sm mt-1">Semester Grade Point Average Calculation</p>
              </div>
            </div>
          </div>

          {/* Course Table */}
          <div className="bg-[#121215] border border-[#27272a] rounded-xl overflow-hidden">
            {subjects.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-[#27272a] rounded-xl mx-4 my-4">
                <span className="material-symbols-outlined text-5xl text-[#3f3f46]">school</span>
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#52525b] mt-4 mb-6">No Courses Added Yet</h3>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={addCourse}
                    className="px-6 py-3 rounded-lg bg-[#a78bfa] text-[#0a0012] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all text-sm"
                  >
                    Add Course Manually
                  </button>
                  <button
                    onClick={() => setIsMISModalOpen(true)}
                    className="px-6 py-3 rounded-lg border border-[#a78bfa]/40 text-[#a78bfa] font-bold uppercase tracking-wider hover:bg-[#a78bfa]/10 active:scale-95 transition-all text-sm flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_paste</span>
                    Paste from MIS
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                              onChange={e => updateSubject(sub.id, 'name', e.target.value)}
                              placeholder="Course name…"
                              className="bg-transparent border-none outline-none text-[#fafafa] w-full placeholder:text-[#52525b]"
                            />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="number"
                              min={2} max={6}
                              value={sub.credits}
                              onChange={e => updateSubject(sub.id, 'credits', e.target.value)}
                              className="bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-center w-16 focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none text-[#fafafa]"
                            />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="number"
                              min={0} max={100}
                              value={sub.marks === '' ? '' : sub.marks}
                              onChange={e => updateSubject(sub.id, 'marks', e.target.value)}
                              placeholder="0-100"
                              className="bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-center w-16 focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none text-[#fafafa] placeholder:text-[#52525b]"
                            />
                          </td>
                          <td className="px-4 py-4 text-center font-mono text-[#34d399] font-bold">
                            {sub.gradePoint > 0 ? sub.gradePoint.toFixed(2) : '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => removeSubject(sub.id)}
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
              </>
            )}
            {/* Add course button */}
            <div className="p-4 border-t border-[#27272a]">
              <button
                onClick={addCourse}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#27272a] rounded-lg text-[#71717a] hover:border-[#a78bfa] hover:text-[#a78bfa] transition-all group"
              >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
                <span className="font-bold text-sm">Add Course</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-3 text-[#ef4444] text-xs font-bold uppercase tracking-widest bg-[#ef4444]/10 p-4 rounded-lg border border-[#ef4444]/20">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              {errorMsg}
            </div>
          )}


          {/* Required Marks Tool */}
          {subjects.length > 0 && (
            <div className="bg-[#121215] border border-[#27272a] rounded-xl p-6">
              <RequiredMarksTool subjects={subjects} theme={null} />
            </div>
          )}
        </div>

        {/* Right column: 4 */}
        <div className="lg:col-span-4 space-y-6">

          {/* SGPA Result Card */}
          <div className="bg-[#121215] border border-[#a78bfa]/30 rounded-xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-[80px] text-[#a78bfa]">school</span>
            </div>
            <div className="relative z-10">
              <p className="text-[#71717a] text-xs font-bold uppercase tracking-widest">Semester SGPA</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-6xl font-black text-[#a78bfa] tracking-tighter">
                  {subjects.length > 0 && sgpaNum > 0 ? sgpaNum.toFixed(2) : '—'}
                </span>
                <span className="text-[#71717a] font-mono">/ 4.0</span>
              </div>
              {badge && subjects.length > 0 && sgpaNum > 0 && (
                <div className="mt-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick CGPA Utility */}
          <div className="bg-[#121215] border border-[#27272a] rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#fafafa]">Quick CGPA Utility</h3>
              <p className="text-xs text-[#71717a] mt-0.5">Calculate impact on your total CGPA</p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#71717a] uppercase tracking-wider">Previous CGPA</label>
                <input
                  type="number"
                  step="0.01" min="0" max="4"
                  value={prevCgpa}
                  onChange={e => setPrevCgpa(e.target.value)}
                  placeholder="e.g. 3.20"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-3 text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all placeholder:text-[#52525b] text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#71717a] uppercase tracking-wider">Total Previous Cr. Hours</label>
                <input
                  type="number"
                  min="0"
                  value={prevCredits}
                  onChange={e => setPrevCredits(e.target.value)}
                  placeholder="e.g. 64"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-3 text-[#fafafa] focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none transition-all placeholder:text-[#52525b] text-sm"
                />
              </div>
              <div className="pt-4 border-t border-[#27272a]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-[#71717a]">New Projected CGPA</span>
                  <span className="text-2xl font-black text-[#fafafa] tracking-tighter">
                    {projectedCgpa ?? '—'}
                  </span>
                </div>
                {projectedCgpa && (
                  <div className="w-full bg-[#27272a] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#a78bfa] h-full rounded-full transition-all" style={{ width: `${Math.min(100, (parseFloat(projectedCgpa) / 4) * 100)}%` }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[#121215] border border-[#27272a] rounded-xl p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-[#27272a] rounded-lg bg-[#0f0f12]">
                <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Total Cr.</p>
                <p className="text-2xl font-bold text-[#fafafa] mt-1">
                  {String(currentCredits).padStart(2, '0')}
                </p>
              </div>
              <div className="p-4 border border-[#27272a] rounded-lg bg-[#0f0f12]">
                <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Total Points</p>
                <p className="text-2xl font-bold text-[#fafafa] mt-1">
                  {subjects.reduce((s, c) => s + (Number(c.gradePoint) * Number(c.credits)), 0).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Export */}
          {isExportUnlocked && (
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#a78bfa] text-[#0a0012] font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
              Export DMC
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SGPACalculator;