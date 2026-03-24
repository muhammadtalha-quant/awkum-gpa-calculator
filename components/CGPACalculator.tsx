import React, { useState, useEffect } from 'react';
import { UserInfo, GradePoint, Credit, asGP, asCredit, Mark, CGPASemester } from '../src/domain/types';
import { useAcademicStore } from '../src/domain/store';
import { getLetterFromGP } from '../src/domain/grading/engine';
import { calculateGradePoint } from '../src/domain/grading/engine';
import { calculateCGPA } from '../src/domain/gpa/engine';
import { exportCGPA_PDF } from '../services/pdfService';
import { useKeyboardShortcuts } from '../src/core/useKeyboardShortcuts';
import UserInfoModal from './UserInfoModal';
import ProbationAlert from './ProbationAlert';
import SemesterEntryModal from './SemesterEntryModal';

interface Props {
  onExportReady?: (fn: () => void) => void;
}

const CGPACalculator: React.FC<Props> = ({ onExportReady }) => {
  const { semesters, addSemester, removeSemester, updateSemester, setSemesters } = useAcademicStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const MAX_CREDITS = 216;
  const MIN_ROOM = 12;
  const MAX_ROWS = 12;

  useEffect(() => {
    if (onExportReady) onExportReady(() => setIsModalOpen(true));
  }, [onExportReady]);

  useEffect(() => {
    const total = semesters.reduce((s, sem) => s + (Number(sem.credits) || 0), 0);
    if (total > MAX_CREDITS) {
      const copy = [...semesters];
      while (copy.reduce((s, sem) => s + (Number(sem.credits) || 0), 0) > MAX_CREDITS && copy.length > 1) copy.pop();
      setSemesters(copy);
      setErrorMsg('Adjusted semesters to maintain global credit limit.');
    }
  }, [semesters, setSemesters]);

  const cgpaValue = calculateCGPA(semesters.map(s => ({ sgpa: s.sgpa, credits: s.credits })));
  const overallGrade = getLetterFromGP(cgpaValue);
  const cgpaNum = Number(cgpaValue);

  const totalCredits = semesters.reduce((s, sem) => s + (Number(sem.credits) || 0), 0);
  const qualityPoints = semesters.reduce((s, sem) => s + (Number(sem.sgpa) * Number(sem.credits)), 0);

  const getCgpaLabel = (gpa: number) => {
    if (gpa >= 3.75) return 'First Class with Distinction';
    if (gpa >= 3.0)  return 'First Class';
    if (gpa >= 2.5)  return 'Second Class';
    if (gpa >= 2.0)  return 'Pass';
    return 'Academic Probation';
  };

  const handlePdfExport = (userInfo: UserInfo) => {
    exportCGPA_PDF(semesters, cgpaNum, overallGrade, userInfo);
  };

  const handleAddSemester = () => {
    if (semesters.length >= MAX_ROWS || (MAX_CREDITS - totalCredits) < MIN_ROOM) return;
    setErrorMsg('');
    const newId = Math.random().toString(36).substr(2, 9);
    const initialCourse = { id: (Date.now() + Math.random()).toString(), name: '', code: '', credits: 3 as Credit, marks: '' as unknown as Mark, gradePoint: 0 as GradePoint, gradeLetter: 'F' };
    setSemesters([...semesters, { id: newId, name: `Semester ${semesters.length + 1}`, sgpa: 0 as GradePoint, credits: 3 as Credit, subjects: [initialCourse] }]);
  };


  const handleRemove = (id: string) => {
    setErrorMsg('');
    if (semesters.length <= 1) setSemesters([]);
    else removeSemester(id);
  };

  // Inline course update within a semester (for subject-level entry)
  const handleAddCourseToSemester = (semId: string) => {
    const sem = semesters.find(s => s.id === semId);
    if (!sem) return;
    const newCourse = {
      id: (Date.now() + Math.random()).toString(),
      name: '',
      code: '',
      credits: 3 as Credit,
      marks: '' as unknown as Mark,
      gradePoint: 0 as GradePoint,
      gradeLetter: 'F',
    };
    const updated = [...(sem.subjects || []), newCourse];
    const semCredits = updated.reduce((s, c) => s + (Number(c.credits) || 0), 0);
    const semSgpa = updated.filter(c => c.gradePoint > 0).length > 0
      ? Number((updated.reduce((s, c) => s + Number(c.gradePoint) * Number(c.credits), 0) / semCredits).toFixed(2))
      : 0;
    updateSemester(semId, { subjects: updated, credits: asCredit(semCredits), sgpa: asGP(semSgpa) });
  };

  const handleUpdateCourse = (semId: string, courseId: string, field: string, value: string) => {
    const sem = semesters.find(s => s.id === semId);
    if (!sem) return;
    const updated = (sem.subjects || []).map(c => {
      if (c.id !== courseId) return c;
      if (field === 'name') return { ...c, name: value };
      if (field === 'credits') {
        const v = parseInt(value);
        return { ...c, credits: (isNaN(v) ? c.credits : v) as Credit };
      }
      if (field === 'marks') {
        if (value === '') return { ...c, marks: '' as unknown as Mark, gradePoint: 0 as GradePoint, gradeLetter: 'F' };
        const v = parseInt(value);
        if (isNaN(v) || v < 0 || v > 100) return c;
        const gp = calculateGradePoint(v as Mark);
        return { ...c, marks: v as Mark, gradePoint: gp, gradeLetter: getLetterFromGP(gp) };
      }
      return c;
    });
    const semCredits = updated.reduce((s, c) => s + (Number(c.credits) || 0), 0);
    const semSgpa = semCredits > 0 && updated.some(c => c.gradePoint > 0)
      ? Number((updated.reduce((s, c) => s + Number(c.gradePoint) * Number(c.credits), 0) / semCredits).toFixed(2))
      : 0;
    updateSemester(semId, { subjects: updated, credits: asCredit(semCredits), sgpa: asGP(Math.min(4, semSgpa)) });
  };

  const handleRemoveCourse = (semId: string, courseId: string) => {
    const sem = semesters.find(s => s.id === semId);
    if (!sem) return;
    const updated = (sem.subjects || []).filter(c => c.id !== courseId);
    const semCredits = updated.reduce((s, c) => s + (Number(c.credits) || 0), 0);
    const semSgpa = semCredits > 0 && updated.some(c => c.gradePoint > 0)
      ? Number((updated.reduce((s, c) => s + Number(c.gradePoint) * Number(c.credits), 0) / semCredits).toFixed(2))
      : 0;
    updateSemester(semId, { subjects: updated, credits: asCredit(semCredits), sgpa: asGP(Math.min(4, semSgpa)) });
  };

  const resetAll = () => { setErrorMsg(''); setSemesters([]); };

  useKeyboardShortcuts({ escape: () => { setIsModalOpen(false); } });

  const showAddButton = semesters.length < MAX_ROWS && (MAX_CREDITS - totalCredits) >= MIN_ROOM;

  const tabs = [
    { id: 'forecast' as const, label: 'Forecasting',  icon: 'trending_up' },
    { id: 'simulate' as const, label: 'Outcome Sim',  icon: 'science' },
    { id: 'retake'   as const, label: 'Retake ROI',   icon: 'refresh' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-10 space-y-8">
      {/* Modals */}
      <UserInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handlePdfExport} title="Cumulative Grade Sheet Details" isCGPA={true} rowCount={semesters.length} theme={null} />

      {/* Dashboard Bento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* CGPA Hero */}
        <div className="md:col-span-2 p-6 rounded-xl bg-[#121215] border border-[#27272a] flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
          <div className="relative z-10">
            <p className="text-[#71717a] text-sm font-medium">Cumulative Grade Point Average</p>
            <h1 className="text-6xl font-black text-[#a78bfa] tracking-tighter mt-2">
              {cgpaNum > 0 ? cgpaNum.toFixed(2) : '—'}
            </h1>
          </div>
          {cgpaNum > 0 && (
            <div className="mt-4 flex items-center gap-2 text-[#34d399]">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
              <span className="text-sm font-bold">{getCgpaLabel(cgpaNum)}</span>
            </div>
          )}
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[100px] text-[#a78bfa]">analytics</span>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-[#121215] border border-[#27272a]">
          <p className="text-[#71717a] text-sm font-medium">Credits Earned</p>
          <h3 className="text-4xl font-bold text-[#fafafa] mt-2">{totalCredits}</h3>
          <p className="text-xs text-[#52525b] mt-2">Required: 132 Credits</p>
        </div>

        <div className="p-6 rounded-xl bg-[#121215] border border-[#27272a]">
          <p className="text-[#71717a] text-sm font-medium">Quality Points</p>
          <h3 className="text-4xl font-bold text-[#fafafa] mt-2">{qualityPoints.toFixed(1)}</h3>
          <p className="text-xs text-[#52525b] mt-2">∑(SGPA × Credits)</p>
        </div>
      </div>

      {/* Probation Alert */}
      {cgpaNum > 0 && cgpaNum < 2.0 && <ProbationAlert cgpa={cgpaNum} theme={null} />}

      {/* Transcript Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-[#fafafa]">Transcript Breakdown</h2>
          <div className="flex gap-3">
            {showAddButton && (
              <button
                onClick={handleAddSemester}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-[#fafafa] hover:bg-[#27272a] transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Semester
              </button>
            )}
            {semesters.length > 0 && (
              <button onClick={resetAll} className="px-4 py-2 rounded-lg text-[#ef4444] text-sm font-bold border border-[#ef4444]/20 hover:bg-[#ef4444]/10 transition-colors">
                Reset All
              </button>
            )}
          </div>
        </div>

        {semesters.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-[#27272a] rounded-xl">
            <span className="material-symbols-outlined text-5xl text-[#3f3f46]">library_books</span>
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[#52525b] mt-4 mb-6">No Semesters Added</h3>
            <button
              onClick={handleAddSemester}
              className="px-8 py-3 rounded-lg bg-[#a78bfa] text-[#0a0012] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all text-sm"
            >
              Add Academic Record
            </button>
          </div>
        ) : (
          semesters.map((sem, si) => {
            const semGpa = Number(sem.sgpa);
            const semCH = Number(sem.credits);
            return (
              <div key={sem.id} className="bg-[#121215] border border-[#27272a] rounded-xl overflow-hidden">
                {/* Semester header */}
                <div className="px-6 py-4 bg-[#18181b] border-b border-[#27272a] flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded bg-[#a78bfa]/20 text-[#a78bfa] flex items-center justify-center font-bold text-sm">
                      {si + 1}
                    </span>
                    <h3 className="font-bold text-[#fafafa]">{sem.name}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-4 text-xs font-bold uppercase tracking-widest items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[#52525b]">GPA:</span>
                        {sem.subjects && sem.subjects.length > 0 ? (
                          <span className="text-[#fafafa] font-black">{semGpa.toFixed(2)}</span>
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            min="0" max="4"
                            value={sem.sgpa || ''}
                            onChange={(e) => updateSemester(sem.id, { sgpa: asGP(parseFloat(e.target.value) || 0) })}
                            className="w-16 bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-center text-[#fafafa] focus:border-[#a78bfa] outline-none"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#52525b]">CH:</span>
                        {sem.subjects && sem.subjects.length > 0 ? (
                          <span className="text-[#fafafa] font-black">{semCH}</span>
                        ) : (
                          <input
                            type="number"
                            min="12" max="21"
                            value={sem.credits || ''}
                            onChange={(e) => updateSemester(sem.id, { credits: asCredit(parseInt(e.target.value) || 0) })}
                            className="w-16 bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-center text-[#fafafa] focus:border-[#a78bfa] outline-none"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">

                      <button
                        onClick={() => handleRemove(sem.id)}
                        className="p-1.5 rounded text-[#71717a] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Course table */}
                {(sem.subjects && sem.subjects.length > 0) ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-xs uppercase tracking-wider text-[#71717a] border-b border-[#27272a]">
                          <th className="px-6 py-3 font-semibold">Course Name</th>
                          <th className="px-6 py-3 font-semibold">Cr. Hours</th>
                          <th className="px-6 py-3 font-semibold text-center">Marks</th>
                          <th className="px-6 py-3 font-semibold">Grade</th>
                          <th className="px-6 py-3 font-semibold">G. Points</th>
                          <th className="px-6 py-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#27272a]">
                        {sem.subjects.map(course => (
                          <tr key={course.id} className="hover:bg-[#18181b] transition-colors">
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={course.name}
                                onChange={e => handleUpdateCourse(sem.id, course.id, 'name', e.target.value)}
                                placeholder="Course name…"
                                className="bg-transparent border-none outline-none text-[#fafafa] w-full placeholder:text-[#52525b] text-sm"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number" min={2} max={6}
                                value={course.credits}
                                onChange={e => handleUpdateCourse(sem.id, course.id, 'credits', e.target.value)}
                                className="bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-center w-16 focus:border-[#a78bfa] outline-none text-[#fafafa] text-sm"
                              />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <input
                                type="number" min={0} max={100}
                                value={course.marks === '' ? '' : course.marks}
                                onChange={e => handleUpdateCourse(sem.id, course.id, 'marks', e.target.value)}
                                placeholder="—"
                                className="bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-center w-16 focus:border-[#a78bfa] outline-none text-[#fafafa] placeholder:text-[#52525b] text-sm"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded bg-[#34d399]/10 text-[#34d399] text-xs font-bold">
                                {course.gradeLetter}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-sm text-[#fafafa]">
                              {course.gradePoint > 0 ? course.gradePoint.toFixed(2) : '—'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => handleRemoveCourse(sem.id, course.id)} className="text-[#71717a] hover:text-[#ef4444] transition-colors">
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-6 text-center text-[#52525b] text-sm">No courses yet</div>
                )}

                <div className="p-4 bg-[#09090b] flex justify-center border-t border-[#27272a]">
                  <button
                    onClick={() => handleAddCourseToSemester(sem.id)}
                    className="text-[#a78bfa] text-sm font-semibold flex items-center gap-1 hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    Add Course
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 text-[#ef4444] text-xs font-bold uppercase tracking-widest bg-[#ef4444]/10 p-4 rounded-lg border border-[#ef4444]/20">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default CGPACalculator;