import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  SGPASubject,
  CGPASemester,
  GradePoint,
  Credit,
  Mark,
  asProgramCredit,
} from '../domain/types';
import { calculateGradePoint, getLetterFromGP } from '../domain/grading/engine';
import { calculateSGPA } from '../domain/gpa/engine';

interface AcademicState {
  subjects: SGPASubject[];
  semesters: CGPASemester[];

  // Actions
  setSubjects: (subjects: SGPASubject[]) => void;
  updateSubject: (id: string, updates: Partial<SGPASubject>) => void;
  addSubject: () => void;
  removeSubject: (id: string) => void;

  setSemesters: (semesters: CGPASemester[]) => void;
  updateSemester: (id: string, updates: Partial<CGPASemester>) => void;
  updateSemesterSubject: (
    semesterId: string,
    subjectId: string,
    updates: Partial<SGPASubject>,
  ) => void;
  addSemester: () => void;
  removeSemester: (id: string) => void;

  // Simulation State
  projectionMode: 'current' | 'best' | 'worst' | 'expected';
  futureCredits: number;
  setProjectionMode: (mode: 'current' | 'best' | 'worst' | 'expected') => void;
  setFutureCredits: (credits: number) => void;
}

export const useAcademicStore = create<AcademicState>()(
  persist(
    (set) => ({
      subjects: [],
      semesters: [],
      projectionMode: 'current',
      futureCredits: 0,

      setProjectionMode: (mode: 'current' | 'best' | 'worst' | 'expected') =>
        set({ projectionMode: mode }),
      setFutureCredits: (credits: number) => set({ futureCredits: credits }),

      setSubjects: (subjects: SGPASubject[]) => set({ subjects }),

      updateSubject: (id: string, updates: Partial<SGPASubject>) =>
        set((state: AcademicState) => {
          const newSubjects = state.subjects.map((s: SGPASubject) => {
            if (s.id === id) {
              const updated = { ...s, ...updates };
              // Auto-recalculate GP if marks or credits change
              if (updates.marks !== undefined && updates.marks !== '') {
                const gp = calculateGradePoint(updates.marks as Mark);
                updated.gradePoint = gp;
                updated.gradeLetter = getLetterFromGP(gp);
              } else if (updates.marks === '') {
                updated.gradePoint = 0 as GradePoint;
                updated.gradeLetter = 'F';
              }
              return updated;
            }
            return s;
          });
          return { subjects: newSubjects };
        }),

      addSubject: () =>
        set((state: AcademicState) => ({
          subjects: [
            ...state.subjects,
            {
              id: crypto.randomUUID(),
              name: '',
              credits: 3 as Credit,
              marks: '' as Mark | '',
              gradePoint: 0 as GradePoint,
              gradeLetter: 'F',
            },
          ],
        })),

      removeSubject: (id: string) =>
        set((state: AcademicState) => ({
          subjects: state.subjects.filter((s: SGPASubject) => s.id !== id),
        })),

      setSemesters: (semesters: CGPASemester[]) => set({ semesters }),

      updateSemester: (id: string, updates: Partial<CGPASemester>) =>
        set((state: AcademicState) => ({
          semesters: state.semesters.map((s: CGPASemester) =>
            s.id === id ? { ...s, ...updates } : s,
          ),
        })),

      updateSemesterSubject: (
        semesterId: string,
        subjectId: string,
        updates: Partial<SGPASubject>,
      ) =>
        set((state: AcademicState) => {
          const nextSemesters = state.semesters.map((sem: CGPASemester) => {
            if (sem.id === semesterId) {
              const nextSubjects = (sem.subjects || []).map((sub: SGPASubject) => {
                if (sub.id === subjectId) {
                  const updated = { ...sub, ...updates };
                  if (updates.marks !== undefined && updates.marks !== '') {
                    const gp = calculateGradePoint(updates.marks as Mark);
                    updated.gradePoint = gp;
                    updated.gradeLetter = getLetterFromGP(gp);
                  } else if (updates.marks === '') {
                    updated.gradePoint = 0 as GradePoint;
                    updated.gradeLetter = 'F';
                  }
                  return updated;
                }
                return sub;
              });

              // Auto-recalculate semester SGPA and Credits
              const semGp = calculateSGPA(
                nextSubjects.map((s: SGPASubject) => ({
                  gradePoint: s.gradePoint,
                  credits: s.credits,
                })),
              );
              const semCredits = nextSubjects.reduce(
                (sum: number, s: SGPASubject) => sum + (Number(s.credits) || 0),
                0,
              );

              return {
                ...sem,
                subjects: nextSubjects,
                sgpa: semGp,
                credits: asProgramCredit(Math.min(21, Math.max(0, semCredits))),
              };
            }
            return sem;
          });
          return { semesters: nextSemesters };
        }),

      addSemester: () =>
        set((state: AcademicState) => ({
          semesters: [
            ...state.semesters,
            {
              id: crypto.randomUUID(),
              name: `Semester ${state.semesters.length + 1}`,
              sgpa: 0 as GradePoint,
              credits: 15 as Credit,
              subjects: [],
            },
          ],
        })),

      removeSemester: (id: string) =>
        set((state: AcademicState) => ({
          semesters: state.semesters
            .filter((s: CGPASemester) => s.id !== id)
            .map((s: CGPASemester, idx: number) => ({ ...s, name: `Semester ${idx + 1}` })),
        })),
    }),
    {
      name: 'awkum-academic-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
