import React, { useState, useEffect } from 'react';
import { UserInfo, CGPASemester } from '../src/domain/types';
import { useCGPALogic } from '../src/domain/gpa/useCGPALogic';
import { exportCGPA_PDF } from '../services/pdfService';
import UserInfoModal from './UserInfoModal';
import ProbationAlert from './ProbationAlert';
import SemesterSubjectTable from './SemesterSubjectTable';
import ForecastingTool from './ForecastingTool';
import RetakeOptimizer from './RetakeOptimizer';
import PredictiveDashboard from './PredictiveDashboard';
import AnalyticsDashboard from './AnalyticsDashboard';
import { Credit, GradePoint } from '../src/domain/types';

interface Props {
  onExportReady?: (fn: () => void) => void;
}

const CGPACalculator: React.FC<Props> = ({ onExportReady }) => {
  const {
    semesters,
    errorMsg,
    cgpaNum,
    overallGrade,
    totalCredits,
    qualityPoints,
    handleAddSemester,
    handleRemoveSemester,
    updateSemester,
    updateSemesterSubjects,
  } = useCGPALogic();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);

  useEffect(() => {
    if (onExportReady) onExportReady(() => setIsExportModalOpen(true));
  }, [onExportReady]);

  const handlePdfExport = (userInfo: UserInfo) => {
    exportCGPA_PDF(semesters, cgpaNum, overallGrade, userInfo);
  };

  const getCgpaLabel = (gpa: number) => {
    if (gpa >= 3.75) return 'First Class with Distinction';
    if (gpa >= 3.0) return 'First Class';
    if (gpa >= 2.5) return 'Second Class';
    if (gpa >= 2.0) return 'Pass';
    return 'Academic Probation';
  };

  return (
    <div className="space-y-8 animate-in">
      <UserInfoModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSubmit={handlePdfExport}
        title="Academic Export Passport"
        isCGPA={true}
        rowCount={semesters.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-bg-surface rounded-3xl p-4 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 border border-white/5 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-8xl text-primary">analytics</span>
            </div>
            <div className="relative z-10">
              <h1 className="text-3xl font-black font-headline text-white tracking-tight">
                CGPA Utility
              </h1>
              <p className="text-zinc-500 text-xs font-black font-label uppercase tracking-widest mt-2">
                Historical academic performance aggregation
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <label className="flex items-center cursor-pointer gap-2">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isExpertMode}
                    onChange={() => setIsExpertMode(!isExpertMode)}
                  />
                  <div
                    className={`block w-10 h-6 rounded-full transition-colors ${isExpertMode ? 'bg-primary' : 'bg-white/10'}`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isExpertMode ? 'transform translate-x-4' : ''}`}
                  ></div>
                </div>
                <div className="group relative">
                  <span className="text-[10px] font-black font-label text-zinc-400 uppercase tracking-widest">
                    Expert Mode
                  </span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-zinc-800 text-zinc-300 text-[10px] p-2 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Enable subject-level tracking for Retake Optimizer and advanced forecasting.
                  </div>
                </div>
              </label>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              {isExpertMode && (
                <button
                  data-testid="import-mis-btn"
                  className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-zinc-400 text-[10px] font-black font-label uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-[18px]">cloud_download</span>
                  Import MIS
                </button>
              )}
              <button
                data-testid="add-semester-btn"
                onClick={handleAddSemester}
                className="relative z-10 flex-1 md:flex-none px-10 py-4 rounded-2xl bg-primary text-on-primary text-[10px] font-black font-label uppercase tracking-widest hover:shadow-glow transition-all flex items-center justify-center gap-3 active:scale-95 group/add"
              >
                <span className="material-symbols-outlined text-[20px] relative z-10">
                  add_moderator
                </span>
                <span className="relative z-10">Add Academic Block</span>
              </button>
            </div>
          </section>

          {cgpaNum < 2.5 && cgpaNum > 0 && (
            <div className="animate-slide-in-top">
              <ProbationAlert cgpa={cgpaNum} />
            </div>
          )}

          <section className="bg-bg-surface rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">timeline</span>
                <h3 className="font-black font-headline text-[11px] uppercase tracking-[0.3em] text-zinc-400">
                  Academic Trajectory
                </h3>
              </div>
              {errorMsg && (
                <span className="text-[9px] font-black text-primary animate-pulse uppercase tracking-wider">
                  {errorMsg}
                </span>
              )}
            </div>
            <div className="p-4 sm:p-8 space-y-6">
              {semesters.length === 0 ? (
                <div className="py-24 text-center text-zinc-700 font-label text-[10px] font-black uppercase tracking-widest bg-bg-surface-lowest border border-dashed border-white/5 rounded-2xl">
                  Neural history empty. Secure your first academic block.
                </div>
              ) : (
                semesters.map((sem: CGPASemester, idx) => (
                  <div
                    key={sem.id}
                    data-testid="semester-row"
                    className="group flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 bg-bg-surface-lowest border border-white/5 rounded-2xl hover:bg-white/[0.02] transition-all duration-300 shadow-inner-glow relative overflow-hidden"
                  >
                    <div className="flex flex-col xs:flex-row gap-3 items-start xs:items-center flex-wrap">
                      <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-black font-mono text-zinc-600 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black font-headline text-sm text-white">{sem.name}</h4>
                        <p className="text-[9px] font-black font-label text-zinc-700 uppercase tracking-widest">
                          Index Mapping {sem.id.slice(0, 4)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black font-label text-zinc-600 uppercase tracking-widest ml-1">
                          Credits
                        </label>
                        <input
                          type="number"
                          data-testid="semester-credits-input"
                          disabled={isExpertMode}
                          value={sem.credits}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '') return;
                            const v = parseInt(raw);
                            if (!isNaN(v) && v >= 1 && v <= 99)
                              updateSemester(sem.id, { credits: v as Credit });
                          }}
                          className="w-20 bg-black/20 border border-white/5 rounded-xl p-3 text-center font-black font-mono text-xs text-on-surface outline-none focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black font-label text-zinc-600 uppercase tracking-widest ml-1">
                          SGPA
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          data-testid="semester-sgpa-input"
                          disabled={isExpertMode}
                          value={sem.sgpa}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '') return;
                            const v = parseFloat(raw);
                            if (!isNaN(v) && v >= 0 && v <= 4.0)
                              updateSemester(sem.id, { sgpa: v as GradePoint });
                          }}
                          className="w-24 bg-black/20 border border-white/5 rounded-xl p-3 text-center font-black font-mono text-xs text-on-surface outline-none focus:border-primary/50"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveSemester(sem.id)}
                        className="ml-auto mt-0 w-10 h-10 flex items-center justify-center rounded-xl bg-error/0 text-error/30 hover:bg-error/10 hover:text-error transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  </div>
                  {isExpertMode && (
                      <div className="w-full mt-4">
                        <SemesterSubjectTable
                          semesterId={sem.id}
                          subjects={sem.subjects || []}
                          onUpdate={updateSemesterSubjects}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="bg-bg-surface rounded-3xl p-6 sm:p-10 border border-white/5 shadow-glow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-8xl text-primary">equalizer</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center relative z-10">
              <p className="text-[10px] font-black font-label text-zinc-500 uppercase tracking-[0.4em] mb-4">
                Cumulative Average (CGPA)
              </p>
              <div className="relative group/score">
                <span
                  data-testid="cgpa-score"
                  className="text-6xl sm:text-8xl font-black font-headline text-white tracking-tighter text-shadow-glow drop-shadow-2xl transition-transform duration-700 group-hover/score:scale-105 inline-block"
                >
                  {cgpaNum.toFixed(2)}
                </span>
                <div className="absolute -top-4 -left-1/2 translate-x-1/2 w-max">
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase border border-primary/20 animate-pulse shadow-soft backdrop-blur-md">
                    {overallGrade} GRADE
                  </div>
                </div>
              </div>

              <h4 className="mt-8 text-[11px] font-black font-label text-white uppercase tracking-[0.2em] bg-white/5 px-6 py-2 rounded-full border border-white/5">
                {getCgpaLabel(cgpaNum)}
              </h4>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full">
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="group/btn relative flex-1 rounded-2xl bg-white/5 border border-white/5 text-zinc-400 text-[9px] font-black font-label uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 py-4 sm:py-0 sm:h-14"
                >
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  Export Record
                </button>
              </div>
            </div>
          </section>

          <section className="bg-bg-surface rounded-3xl p-4 sm:p-8 border border-white/5 shadow-2xl space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3 border-b border-white/5 pb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[16px]">hub</span>
              </div>
              <h3 className="font-black font-headline text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                Parameter Decomposition
              </h3>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-bg-surface-lowest border border-white/5 rounded-2xl flex justify-between items-center group/item hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-zinc-700 group-hover/item:text-primary transition-colors">
                    history_edu
                  </span>
                  <span className="text-[10px] font-black font-label text-zinc-500 uppercase tracking-widest">
                    Quality Points
                  </span>
                </div>
                <span className="font-black font-mono text-white tracking-widest">
                  {qualityPoints.toFixed(2)}
                </span>
              </div>
              <div className="p-5 bg-bg-surface-lowest border border-white/5 rounded-2xl flex justify-between items-center group/item hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-zinc-700 group-hover/item:text-primary transition-colors">
                    bar_chart_4_bars
                  </span>
                  <span className="text-[10px] font-black font-label text-zinc-500 uppercase tracking-widest">
                    Total Credits
                  </span>
                </div>
                <span className="font-black font-mono text-white tracking-widest">
                  {totalCredits}
                </span>
              </div>
              <div className="p-5 bg-bg-surface-lowest border border-white/5 rounded-2xl flex justify-between items-center group/item hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-zinc-700 group-hover/item:text-primary transition-colors">
                    calendar_month
                  </span>
                  <span className="text-[10px] font-black font-label text-zinc-500 uppercase tracking-widest">
                    Modules Count
                  </span>
                </div>
                <span className="font-black font-mono text-white tracking-widest">
                  {semesters.length}
                </span>
              </div>
            </div>
          </section>

          <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 shadow-inner-glow">
            <p className="text-[9px] font-black font-label text-primary uppercase tracking-[0.3em] mb-2">
              Notice
            </p>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium italic">
              Credit hours are automatically regulated. Each academic block must maintain integrity
              between 12-21 credits.
            </p>
          </div>

          {/* GPA Forecasting Tool */}
          <ForecastingTool currentCGPA={cgpaNum} currentCredits={totalCredits} />

          {/* Predictive Projection Dashboard */}
          {semesters.length > 0 && <PredictiveDashboard />}

          {/* Retake Strategy Engine — only in Expert Mode with subject data */}
          {isExpertMode && <RetakeOptimizer currentCGPA={cgpaNum} currentCredits={totalCredits} />}
        </div>
      </div>

      {/* Analytics Dashboard — full width below the grid */}
      {semesters.length >= 2 && <AnalyticsDashboard />}
    </div>
  );
};

export default CGPACalculator;
