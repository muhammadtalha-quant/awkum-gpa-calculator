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
  // Unified State Model: subjects now always live inside semesters
  semesters: CGPASemester[];

  // Selection/UI State
  activeSemesterId: string | null;
  hydrationReady: boolean;

  // Forecasting/Analytics State
  projectionMode: 'current' | 'best' | 'expected' | 'worst';
  futureCredits: number;

  // Global Actions
  setSemesters: (semesters: CGPASemester[]) => void;
  addSemester: () => void;
  removeSemester: (id: string) => void;
  updateSemester: (id: string, updates: Partial<CGPASemester>) => void;

  // Forecasting Actions
  setProjectionMode: (mode: 'current' | 'best' | 'expected' | 'worst') => void;
  setFutureCredits: (credits: number) => void;

  // Subject Actions (Scoped to semester)
  addSubject: (semesterId: string) => void;
  removeSubject: (semesterId: string, subjectId: string) => void;
  updateSubject: (semesterId: string, subjectId: string, updates: Partial<SGPASubject>) => void;

  // Persistence/Lifecycle
  setHydrationReady: (ready: boolean) => void;
  resetAll: () => void;
}

const STORAGE_NAME = 'awkum-academic-v2';

export const useAcademicStore = create<AcademicState>()(
  persist(
    (set) => ({
      semesters: [],
      activeSemesterId: null,
      hydrationReady: false,
      projectionMode: 'expected',
      futureCredits: 15,

      setHydrationReady: (ready) => set({ hydrationReady: ready }),

      setSemesters: (semesters) => set({ semesters }),

      setProjectionMode: (projectionMode) => set({ projectionMode }),
      setFutureCredits: (futureCredits) => set({ futureCredits }),

      addSemester: () =>
        set((state) => {
          const newSemesterId = crypto.randomUUID();
          return {
            semesters: [
              ...state.semesters,
              {
                id: newSemesterId,
                name: `Semester ${state.semesters.length + 1}`,
                sgpa: 0 as GradePoint,
                credits: 3 as Credit, // Default credits for a single 3-unit subject
                subjects: [
                  {
                    id: crypto.randomUUID(),
                    name: '',
                    code: '',
                    credits: 3 as Credit,
                    marks: '' as Mark | '',
                    gradePoint: 0 as GradePoint,
                    gradeLetter: 'F',
                  },
                ],
              },
            ],
          };
        }),

      removeSemester: (id) =>
        set((state) => ({
          semesters: state.semesters
            .filter((s) => s.id !== id)
            .map((s, i) => ({ ...s, name: `Semester ${i + 1}` })),
        })),

      updateSemester: (id, updates) =>
        set((state) => ({
          semesters: state.semesters.map((s) => {
            if (s.id !== id) return s;
            const next = { ...s, ...updates };
            if (updates.subjects) {
              next.sgpa = calculateSGPA(
                updates.subjects.map((sub) => ({
                  gradePoint: sub.gradePoint,
                  credits: sub.credits,
                })),
              );
              next.credits = asProgramCredit(
                updates.subjects.reduce((sum, sub) => sum + (Number(sub.credits) || 0), 0),
              );
            }
            return next;
          }),
        })),

      addSubject: (semesterId) =>
        set((state) => ({
          semesters: state.semesters.map((sem) => {
            if (sem.id !== semesterId) return sem;
            const nextSubjects = [
              ...sem.subjects,
              {
                id: crypto.randomUUID(),
                name: '',
                code: '',
                credits: 3 as Credit,
                marks: '' as Mark | '',
                gradePoint: 0 as GradePoint,
                gradeLetter: 'F',
              },
            ];
            const sgpa = calculateSGPA(nextSubjects);
            const credits = nextSubjects.reduce((s, sub) => s + (Number(sub.credits) || 0), 0);
            return { ...sem, subjects: nextSubjects, sgpa, credits: asProgramCredit(credits) };
          }),
        })),

      removeSubject: (semesterId, subjectId) =>
        set((state) => {
          const nextSemesters = state.semesters.map((sem) => {
            if (sem.id !== semesterId) return sem;
            const nextSubjects = sem.subjects.filter((sub) => sub.id !== subjectId);
            const sgpa = calculateSGPA(nextSubjects);
            const credits = nextSubjects.reduce((s, sub) => s + (Number(sub.credits) || 0), 0);
            return { ...sem, subjects: nextSubjects, sgpa, credits: asProgramCredit(credits) };
          });
          return { semesters: nextSemesters };
        }),

      updateSubject: (semesterId, subjectId, updates) =>
        set((state) => {
          const nextSemesters = state.semesters.map((sem) => {
            if (sem.id !== semesterId) return sem;
            const nextSubjects = sem.subjects.map((sub) => {
              if (sub.id !== subjectId) return sub;
              const updated = { ...sub, ...updates };

              // Recalculate GP/Letter if marks change
              if (updates.marks !== undefined) {
                if (updates.marks === '') {
                  updated.gradePoint = 0 as GradePoint;
                  updated.gradeLetter = 'F';
                } else {
                  const gp = calculateGradePoint(updates.marks as Mark);
                  updated.gradePoint = gp;
                  updated.gradeLetter = getLetterFromGP(gp);
                }
              }
              return updated;
            });

            const sgpa = calculateSGPA(nextSubjects);
            const credits = nextSubjects.reduce((s, sub) => s + (Number(sub.credits) || 0), 0);
            return { ...sem, subjects: nextSubjects, sgpa, credits: asProgramCredit(credits) };
          });
          return { semesters: nextSemesters };
        }),

      resetAll: () => set({ semesters: [], activeSemesterId: null }),
    }),
    {
      name: STORAGE_NAME,
      version: 2, // Bump version for unified model
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrationReady(true);
      },
      migrate: (persistedState: any, version: number) => {
        if (version === 1) {
          // Migration from old v1 (split subjects/semesters) to v2 (unified)
          const oldState = persistedState as { subjects: any[]; semesters: any[] };
          const migratedSemesters = [...(oldState.semesters || [])];

          // If there were orphan subjects in the old SGPA tool, move them to a "Legacy" semester
          if (oldState.subjects && oldState.subjects.length > 0) {
            migratedSemesters.push({
              id: 'legacy-import',
              name: 'Imported Semester',
              subjects: oldState.subjects,
              sgpa: calculateSGPA(oldState.subjects),
              credits: oldState.subjects.reduce((s, sub) => s + (Number(sub.credits) || 0), 0),
            });
          }
          return { ...oldState, semesters: migratedSemesters, activeSemesterId: null };
        }
        return persistedState;
      },
    },
  ),
);
