/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo } from 'react';
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
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const total = semesters.reduce(
      (s: number, sem: CGPASemester) => s + (Number(sem.credits) || 0),
      0,
    );
    if (total > MAX_CREDITS) {
      const copy = [...semesters];
      while (
        copy.reduce((s: number, sem: CGPASemester) => s + (Number(sem.credits) || 0), 0) >
          MAX_CREDITS &&
        copy.length > 1
      )
        copy.pop();
      setSemesters(copy);
      setErrorMsg('Adjusted semesters to maintain global credit limit.');
    }
  }, [semesters, setSemesters, MAX_CREDITS]);

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
    setErrorMsg('');
    addSemester();
  };

  const handleRemoveSemester = (id: string) => {
    setErrorMsg('');
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
    setErrorMsg,
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
