import React, { useState } from 'react';
import { UserInfo, CGPASemester } from '../src/domain/types';
import { useCGPALogic } from '../src/domain/gpa/useCGPALogic';
import { exportCGPA_PDF } from '../services/pdfService';
import UserInfoModal from './UserInfoModal';
import MISParserModal from './MISParserModal';
import ProbationAlert from './ProbationAlert';
import SemesterSubjectTable from './SemesterSubjectTable';
import ForecastingTool from './ForecastingTool';
import RetakeOptimizer from './RetakeOptimizer';
import PredictiveDashboard from './PredictiveDashboard';
import AnalyticsDashboard from './AnalyticsDashboard';
import { asProgramCredit } from '../src/domain/types';
import { useAcademicStore } from '../src/domain/store';
import { calculateSGPA } from '../src/domain/gpa/engine';

import SectionCard from './shared/SectionCard';
import ActionButton from './shared/ActionButton';
import ResultCard from './shared/ResultCard';

const CGPACalculator: React.FC = () => {
  const {
    semesters,
    errorMsg,
    cgpaNum,
    overallGrade,
    totalCredits,
    qualityPoints,
    handleAddSemester,
    handleRemoveSemester,
    updateSubject,
    hydrationReady,
  } = useCGPALogic();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMISModalOpen, setIsMISModalOpen] = useState(false);

  if (!hydrationReady) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handlePdfExport = (userInfo: UserInfo) => {
    exportCGPA_PDF(semesters, cgpaNum, overallGrade, userInfo);
  };

  const getCgpaLabel = (gpa: number) => {
    if (gpa >= 3.8) return 'First Class with Distinction';
    if (gpa >= 3.5) return 'First Class';
    if (gpa >= 3.0) return 'Second Class';
    if (gpa >= 2.5) return 'Pass';
    if (gpa >= 2.0) return 'Conditional Pass';
    return 'Academic Probation';
  };

  return (
    <div className="space-y-8 animate-in">
      <UserInfoModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSubmit={handlePdfExport}
        title="Unofficial Transcript Generator"
        isCGPA={true}
        rowCount={semesters.length}
      />
      <MISParserModal
        isOpen={isMISModalOpen}
        onClose={() => setIsMISModalOpen(false)}
        onGlobalImport={(incomingSemesters) => {
          const newSemesters: CGPASemester[] = incomingSemesters.map((sem, i) => {
            const sgpa = calculateSGPA(sem.subjects);
            const totalCr = sem.subjects.reduce((sum, s) => sum + Number(s.credits), 0);
            return {
              id: crypto.randomUUID(),
              name: `Semester ${i + 1}`,
              sgpa,
              credits: asProgramCredit(totalCr),
              subjects: sem.subjects,
            };
          });

          useAcademicStore.getState().setSemesters(newSemesters);
          setIsMISModalOpen(false);
        }}
        existingSubjectCodes={[]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <SectionCard
            title="CGPA Utility"
            titleTag="h1"
            subtitle="Historical academic performance aggregation"
            icon="analytics"
            headerAction={
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <ActionButton
                  onClick={() => setIsMISModalOpen(true)}
                  variant="secondary"
                  icon="cloud_download"
                  dataTestId="import-mis-btn"
                >
                  Import MIS
                </ActionButton>
                <ActionButton
                  onClick={handleAddSemester}
                  icon="add_moderator"
                  dataTestId="add-semester-btn"
                >
                  Add Semester
                </ActionButton>
              </div>
            }
          >
            {null}
          </SectionCard>

          {cgpaNum < 2.5 && cgpaNum > 0 && (
            <div className="animate-slide-in-top">
              <ProbationAlert cgpa={cgpaNum} />
            </div>
          )}

          <SectionCard
            title="Academic Trajectory"
            icon="timeline"
            headerAction={
              errorMsg && (
                <span className="text-[9px] font-black text-primary animate-pulse uppercase tracking-wider">
                  {errorMsg}
                </span>
              )
            }
          >
            <div className="space-y-6">
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
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-black font-mono text-zinc-600 group-hover:bg-primary/10 group-hover:text-primary transition-all shrink-0">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black font-headline text-sm text-white">
                            {sem.name}
                          </h4>
                          <p className="text-[9px] font-black font-label text-zinc-700 uppercase tracking-widest">
                            Index Mapping {sem.id.slice(0, 4)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 items-end">
                        <div className="text-center bg-white/5 rounded-xl px-4 py-2 border border-white/5">
                          <p className="text-[9px] font-black font-label text-zinc-500 uppercase tracking-widest mb-1">
                            Credits
                          </p>
                          <p className="text-sm font-black font-mono text-white">
                            {sem.credits || '0'}
                          </p>
                        </div>
                        <div className="text-center bg-white/5 rounded-xl px-4 py-2 border border-white/5">
                          <p className="text-[9px] font-black font-label text-zinc-500 uppercase tracking-widest mb-1">
                            SGPA
                          </p>
                          <p className="text-sm font-black font-mono text-primary">
                            {sem.sgpa ? Number(sem.sgpa).toFixed(2) : '0.00'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pb-1">
                          <ActionButton
                            onClick={() => handleRemoveSemester(sem.id)}
                            variant="ghost"
                            icon="close"
                            className="w-10 h-10 !p-0 hover:!text-error"
                          >
                            {null}
                          </ActionButton>
                        </div>
                      </div>
                    </div>
                    <div className="w-full mt-4 border-t border-white/5 pt-6">
                      <SemesterSubjectTable
                        semesterId={sem.id}
                        subjects={sem.subjects || []}
                        onUpdate={updateSubject}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <ResultCard
            value={cgpaNum.toFixed(2)}
            label="Cumulative Average (CGPA)"
            badge={{
              label: `${overallGrade} Grade`,
              color: 'bg-primary/10 text-primary border-primary/20',
            }}
            icon="equalizer"
            subtitle={getCgpaLabel(cgpaNum)}
            dataTestId="cgpa-score"
            action={
              <ActionButton
                onClick={() => setIsExportModalOpen(true)}
                disabled={semesters.length === 0}
                icon="verified_user"
                fullWidth
              >
                Export Record
              </ActionButton>
            }
          />

          <SectionCard title="Parameter Decomposition" icon="hub">
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
          </SectionCard>

          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 shadow-inner-glow">
            <p className="text-[9px] font-black font-label text-primary uppercase tracking-[0.3em] mb-2">
              Notice
            </p>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium italic">
              Credit hours are automatically regulated. Each academic block must maintain integrity
              between 12-21 credits.
            </p>
          </div>

          <ForecastingTool currentCGPA={cgpaNum} currentCredits={totalCredits} />
          {semesters.length > 0 && <PredictiveDashboard />}
          <RetakeOptimizer currentCGPA={cgpaNum} currentCredits={totalCredits} />
        </div>
      </div>

      {semesters.length >= 2 && <AnalyticsDashboard />}
    </div>
  );
};

export default CGPACalculator;
