import { useMemo } from 'react';
import { useAcademicStore } from '../store';
import { GradePoint, Credit } from '../types';
import { calculateCGPA } from './engine';
import { getLetterFromGP } from '../grading/engine';

export const useCGPALogic = (
  MAX_CREDITS: number = 216,
  MIN_ROOM: number = 12,
  MAX_ROWS: number = 12,
) => {
  const { semesters, addSemester, removeSemester, updateSemester, updateSubject, hydrationReady } =
    useAcademicStore();

  const totalCredits = useMemo(
    () => semesters.reduce((s, sem) => s + (Number(sem.credits) || 0), 0),
    [semesters],
  );

  const errorMsg = useMemo(() => {
    if (totalCredits > MAX_CREDITS) {
      return `Warning: Total program credits (${totalCredits}) exceed the ${MAX_CREDITS}-limit.`;
    }
    return '';
  }, [totalCredits, MAX_CREDITS]);

  const cgpaValue = useMemo(
    () =>
      calculateCGPA(
        semesters.map((s) => ({
          sgpa: (s.sgpa === '' ? 0 : s.sgpa) as GradePoint,
          credits: (s.credits === '' ? 0 : s.credits) as Credit,
        })),
      ),
    [semesters],
  );

  const qualityPoints = useMemo(
    () => semesters.reduce((s, sem) => s + (Number(sem.sgpa) || 0) * (Number(sem.credits) || 0), 0),
    [semesters],
  );

  const overallGrade = useMemo(() => getLetterFromGP(cgpaValue), [cgpaValue]);
  const cgpaNum = Number(cgpaValue);

  const handleAddSemester = () => {
    if (semesters.length >= MAX_ROWS || MAX_CREDITS - totalCredits < MIN_ROOM) return;
    addSemester();
  };

  const handleRemoveSemester = (id: string) => {
    removeSemester(id);
  };

  return {
    semesters,
    errorMsg,
    cgpaValue,
    cgpaNum,
    overallGrade,
    totalCredits,
    qualityPoints,
    handleAddSemester,
    handleRemoveSemester,
    updateSemester,
    updateSubject,
    hydrationReady,
  };
};
