import React, { useState, useEffect } from 'react';
import { UserInfo, Credit, Mark, GradePoint, SGPASubject } from '../src/domain/types';
import { useAcademicStore } from '../src/domain/store';
import { isValidCourseCode } from '../src/core/validation';
import { exportSGPA_PDF } from '../services/pdfService';
import { calculateGradePoint } from '../src/domain/grading/engine';
import UserInfoModal from './UserInfoModal';
import SubjectEntryModal from './SubjectEntryModal';
import MISParserModal from './MISParserModal';
import { calculateSGPA } from '../src/domain/gpa/engine';
import { getLetterFromGP } from '../src/domain/grading/engine';
import RequiredMarksTool from './RequiredMarksTool';
import SubjectList from './SubjectList';

interface Props {
  theme: any;
}

const SGPACalculator: React.FC<Props> = ({ theme }) => {
  const { subjects, setSubjects } = useAcademicStore();

  const [isCalculated, setIsCalculated] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isMISModalOpen, setIsMISModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const MAX_CREDITS = 21;

  // Credit Hour Pruning logic
  useEffect(() => {
    const totalCredits = subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
    if (totalCredits > MAX_CREDITS) {
      const current = [...subjects];
      while (current.reduce((sum, s) => sum + (Number(s.credits) || 0), 0) > MAX_CREDITS && current.length > 1) {
        current.pop();
      }
      setSubjects(current);
      setErrorMsg("Automatically adjusted subjects to maintain the 21-credit hour limit.");
    }
  }, [subjects, setSubjects]);

  const resetAll = () => {
    setErrorMsg('');
    setSubjects([]);
    setIsCalculated(false);
  };

  const handleSubjectSubmit = (data: Partial<SGPASubject>) => {
    const gp = data.gradePoint ?? (data.marks !== undefined && data.marks !== '' ? calculateGradePoint(data.marks as Mark) : 0 as GradePoint);
    const newSub: SGPASubject = {
      id: (Date.now() + Math.random()).toString(),
      name: data.name || '',
      code: data.code || '',
      credits: (data.credits || 3) as Credit,
      marks: (data.marks || 0) as Mark,
      gradePoint: gp,
      gradeLetter: data.gradeLetter || getLetterFromGP(gp)
    };
    setSubjects([...subjects, newSub]);
    setIsCalculated(false);
  };

  const handleMISImport = (imported: SGPASubject[]) => {
    const merged = [...subjects];
    for (const imp of imported) {
      const idx = merged.findIndex(s => s.code === imp.code);
      if (idx >= 0) merged[idx] = imp;
      else merged.push(imp);
    }
    setSubjects(merged);
    setIsCalculated(false);
  };

  const sgpaValue = calculateSGPA(subjects.map(s => ({ gradePoint: s.gradePoint, credits: s.credits })));
  const finalGrade = getLetterFromGP(sgpaValue);

  const calculateTotal = () => {
    setErrorMsg('');
    const hasIncomplete = subjects.some(s => s.name === '' || s.marks === '');
    if (hasIncomplete) {
      setErrorMsg("Please fill in names and marks for all subjects before calculating.");
      return;
    }
    setIsCalculated(true);
  };

  const handlePdfExport = (userInfo: UserInfo) => {
    exportSGPA_PDF(subjects, Number(sgpaValue), finalGrade, userInfo);
  };

  // Export unlocked when all subjects have valid course codes and calculation is done
  const allCodesFilled = subjects.every(s => s.code && isValidCourseCode(s.code));
  const isExportUnlocked = allCodesFilled && isCalculated;

  return (
    <div className={`${theme.card} rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border ${theme.border} relative overflow-hidden`}>
      {/* Modals */}
      <UserInfoModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSubmit={handlePdfExport}
        title="Semester Grade Sheet Details"
        theme={theme}
      />
      <SubjectEntryModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSubmit={handleSubjectSubmit}
        initialData={undefined}
        theme={theme}
        enableCodes={true}
      />
      <MISParserModal
        isOpen={isMISModalOpen}
        onClose={() => setIsMISModalOpen(false)}
        onImport={handleMISImport}
        existingSubjectCodes={subjects.map(s => s.code || '').filter(Boolean)}
        theme={theme}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-40">Subject Entry</h2>
        <button onClick={resetAll} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-colors">CLEAR ALL</button>
      </div>

      {/* Subject list or empty state */}
      {subjects.length === 0 ? (
        <div className={`py-16 text-center border-2 border-dashed ${theme.border} rounded-[2rem] bg-black/5 animate-in fade-in zoom-in`}>
          <div className="mb-6 opacity-20">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-6">No Subjects Added Yet</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className={`px-8 py-3 rounded-2xl ${theme.primary} text-white font-black uppercase tracking-widest hover:opacity-90 shadow-lg active:scale-95 transition-all`}
            >
              Add Subject Manually
            </button>
            <button
              onClick={() => setIsMISModalOpen(true)}
              className="px-8 py-3 rounded-2xl border-2 border-purple-500/40 text-purple-400 font-black uppercase tracking-widest hover:bg-purple-500/10 active:scale-95 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Paste from MIS
            </button>
          </div>
        </div>
      ) : (
        <SubjectList
          subjects={subjects}
          onUpdate={(newSubs: SGPASubject[]) => {
            setSubjects(newSubs);
            setIsCalculated(false);
            setErrorMsg('');
          }}
          theme={theme}
          enableCodes={true}
          maxCredits={MAX_CREDITS}
        />
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 sm:gap-4 items-center mt-8 sm:mt-10">
        <button
          onClick={calculateTotal}
          className={`w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 text-white font-black uppercase tracking-wider sm:tracking-[0.2em] rounded-2xl hover:opacity-90 shadow-xl transition-all active:scale-95 text-xs sm:text-sm ${theme.primary}`}
        >
          Calculate SGPA
        </button>

        {isExportUnlocked && (
          <button
            onClick={() => setIsExportModalOpen(true)}
            className={`px-8 py-4 font-black uppercase tracking-widest rounded-2xl transition-all flex items-center gap-3 bg-white/10 border-2 ${theme.border} hover:bg-white/20 animate-in zoom-in`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export DMC
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mt-8 flex items-center gap-3 text-red-500 text-[11px] font-black uppercase tracking-widest bg-red-500/10 p-5 rounded-3xl border border-red-500/20 animate-in shake duration-500">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          {errorMsg}
        </div>
      )}

      {isCalculated && (
        <div className={`rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 text-center text-white transform transition-all animate-in zoom-in mt-6 sm:mt-8 ${theme.primary} shadow-2xl shadow-blue-500/30 border border-white/10`}>
          <p className="text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] font-black opacity-60 mb-3 sm:mb-4">Semester Performance Index</p>
          <div className="flex flex-col items-center">
            <h3 className="text-5xl sm:text-8xl font-black mb-3 sm:mb-4 tracking-tighter drop-shadow-lg">{Number(sgpaValue).toFixed(2)}</h3>
            <div className="bg-white/20 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/20 inline-block">
              <p className="text-xl font-black uppercase tracking-[0.2em]">Grade: {finalGrade}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12">
        <RequiredMarksTool subjects={subjects} theme={theme} />
      </div>
    </div>
  );
};

export default SGPACalculator;