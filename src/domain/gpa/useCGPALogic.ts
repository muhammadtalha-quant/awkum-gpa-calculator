import { useMemo } from 'react';
import { useAcademicStore } from '../store';
import { calculateCGPA, calculateSGPA } from './engine';
import { SGPASubject, asProgramCredit } from '../types';
import { getLetterFromGP } from '../grading/engine';
import { CGPASemester } from '../types';

export const useCGPALogic = (
  MAX_CREDITS: number = 216,
  MIN_ROOM: number = 12,
  MAX_ROWS: number = 12,
) => {
  const { semesters, addSemester, removeSemester, updateSemester, setSemesters } =
    useAcademicStore();
  const errorMsg = useMemo(() => {
    const total = semesters.reduce(
      (s: number, sem: CGPASemester) => s + (Number(sem.credits) || 0),
      0,
    );
    if (total > MAX_CREDITS) {
      return (
        `Warning: Total program credits (${total}) exceed the ${MAX_CREDITS}-credit limit. ` +
        `Review semester credit assignments.`
      );
    }
    return '';
  }, [semesters, MAX_CREDITS]);

  const cgpaValue = useMemo(
    () => calculateCGPA(semesters.map((s) => ({ sgpa: s.sgpa, credits: s.credits }))),
    [semesters],
  );

  const overallGrade = useMemo(() => getLetterFromGP(cgpaValue), [cgpaValue]);
  const cgpaNum = Number(cgpaValue);

  const totalCredits = useMemo(
    () => semesters.reduce((s, sem) => s + (Number(sem.credits) || 0), 0),
    [semesters],
  );

  const qualityPoints = useMemo(
    () =>
      semesters.reduce(
        (s: number, sem: CGPASemester) => s + Number(sem.sgpa) * Number(sem.credits),
        0,
      ),
    [semesters],
  );

  const handleAddSemester = () => {
    if (semesters.length >= MAX_ROWS || MAX_CREDITS - totalCredits < MIN_ROOM) return;
    addSemester();
  };

  const handleRemoveSemester = (id: string) => {
    if (semesters.length <= 1) setSemesters([]);
    else removeSemester(id);
  };

  const updateSemesterSubjects = (id: string, subjects: SGPASubject[]) => {
    const semGp = calculateSGPA(
      subjects.map((s) => ({ gradePoint: s.gradePoint, credits: s.credits })),
    );
    const semCredits = subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
    updateSemester(id, {
      subjects,
      sgpa: semGp,
      credits: asProgramCredit(Math.min(21, Math.max(0, semCredits))),
    });
  };

  return {
    semesters,
    setSemesters,
    errorMsg,
    cgpaValue,
    cgpaNum,
    overallGrade,
    totalCredits,
    qualityPoints,
    handleAddSemester,
    handleRemoveSemester,
    updateSemester,
    updateSemesterSubjects,
  };
};
