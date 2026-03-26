import React, { useState, useEffect } from 'react';
import { UserInfo, SGPASubject } from '../src/domain/types';
import { useSGPALogic } from '../src/domain/gpa/useSGPALogic';
import { isValidCourseCode } from '../src/core/validation';
import { useAcademicStore } from '../src/domain/store';
import { exportSGPA_PDF } from '../services/pdfService';
import UserInfoModal from './UserInfoModal';
import MISParserModal from './MISParserModal';
import RequiredMarksTool from './RequiredMarksTool';
import SubjectEntryModal from './SubjectEntryModal';

// Shared Components
import SectionCard from './shared/SectionCard';
import InputField from './shared/InputField';
import ActionButton from './shared/ActionButton';
import ResultCard from './shared/ResultCard';

interface Props {
  onExportReady?: (fn: () => void) => void;
}

const SGPACalculator: React.FC<Props> = ({ onExportReady }) => {
  const {
    subjects,
    virtualSemesterId,
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
    hydrationReady,
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

  if (!hydrationReady) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
        onImport={(subs) => {
          const state = useAcademicStore.getState();
          let targetId = virtualSemesterId;

          if (!targetId) {
            state.addSemester();
            // Re-fetch to get the newly added semester
            const freshState = useAcademicStore.getState();
            const latest = freshState.semesters[freshState.semesters.length - 1];
            if (latest) targetId = latest.id;
          }

          if (targetId) {
            const finalState = useAcademicStore.getState();
            finalState.setSemesters(
              finalState.semesters.map((sem) =>
                sem.id === targetId ? { ...sem, subjects: [...sem.subjects, ...subs] } : sem,
              ),
            );
          }
        }}
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
          <SectionCard
            title="SGPA Utility"
            titleTag="h1"
            subtitle="Operational analytics for the current semester"
            headerAction={
              <ActionButton
                onClick={() => setIsMISModalOpen(true)}
                variant="secondary"
                icon="cloud_download"
                fullWidth
                dataTestId="import-mis-btn"
              >
                Import MIS
              </ActionButton>
            }
          />

          <SectionCard
            title="Current Vector Mapping"
            icon="list_alt"
            className="p-0 sm:p-0 overflow-hidden"
            headerAction={
              errorMsg && (
                <span className="text-[9px] font-black text-primary animate-pulse uppercase tracking-wider">
                  {errorMsg}
                </span>
              )
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-surface-lowest">
                    <th className="px-8 py-5 font-black font-label text-[9px] tracking-[0.3em] text-zinc-600 uppercase">
                      Course Name
                    </th>
                    <th className="px-6 py-5 font-black font-label text-[9px] tracking-[0.3em] text-zinc-600 uppercase text-center min-w-[120px]">
                      Course Code
                    </th>
                    <th className="px-6 py-5 font-black font-label text-[9px] tracking-[0.3em] text-zinc-600 uppercase text-center w-24">
                      Credit Hours
                    </th>
                    <th className="px-6 py-5 font-black font-label text-[9px] tracking-[0.3em] text-zinc-600 uppercase text-center w-24">
                      Obtained Marks
                    </th>
                    <th className="px-6 py-5 font-black font-label text-[9px] tracking-[0.3em] text-zinc-600 uppercase text-center w-20">
                      Grade Points
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
                          <InputField
                            value={sub.name}
                            onChange={(val) => updateSubject(sub.id, 'name', val)}
                            placeholder="e.g. Advanced AI Models"
                            className="!p-0"
                            dataTestId="subject-name-input"
                          />
                        </td>
                        <td className="px-6 py-6 text-center">
                          <InputField
                            value={sub.code || ''}
                            onChange={(val) => updateSubject(sub.id, 'code', val)}
                            placeholder="CS-101"
                            align="center"
                            mono
                            className="w-24 mx-auto"
                            dataTestId="subject-code-input"
                          />
                        </td>
                        <td className="px-6 py-6 text-center">
                          <InputField
                            type="number"
                            value={sub.credits}
                            onChange={(val) => updateSubject(sub.id, 'credits', val)}
                            align="center"
                            mono
                            className="w-16 mx-auto"
                            dataTestId="subject-credits-input"
                          />
                        </td>
                        <td className="px-6 py-6 text-center">
                          <InputField
                            type="number"
                            value={sub.marks === '' ? '' : sub.marks}
                            onChange={(val) => updateSubject(sub.id, 'marks', val)}
                            placeholder="00"
                            align="center"
                            mono
                            className="w-16 mx-auto"
                            dataTestId="subject-marks-input"
                          />
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
                            <ActionButton
                              onClick={() => setEditingSubject(sub)}
                              variant="ghost"
                              icon="edit"
                              className="w-10 h-10 !p-0"
                            >
                              {null}
                            </ActionButton>
                            <ActionButton
                              onClick={() => removeSubject(sub.id)}
                              variant="ghost"
                              icon="delete_sweep"
                              className="w-10 h-10 !p-0 hover:!text-error"
                            >
                              {null}
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="p-6 border-t border-white/5">
                <ActionButton onClick={addCourse} icon="add_circle" dataTestId="add-course-btn">
                  Add Course
                </ActionButton>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <ResultCard
            value={sgpaNum.toFixed(2)}
            label="Current Performance Mean"
            badge={badge}
            icon="data_usage"
            dataTestId="sgpa-score"
            action={
              <div className="space-y-4">
                <ActionButton
                  onClick={() => setIsExportModalOpen(true)}
                  disabled={!isExportUnlocked}
                  icon="picture_as_pdf"
                  fullWidth
                >
                  Generate Sheet
                </ActionButton>
                {!isExportUnlocked && subjects.length > 0 && (
                  <p className="text-[8px] font-black font-label text-error/60 uppercase tracking-widest flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    Course codes missing for generation
                  </p>
                )}
              </div>
            }
          />

          <SectionCard title="Projection Engine" icon="psychology">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Previous CGPA"
                type="number"
                placeholder="0.00"
                value={prevCgpa}
                onChange={setPrevCgpa}
                align="center"
                mono
              />
              <InputField
                label="Historical Cr"
                type="number"
                placeholder="00"
                value={prevCredits}
                onChange={setPrevCredits}
                align="center"
                mono
              />
            </div>

            {projectedCgpa && (
              <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center animate-zoom-in shadow-inner-glow">
                <p className="text-[8px] font-black font-label text-zinc-600 uppercase tracking-[0.4em] mb-2">
                  Refined Graduation Vector
                </p>
                <span className="text-4xl font-black font-headline text-primary-fixed-dim tracking-tight shadow-glow">
                  {projectedCgpa}
                </span>
              </div>
            )}
          </SectionCard>

          <RequiredMarksTool subjects={subjects} />
        </div>
      </div>
    </div>
  );
};

export default SGPACalculator;
