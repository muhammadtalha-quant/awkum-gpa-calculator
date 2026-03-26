import React, { useState, useEffect } from 'react';
import { UserInfo, SGPASubject } from '../src/domain/types';
import { useSGPALogic } from '../src/domain/gpa/useSGPALogic';
import { isValidCourseCode } from '../src/core/validation';
import { exportSGPA_PDF } from '../services/pdfService';
import UserInfoModal from './UserInfoModal';
import MISParserModal from './MISParserModal';
import RequiredMarksTool from './RequiredMarksTool';
import SubjectEntryModal from './SubjectEntryModal';

interface Props {
  onExportReady?: (fn: () => void) => void;
}

const SGPACalculator: React.FC<Props> = ({ onExportReady }) => {
  const {
    subjects,
    setSubjects,
    errorMsg,
    prevCgpa,
    setPrevCgpa,
    prevCredits,
    setPrevCredits,
    sgpaValue,
    finalGrade,
    projectedCgpa,
    addCourse,
    updateSubject,
    removeSubject,
  } = useSGPALogic();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMISModalOpen, setIsMISModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SGPASubject | null>(null);

  useEffect(() => {
    if (onExportReady) onExportReady(() => setIsExportModalOpen(true));
  }, [onExportReady]);

  const handlePdfExport = (userInfo: UserInfo) => {
    exportSGPA_PDF(subjects, Number(sgpaValue), finalGrade, userInfo);
  };

  const handleMISImport = (imported: SGPASubject[]) => {
    const merged = [...subjects];
    for (const imp of imported) {
      const idx = merged.findIndex((s) => s.code === imp.code);
      if (idx >= 0) merged[idx] = imp;
      else merged.push(imp);
    }
    setSubjects(merged);
  };

  const getGpaBadge = (gpa: number) => {
    if (gpa >= 3.75)
      return { label: 'Distinction', color: 'bg-primary/10 text-primary border-primary/20' };
    if (gpa >= 3.0)
      return { label: 'Excellent Progress', color: 'bg-primary/10 text-primary border-primary/20' };
    if (gpa >= 2.5)
      return {
        label: 'Good Standing',
        color: 'bg-primary-fixed-dim/10 text-primary-fixed-dim border-primary-fixed-dim/20',
      };
    if (gpa >= 2.0)
      return { label: 'Satisfactory', color: 'bg-zinc-800 text-zinc-400 border-white/5' };
    return { label: 'At Risk', color: 'bg-error/10 text-error border-error/20' };
  };

  const sgpaNum = Number(sgpaValue);
  const badge = sgpaNum > 0 ? getGpaBadge(sgpaNum) : null;
  const isExportUnlocked =
    subjects.length > 0 && subjects.every((s) => s.code && isValidCourseCode(s.code));

  return (
    <div className="space-y-8 animate-in">
      <UserInfoModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSubmit={handlePdfExport}
        title="Semester Grade Sheet Details"
      />
      <MISParserModal
        isOpen={isMISModalOpen}
        onClose={() => setIsMISModalOpen(false)}
        onImport={handleMISImport}
        existingSubjectCodes={subjects.map((s) => s.code || '').filter(Boolean)}
      />
      <SubjectEntryModal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        onSubmit={(sub) => {
          updateSubject(editingSubject!.id, 'name', sub.name!);
          updateSubject(editingSubject!.id, 'code', sub.code || '');
          updateSubject(editingSubject!.id, 'credits', sub.credits!.toString());
          updateSubject(editingSubject!.id, 'marks', sub.marks!.toString());
          setEditingSubject(null);
        }}
        initialData={editingSubject || undefined}
        enableCodes={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-bg-surface rounded-3xl p-4 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 border border-white/5 shadow-2xl">
            <div>
              <h1 className="text-3xl font-black font-headline text-white tracking-tight">
                SGPA Utility
              </h1>
              <p className="text-zinc-500 text-xs font-black font-label uppercase tracking-widest mt-2">
                Operational analytics for the current semester
              </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button
                data-testid="import-mis-btn"
                onClick={() => setIsMISModalOpen(true)}
                className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-zinc-400 text-[10px] font-black font-label uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_download</span>
                Import MIS
              </button>
            </div>
          </section>

          <section className="bg-bg-surface rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">list_alt</span>
                <h3 className="font-black font-headline text-[11px] uppercase tracking-[0.3em] text-zinc-400">
                  Current Vector Mapping
                </h3>
              </div>
              {errorMsg && (
                <span className="text-[9px] font-black text-primary animate-pulse uppercase tracking-wider">
                  {errorMsg}
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-surface-lowest">
                    <th className="px-8 py-5 font-black font-label text-[9px] tracking-[0.3em] text-zinc-600 uppercase">
                      Registry Entry
                    </th>
                    <th className="px-6 py-5 font-black font-label text-[9px] tracking-[0.3em] text-zinc-600 uppercase text-center min-w-[120px]">
                      Catalog ID
                    </th>
                    <th className="px-6 py-5 font-black font-label text-[9px] tracking-[0.3em] text-zinc-600 uppercase text-center w-24">
                      Units
                    </th>
                    <th className="px-6 py-5 font-black font-label text-[9px] tracking-[0.3em] text-zinc-600 uppercase text-center w-24">
                      Score
                    </th>
                    <th className="px-6 py-5 font-black font-label text-[9px] tracking-[0.3em] text-zinc-600 uppercase text-center w-20">
                      GP
                    </th>
                    <th className="px-8 py-5 min-w-[120px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {subjects.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-24 text-center text-zinc-700 font-label text-[10px] font-black uppercase tracking-widest"
                      >
                        Neural grid initialized. Awaiting course entry.
                      </td>
                    </tr>
                  ) : (
                    subjects.map((sub: SGPASubject) => (
                      <tr
                        key={sub.id}
                        data-testid="subject-row"
                        className="group hover:bg-white/[0.01] transition-all duration-300"
                      >
                        <td className="px-8 py-6">
                          <input
                            data-testid="subject-name-input"
                            className="bg-transparent border-none outline-none text-on-surface font-black font-headline text-sm w-full placeholder:text-zinc-600 focus:text-primary transition-colors pr-8"
                            value={sub.name}
                            onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                            placeholder="e.g. Advanced AI Models"
                          />
                        </td>
                        <td className="px-6 py-6 text-center">
                          <div className="inline-flex items-center justify-center p-1 rounded-xl bg-bg-surface-lowest border border-white/5 shadow-inner-glow group-hover:border-white/10 transition-all">
                            <input
                              type="text"
                              value={sub.code || ''}
                              onChange={(e) => updateSubject(sub.id, 'code', e.target.value)}
                              placeholder="CS-101"
                              className="bg-transparent border-none outline-none text-center w-20 font-black font-mono text-xs text-on-surface transition-all placeholder:text-zinc-600 uppercase"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <div className="inline-flex items-center justify-center p-1 rounded-xl bg-bg-surface-lowest border border-white/5 shadow-inner-glow group-hover:border-white/10 transition-all">
                            <input
                              type="number"
                              data-testid="subject-credits-input"
                              min={1}
                              max={6}
                              value={sub.credits}
                              onChange={(e) => updateSubject(sub.id, 'credits', e.target.value)}
                              className="bg-transparent border-none outline-none text-center w-12 font-black font-mono text-xs text-on-surface transition-all"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <div className="inline-flex items-center justify-center p-1 rounded-xl bg-bg-surface-lowest border border-white/5 shadow-inner-glow group-hover:border-white/10 transition-all">
                            <input
                              type="number"
                              data-testid="subject-marks-input"
                              min={0}
                              max={100}
                              value={sub.marks === '' ? '' : sub.marks}
                              onChange={(e) => updateSubject(sub.id, 'marks', e.target.value)}
                              placeholder="00"
                              className="bg-transparent border-none outline-none text-center w-12 font-black font-mono text-xs text-on-surface transition-all placeholder:text-zinc-600"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span
                            className={`font-black font-mono text-sm px-3 py-1.5 rounded-lg ${sub.gradePoint >= 3.5 ? 'text-primary bg-primary/10' : sub.gradePoint >= 2.0 ? 'text-primary-fixed-dim bg-white/5' : 'text-zinc-700'}`}
                          >
                            {sub.gradePoint > 0 ? sub.gradePoint.toFixed(2) : '0.00'}
                          </span>
                        </td>
                        <td className="px-8">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingSubject(sub)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/0 text-primary/30 hover:bg-primary/10 hover:text-primary transition-all"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => removeSubject(sub.id)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-error/0 text-error/30 hover:bg-error/10 hover:text-error transition-all group-hover:text-error/60"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                delete_sweep
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="p-6 border-t border-white/5 flex gap-4 w-full sm:w-auto">
                <button
                  data-testid="add-course-btn"
                  onClick={addCourse}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-primary text-on-primary text-[10px] font-black font-label uppercase tracking-widest hover:shadow-glow transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Add Course
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-bg-surface rounded-3xl p-6 sm:p-10 border border-white/5 shadow-glow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-8xl text-primary">data_usage</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center relative z-10">
              <p className="text-[10px] font-black font-label text-zinc-500 uppercase tracking-[0.4em] mb-4">
                Current Performance Mean
              </p>
              <div className="relative group/score">
                <span
                  data-testid="sgpa-score"
                  className="text-6xl sm:text-8xl font-black font-headline text-white tracking-tighter text-shadow-glow drop-shadow-2xl transition-transform duration-700 group-hover/score:scale-105 inline-block"
                >
                  {sgpaNum.toFixed(2)}
                </span>
                <div className="absolute -top-4 -right-8">
                  {badge && (
                    <div
                      className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border animate-bounce-slow shadow-soft backdrop-blur-md ${badge.color}`}
                    >
                      {badge.label}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-8 flex gap-4 w-full">
                <button
                  disabled={!isExportUnlocked}
                  onClick={() => setIsExportModalOpen(true)}
                  className={`flex-1 group/btn relative h-14 rounded-2xl overflow-hidden transition-all active:scale-95 flex items-center justify-center gap-3 ${isExportUnlocked ? 'bg-primary text-on-primary shadow-glow' : 'bg-white/5 text-zinc-700 cursor-not-allowed'}`}
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                  <span className="material-symbols-outlined text-[20px] relative z-10">
                    picture_as_pdf
                  </span>
                  <span className="text-[10px] font-black font-label uppercase tracking-widest relative z-10">
                    Generate Sheet
                  </span>
                </button>
              </div>
              {!isExportUnlocked && subjects.length > 0 && (
                <p className="mt-4 text-[8px] font-black font-label text-error/60 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  Course codes missing for generation
                </p>
              )}
            </div>
          </section>

          <section className="bg-bg-surface rounded-3xl p-4 sm:p-8 border border-white/5 shadow-2xl space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 border-b border-white/5 pb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
              </div>
              <h3 className="font-black font-headline text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                Projection Engine
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[9px] font-black font-label text-zinc-600 uppercase tracking-widest ml-1">
                  Previous CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={prevCgpa}
                  onChange={(e) => setPrevCgpa(e.target.value)}
                  className="w-full bg-bg-surface-lowest border border-white/5 rounded-2xl p-4 text-center font-black font-mono text-on-surface outline-none focus:border-primary/50 transition-all shadow-inner-glow"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black font-label text-zinc-600 uppercase tracking-widest ml-1">
                  Historical Cr
                </label>
                <input
                  type="number"
                  placeholder="00"
                  value={prevCredits}
                  onChange={(e) => setPrevCredits(e.target.value)}
                  className="w-full bg-bg-surface-lowest border border-white/5 rounded-2xl p-4 text-center font-black font-mono text-on-surface outline-none focus:border-primary/50 transition-all shadow-inner-glow"
                />
              </div>
            </div>

            {projectedCgpa && (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center animate-zoom-in shadow-inner-glow">
                <p className="text-[8px] font-black font-label text-zinc-600 uppercase tracking-[0.4em] mb-2">
                  Refined Graduation Vector
                </p>
                <span className="text-4xl font-black font-headline text-primary-fixed-dim tracking-tight shadow-glow">
                  {projectedCgpa}
                </span>
              </div>
            )}
          </section>

          <RequiredMarksTool subjects={subjects} />
        </div>
      </div>
    </div>
  );
};

export default SGPACalculator;
