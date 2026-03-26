import { useState, useMemo } from 'react';
import { useAcademicStore } from '../store';
import { calculateSGPA } from './engine';
import { getLetterFromGP, calculateGradePoint } from '../grading/engine';
import { SGPASubject, Credit, Mark, GradePoint } from '../types';

export const useSGPALogic = (MAX_CREDITS: number = 21) => {
  const { subjects, setSubjects } = useAcademicStore();
  // Credit limit warning logic
  const errorMsg = useMemo(() => {
    const total = subjects.reduce((s, c) => s + (Number(c.credits) || 0), 0);
    if (total > MAX_CREDITS) {
      return `Warning: Total credits (${total}) exceed the standard ${MAX_CREDITS}-credit hour block limit.`;
    }
    return '';
  }, [subjects, MAX_CREDITS]);

  const sgpaValue = useMemo(
    () => calculateSGPA(subjects.map((s) => ({ gradePoint: s.gradePoint, credits: s.credits }))),
    [subjects],
  );

  const finalGrade = useMemo(() => getLetterFromGP(sgpaValue), [sgpaValue]);

  const currentCredits = useMemo(
    () => subjects.reduce((s, c) => s + (Number(c.credits) || 0), 0),
    [subjects],
  );

  const [prevCgpa, setPrevCgpa] = useState('');
  const [prevCredits, setPrevCredits] = useState('');

  const projectedCgpa = useMemo(() => {
    const pc = parseFloat(prevCgpa);
    const ph = parseFloat(prevCredits);
    const sgpaNum = Number(sgpaValue);

    if (!isNaN(pc) && !isNaN(ph) && ph > 0 && currentCredits > 0 && sgpaNum > 0) {
      return ((pc * ph + sgpaNum * currentCredits) / (ph + currentCredits)).toFixed(2);
    }
    return null;
  }, [prevCgpa, prevCredits, sgpaValue, currentCredits]);

  const addCourse = () => {
    const currentTotal = subjects.reduce((s, c) => s + (Number(c.credits) || 0), 0);
    if (currentTotal + 3 > MAX_CREDITS && currentTotal > 0) {
      return;
    }
    const newSub: SGPASubject = {
      id: crypto.randomUUID(),
      name: '',
      code: '',
      credits: 3 as Credit,
      marks: '' as unknown as Mark,
      gradePoint: 0 as GradePoint,
      gradeLetter: 'F',
    };
    setSubjects([...subjects, newSub]);
  };

  const updateSubject = (id: string, field: keyof SGPASubject, raw: string) => {
    setSubjects(
      subjects.map((s: SGPASubject) => {
        if (s.id !== id) return s;
        if (field === 'name') return { ...s, name: raw };
        if (field === 'credits') {
          const v = parseInt(raw);
          return { ...s, credits: (isNaN(v) ? s.credits : v) as Credit };
        }
        if (field === 'marks') {
          if (raw === '')
            return {
              ...s,
              marks: '' as unknown as Mark,
              gradePoint: 0 as GradePoint,
              gradeLetter: 'F',
            };
          const v = parseInt(raw);
          if (isNaN(v) || v < 0 || v > 100) return s;
          const gp = calculateGradePoint(v as Mark);
          return { ...s, marks: v as Mark, gradePoint: gp, gradeLetter: getLetterFromGP(gp) };
        }
        return s;
      }),
    );
  };

  const removeSubject = (id: string) =>
    setSubjects(subjects.filter((s: SGPASubject) => s.id !== id));

  return {
    subjects,
    setSubjects,
    errorMsg,
    prevCgpa,
    setPrevCgpa,
    prevCredits,
    setPrevCredits,
    sgpaValue,
    finalGrade,
    projectedCgpa,
    currentCredits,
    addCourse,
    updateSubject,
    removeSubject,
  };
};
