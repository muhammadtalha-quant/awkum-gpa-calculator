import React, { useState, useEffect } from 'react';
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
import { Credit, GradePoint } from '../src/domain/types';

// Shared Components
import SectionCard from './shared/SectionCard';
import InputField from './shared/InputField';
import ActionButton from './shared/ActionButton';
import ResultCard from './shared/ResultCard';

interface Props {}

const CGPACalculator: React.FC<Props> = () => {
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
    updateSubject,
    hydrationReady,
  } = useCGPALogic();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [misTarget, setMisTarget] = useState<{ id: string; index: number } | null>(null);



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
      <MISParserModal
        isOpen={!!misTarget}
        onClose={() => setMisTarget(null)}
        targetSemester={misTarget?.index}
        onImport={(subs) => {
          if (misTarget) {
            updateSemester(misTarget.id, { subjects: subs });
            setMisTarget(null);
          }
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
                  <span className="text-[10px] font-black font-label text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                    Expert Mode
                  </span>
                </label>
                <ActionButton
                  onClick={handleAddSemester}
                  icon="add_moderator"
                  dataTestId="add-semester-btn"
                >
                  Add Academic Block
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
                        <InputField
                          label="Credits"
                          type="number"
                          disabled={isExpertMode}
                          value={sem.credits}
                          onChange={(val) => {
                            if (val === '') {
                              updateSemester(sem.id, { credits: '' });
                              return;
                            }
                            const v = parseInt(val);
                            if (!isNaN(v) && v >= 0 && v <= 99)
                              updateSemester(sem.id, { credits: v as Credit });
                          }}
                          align="center"
                          mono
                          className="w-20"
                          dataTestId="semester-credits-input"
                        />
                        <InputField
                          label="SGPA"
                          type="number"
                          disabled={isExpertMode}
                          value={sem.sgpa}
                          onChange={(val) => {
                            if (val === '') {
                              updateSemester(sem.id, { sgpa: '' });
                              return;
                            }
                            const v = parseFloat(val);
                            if (!isNaN(v) && v >= 0 && v <= 4.0)
                              updateSemester(sem.id, { sgpa: v as GradePoint });
                          }}
                          align="center"
                          mono
                          className="w-24"
                          dataTestId="semester-sgpa-input"
                        />
                        <div className="flex items-center gap-2">
                          {isExpertMode && (
                            <ActionButton
                              onClick={() => setMisTarget({ id: sem.id, index: idx + 1 })}
                              variant="ghost"
                              icon="cloud_download"
                              className="w-10 h-10 !p-0"
                            >
                              {null}
                            </ActionButton>
                          )}
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
                    {isExpertMode && (
                      <div className="w-full mt-4 border-t border-white/5 pt-6">
                        <SemesterSubjectTable
                          semesterId={sem.id}
                          subjects={sem.subjects || []}
                          onUpdate={updateSubject}
                        />
                      </div>
                    )}
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
          {isExpertMode && <RetakeOptimizer currentCGPA={cgpaNum} currentCredits={totalCredits} />}
        </div>
      </div>

      {semesters.length >= 2 && <AnalyticsDashboard />}
    </div>
  );
};

export default CGPACalculator;
