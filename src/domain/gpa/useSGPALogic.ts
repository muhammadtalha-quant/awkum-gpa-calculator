import { useState, useMemo } from 'react';
import { useAcademicStore } from '../store';
import { getLetterFromGP } from '../grading/engine';
import { SGPASubject, asGP } from '../types';

export const useSGPALogic = (MAX_CREDITS: number = 21) => {
  const { semesters, addSemester, addSubject, removeSubject, updateSubject, hydrationReady } =
    useAcademicStore();

  // Use the first semester as the "Quick SGPA" target, or create one if none exist
  const virtualSemester = useMemo(() => {
    if (!hydrationReady) return null;
    return semesters[0] || null;
  }, [semesters, hydrationReady]);

  const subjects = useMemo(() => virtualSemester?.subjects || [], [virtualSemester]);

  const currentCredits = useMemo(
    () => subjects.reduce((s, c) => s + (Number(c.credits) || 0), 0),
    [subjects],
  );

  const errorMsg = useMemo(() => {
    if (currentCredits > MAX_CREDITS) {
      return `Warning: Total credits (${currentCredits}) exceed the standard ${MAX_CREDITS}-credit hour limit.`;
    }
    return '';
  }, [currentCredits, MAX_CREDITS]);

  const sgpaValue = virtualSemester?.sgpa || asGP(0);
  const finalGrade = useMemo(() => getLetterFromGP(sgpaValue), [sgpaValue]);

  const [prevCgpa, setPrevCgpa] = useState('');
  const [prevCredits, setPrevCredits] = useState('');

  const projectedCgpa = useMemo(() => {
    const pc = parseFloat(prevCgpa);
    const ph = parseFloat(prevCredits);
    const sgpaNum = Number(sgpaValue);

    if (!isNaN(pc) && !isNaN(ph) && ph > 0 && currentCredits > 0 && sgpaNum > 0) {
      const totalQP = pc * ph + sgpaNum * currentCredits;
      const totalCr = ph + currentCredits;
      return (totalQP / totalCr).toFixed(2);
    }
    return null;
  }, [prevCgpa, prevCredits, sgpaValue, currentCredits]);

  const handleAddCourse = () => {
    if (currentCredits >= MAX_CREDITS) return;
    if (!virtualSemester) {
      addSemester();
    } else {
      addSubject(virtualSemester.id);
    }
  };

  return {
    subjects,
    virtualSemesterId: virtualSemester?.id,
    errorMsg,
    prevCgpa,
    setPrevCgpa,
    prevCredits,
    setPrevCredits,
    sgpaValue,
    finalGrade,
    projectedCgpa,
    currentCredits,
    addCourse: handleAddCourse,
    updateSubject: (id: string, field: keyof SGPASubject, val: string) => {
      if (!virtualSemester) return;
      const updates: any = { [field]: val };
      if (field === 'credits') updates.credits = parseInt(val) || 0;
      if (field === 'marks') updates.marks = val === '' ? '' : parseInt(val) || 0;
      updateSubject(virtualSemester.id, id, updates);
    },
    removeSubject: (id: string) => virtualSemester && removeSubject(virtualSemester.id, id),
    hydrationReady,
  };
};
