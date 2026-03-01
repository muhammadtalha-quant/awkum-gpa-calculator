import React, { useState, useEffect } from 'react';
import { UserInfo, GradePoint, Credit, asGP, asCredit, Mark, CGPASemester } from '../src/domain/types';
import { useAcademicStore } from '../src/domain/store';
import { getLetterFromGP } from '../src/domain/grading/engine';
import { calculateCGPA } from '../src/domain/gpa/engine';
import { isValidCourseCode } from '../src/core/validation';
import { useKeyboardShortcuts } from '../src/core/useKeyboardShortcuts';
import { exportCGPA_PDF } from '../services/pdfService';
import UserInfoModal from './UserInfoModal';
import ProbationAlert from './ProbationAlert';
import ForecastingTool from './ForecastingTool';
import AnalyticsDashboard from './AnalyticsDashboard';
import PredictiveDashboard from './PredictiveDashboard';
import RetakeOptimizer from './RetakeOptimizer';

import SemesterEntryModal from './SemesterEntryModal';
import SubjectList from './SubjectList';
import Pagination from './Pagination';

interface Props {
  theme: any;
}

const CGPACalculator: React.FC<Props> = ({ theme }) => {
  const { semesters, addSemester, removeSemester, updateSemester, setSemesters } = useAcademicStore();

  const [isCalculated, setIsCalculated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [isInfoVerified, setIsInfoVerified] = useState(false);

  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<{ id: string, sgpa: GradePoint, credits: Credit, name: string } | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 4;
  const MAX_CREDITS = 216;
  const MIN_ROOM_FOR_ADD = 12;
  const MAX_ROWS = 12;

  const totalPages = Math.ceil(semesters.length / ITEMS_PER_PAGE);
  const paginatedSemesters = semesters.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Credit Hour Pruning logic for CGPA
  useEffect(() => {
    if (!isExpertMode) {
      const totalCredits = semesters.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
      if (totalCredits > MAX_CREDITS) {
        const current = [...semesters];
        while (current.reduce((sum, s) => sum + (Number(s.credits) || 0), 0) > MAX_CREDITS && current.length > 1) {
          current.pop();
        }
        setSemesters(current);
        setErrorMsg("Adjusted semesters to maintain global credit limit.");
      }
    }
  }, [semesters, isExpertMode, setSemesters]);

  const handleAddRow = () => {
    const currentTotalCredits = semesters.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
    if (semesters.length >= MAX_ROWS || (MAX_CREDITS - currentTotalCredits) < MIN_ROOM_FOR_ADD) return;

    setErrorMsg('');
    if (isExpertMode) {
      addSemester();
    } else {
      setEditingSemester(undefined);
      setIsSemesterModalOpen(true);
    }
  };

  const handleRemoveRow = (id: string) => {
    setErrorMsg('');
    if (semesters.length > 1) {
      removeSemester(id);
      if (paginatedSemesters.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } else {
      setSemesters([]);
    }
  };

  const handleOpenSemesterModal = (sem: CGPASemester) => {
    setEditingSemester({ id: sem.id, sgpa: sem.sgpa, credits: sem.credits, name: sem.name });
    setIsSemesterModalOpen(true);
  };

  const handleSemesterSubmit = (data: { sgpa: GradePoint, credits: Credit }) => {
    if (editingSemester) {
      updateSemester(editingSemester.id, data);
      setIsCalculated(false);
    } else {
      // Direct Add from Modal
      const newId = Math.random().toString(36).substr(2, 9);
      const newName = `Semester ${semesters.length + 1}`;
      setSemesters([...semesters, {
        id: newId,
        name: newName,
        sgpa: data.sgpa,
        credits: data.credits,
        subjects: []
      }]);
      setIsCalculated(false);
    }
  };

  const handleSubjectsUpdate = (semesterId: string, updatedSubjects: any[]) => {
    const semCredits = updatedSubjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
    const semSgpa = updatedSubjects.length > 0
      ? Number((updatedSubjects.reduce((sum, s) => sum + (Number(s.gradePoint) * Number(s.credits)), 0) / semCredits).toFixed(2))
      : 0;

    updateSemester(semesterId, {
      subjects: updatedSubjects,
      credits: asCredit(semCredits),
      sgpa: asGP(semSgpa)
    });
    setIsCalculated(false);
  };

  const cgpaValue = calculateCGPA(semesters.map(s => ({ sgpa: s.sgpa, credits: s.credits })));
  const overallGrade = getLetterFromGP(cgpaValue);

  const calculateTotal = () => {
    setErrorMsg('');
    if (semesters.length === 0) {
      setErrorMsg("Please add at least one semester to calculate CGPA.");
      return;
    }
    const hasError = semesters.some(s => {
      if (isExpertMode) {
        return !s.subjects || s.subjects.length === 0 || s.subjects.some(sub => sub.name === '' || sub.marks === '');
      }
      return Number(s.sgpa) === 0 || Number(s.credits) === 0;
    });

    if (hasError) {
      setErrorMsg(isExpertMode
        ? "Please ensure all subjects in every semester are filled correctly."
        : "Please ensure all semesters have valid SGPA and Credits.");
      return;
    }
    setIsCalculated(true);
  };

  const resetAll = () => {
    setErrorMsg('');
    setSemesters([]);
    setIsCalculated(false);
    setIsInfoVerified(false);
    setCurrentPage(1);
  };

  const handlePdfExport = (userInfo: UserInfo) => {
    exportCGPA_PDF(semesters, Number(cgpaValue), overallGrade, userInfo);
  };

  const toggleMode = (checked: boolean) => {
    setIsExpertMode(checked);
    setIsCalculated(false);
    // Removed auto-semester addition to maintain clean slate
  };

  const isExpertValid = isExpertMode && semesters.every(sem => {
    if (!sem.subjects || sem.subjects.length === 0) return false;
    return sem.subjects.every(sub => sub.marks !== '' && Number(sub.credits) > 0 && sub.code && isValidCourseCode(sub.code));
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+n': () => { if (showAddButton) handleAddRow(); },
    'ctrl+s': () => { if (isExpertMode && showAddButton) handleAddRow(); },
    'escape': () => {
      setIsSemesterModalOpen(false);
      setIsModalOpen(false);
    }
  });

  const showExportButton = isExpertMode && isExpertValid && isCalculated && isInfoVerified;
  const currentTotalCredits = semesters.reduce((sum: number, s: CGPASemester) => sum + (Number(s.credits) || 0), 0);
  const showAddButton = semesters.length < MAX_ROWS && (MAX_CREDITS - currentTotalCredits) >= MIN_ROOM_FOR_ADD;

  return (
    <div className={`${theme.card} rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border ${theme.border} relative`}>
      <UserInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handlePdfExport} title="Cumulative Grade Sheet Details" isCGPA={true} rowCount={semesters.length} theme={theme} />

      <SemesterEntryModal
        isOpen={isSemesterModalOpen}
        onClose={() => setIsSemesterModalOpen(false)}
        onSubmit={handleSemesterSubmit}
        initialData={editingSemester}
        theme={theme}
      />

      <div className="flex flex-col gap-4 mb-6 sm:mb-10">
        <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-40">Cumulative Assessment</h2>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <label className={`flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer select-none ${theme.accent}`}>
            <div className={`relative w-12 h-6 rounded-full transition-all duration-500 bg-black/10 border ${theme.border}`}>
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isExpertMode}
                onChange={e => toggleMode(e.target.checked)}
              />
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all duration-300 ${isExpertMode ? 'translate-x-6 bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-gray-400'}`}></div>
            </div>
            {isExpertMode ? 'Expert Mode' : 'Quick Mode'}
          </label>
          <button onClick={resetAll} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-colors">RESET ALL DATA</button>
        </div>
      </div>

      {semesters.length === 0 ? (
        <div className={`py-16 text-center border-2 border-dashed ${theme.border} rounded-[2rem] bg-black/5 animate-in fade-in zoom-in mb-8`}>
          <div className="mb-6 opacity-20">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-4">No Semesters Added</h3>
          <button
            onClick={handleAddRow}
            className={`px-8 py-3 rounded-2xl ${theme.primary} text-white font-black uppercase tracking-widest hover:opacity-90 shadow-lg active:scale-95 transition-all`}
          >
            Add Academic Record
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {paginatedSemesters.map((sem) => (
            <div key={sem.id} className={`p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] border ${theme.border} bg-white/5 hover:bg-white/10 transition-all duration-500 animate-in slide-in-from-bottom-6`}>
              <div className="flex flex-col gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${theme.primary} text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-lg flex-shrink-0`}>
                    {sem.name.match(/\d+/)?.[0] || '?'}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-lg font-black uppercase tracking-wider sm:tracking-widest">{sem.name}</h3>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Academic Record</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-8 bg-black/10 px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl border border-white/5 w-full sm:w-auto">
                  <div className="text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Semester SGPA</p>
                    <p className={`text-2xl font-black ${theme.accent}`}>{Number(sem.sgpa).toFixed(2)}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div className="text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Total Credits</p>
                    <p className="text-2xl font-black">{Number(sem.credits)}</p>
                  </div>
                  <div className="flex gap-2">
                    {!isExpertMode && (
                      <button
                        onClick={() => handleOpenSemesterModal(sem)}
                        className="p-3 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveRow(sem.id)}
                      className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {isExpertMode && (
                <div className="mt-8 pt-8 border-t border-white/5 animate-in fade-in duration-700">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 mb-6 ml-1">Subject Breakdown</p>
                  <SubjectList
                    subjects={sem.subjects || []}
                    onUpdate={(subs) => handleSubjectsUpdate(sem.id, subs)}
                    theme={theme}
                    enableCodes={true}
                    maxCredits={21}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-8">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} theme={theme} />

        <div className="flex flex-wrap gap-4 items-center justify-center">
          {showAddButton ? (
            <button onClick={handleAddRow} className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 ${theme.border} ${theme.accent} font-black uppercase tracking-widest rounded-2xl hover:bg-black/5 transition-all flex items-center justify-center gap-3 active:scale-95 text-xs sm:text-sm`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add Semester
            </button>
          ) : (
            <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] bg-blue-500/10 px-6 py-4 rounded-2xl border border-blue-500/20 shadow-sm animate-in zoom-in">
              Degree Credit Limit Reached ({MAX_CREDITS} Hrs)
            </div>
          )}

          <button onClick={calculateTotal} className={`w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 text-white font-black uppercase tracking-wider sm:tracking-[0.2em] rounded-2xl hover:opacity-90 shadow-2xl transition-all active:scale-95 text-xs sm:text-sm ${theme.primary}`}>Calculate CGPA</button>

          {showExportButton && (
            <button onClick={() => setIsModalOpen(true)} className={`px-8 py-4 font-black uppercase tracking-widest rounded-2xl transition-all flex items-center gap-3 bg-white/10 border-2 ${theme.border} hover:bg-white/20 animate-in zoom-in shadow-lg`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Export Transcript
            </button>
          )}
        </div>
      </div>

      {!isExpertMode && (
        <div className="mt-8 text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] bg-blue-500/10 p-6 rounded-[1.5rem] border border-blue-500/20 text-center leading-relaxed max-w-2xl mx-auto shadow-inner">
          Switch to Expert Mode for a detailed subject-wise breakdown and unofficial transcript generation.
        </div>
      )}

      {isExpertMode && (
        <div className="mt-8 flex items-center gap-5 p-6 bg-black/5 rounded-[2rem] animate-in slide-in-from-left-4 border border-white/5 shadow-inner max-w-2xl mx-auto">
          <input
            type="checkbox"
            id="confirmInfo"
            checked={isInfoVerified}
            onChange={e => setIsInfoVerified(e.target.checked)}
            className="themed-checkbox shadow-md"
          />
          <label htmlFor="confirmInfo" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 cursor-pointer select-none leading-relaxed">
            I confirm that the detailed semester records are verified against my MIS Profile.
          </label>
        </div>
      )}

      {errorMsg && (
        <div className="mt-8 flex items-center gap-4 text-red-500 text-[11px] font-black uppercase tracking-widest bg-red-500/10 p-6 rounded-[2rem] border border-red-500/20 animate-in shake">
          <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          {errorMsg}
        </div>
      )}

      {isCalculated && (
        <div className={`rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-12 text-center text-white transform transition-all animate-in zoom-in mt-8 sm:mt-10 ${theme.primary} shadow-[0_20px_50px_rgba(59,130,246,0.3)] border border-white/10`}>
          <p className="text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] font-black opacity-60 mb-3 sm:mb-4">Cumulative Grade Point Average</p>
          <div className="flex flex-col items-center">
            <h3 className="text-5xl sm:text-8xl font-black mb-3 sm:mb-4 tracking-tighter drop-shadow-2xl">{Number(cgpaValue).toFixed(2)}</h3>
            <div className="bg-white/20 backdrop-blur-xl px-6 sm:px-10 py-3 sm:py-4 rounded-2xl border border-white/20 inline-block">
              <p className="text-2xl font-black uppercase tracking-[0.2em]">Standing: {overallGrade}</p>
            </div>
          </div>
          <div className="mt-8">
            <ProbationAlert cgpa={Number(cgpaValue)} theme={theme} />
          </div>
        </div>
      )}

      <div className="mt-16 pt-12 border-t border-white/5">
        <IntelligencePanel theme={theme} currentCGPA={Number(cgpaValue)} currentCredits={currentTotalCredits} />
      </div>
    </div>
  );
};

// --- Intelligence Panel (Tabbed) ---
const IntelligencePanel: React.FC<{ theme: any; currentCGPA: number; currentCredits: number }> = ({ theme, currentCGPA, currentCredits }) => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'simulate' | 'retake'>('forecast');

  const tabs = [
    { id: 'forecast', label: 'Forecasting', icon: '📈' },
    { id: 'simulate', label: 'Outcome Sim', icon: '🔭' },
    { id: 'retake', label: 'Retake ROI', icon: '⚡' },
  ];

  return (
    <div>
      {/* Tab Nav */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
              : 'opacity-40 hover:opacity-70 hover:bg-black/5'
              }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'forecast' && (
        <ForecastingTool currentCGPA={currentCGPA} currentCredits={currentCredits} theme={theme} />
      )}
      {activeTab === 'simulate' && (
        <PredictiveDashboard theme={theme} />
      )}
      {activeTab === 'retake' && (
        <RetakeOptimizer theme={theme} />
      )}
    </div>
  );
};

export default CGPACalculator;