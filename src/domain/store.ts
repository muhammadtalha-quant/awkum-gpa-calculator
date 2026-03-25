import { create } from 'zustand';
import {
  SGPASubject,
  CGPASemester,
  GradePoint,
  Credit,
  Mark,
  asMark,
  asCredit,
  asGP,
} from '../domain/types';
import { calculateGradePoint, getLetterFromGP } from '../domain/grading/engine';
import { calculateSGPA, calculateCGPA } from '../domain/gpa/engine';

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

export const useAcademicStore = create<AcademicState>((set) => ({
  subjects: [],
  semesters: [],
  projectionMode: 'current',
  futureCredits: 0,

  setProjectionMode: (mode) => set({ projectionMode: mode }),
  setFutureCredits: (credits) => set({ futureCredits: credits }),

  setSubjects: (subjects) => set({ subjects }),

  updateSubject: (id, updates) =>
    set((state) => {
      const newSubjects = state.subjects.map((s) => {
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
    set((state) => ({
      subjects: [
        ...state.subjects,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: '',
          credits: 3 as Credit,
          marks: '' as Mark | '',
          gradePoint: 0 as GradePoint,
          gradeLetter: 'F',
        },
      ],
    })),

  removeSubject: (id) =>
    set((state) => ({
      subjects: state.subjects.filter((s) => s.id !== id),
    })),

  setSemesters: (semesters) => set({ semesters }),

  updateSemester: (id, updates) =>
    set((state) => ({
      semesters: state.semesters.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  updateSemesterSubject: (semesterId, subjectId, updates) =>
    set((state) => {
      const nextSemesters = state.semesters.map((sem) => {
        if (sem.id === semesterId) {
          const nextSubjects = (sem.subjects || []).map((sub) => {
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
            nextSubjects.map((s) => ({ gradePoint: s.gradePoint, credits: s.credits })),
          );
          const semCredits = nextSubjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);

          return {
            ...sem,
            subjects: nextSubjects,
            sgpa: semGp,
            credits: asCredit(Math.min(21, Math.max(0, semCredits))),
          };
        }
        return sem;
      });
      return { semesters: nextSemesters };
    }),

  addSemester: () =>
    set((state) => ({
      semesters: [
        ...state.semesters,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: `Semester ${state.semesters.length + 1}`,
          sgpa: 0 as GradePoint,
          credits: 15 as Credit,
          subjects: [],
        },
      ],
    })),

  removeSemester: (id) =>
    set((state) => ({
      semesters: state.semesters
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, name: `Semester ${idx + 1}` })),
    })),
}));
