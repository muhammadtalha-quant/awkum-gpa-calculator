import { useState, useEffect, useMemo } from 'react';
import { useAcademicStore } from '../store';
import { calculateSGPA } from './engine';
import { getLetterFromGP, calculateGradePoint } from '../grading/engine';
import { SGPASubject, Credit, Mark, GradePoint } from '../types';

export const useSGPALogic = (MAX_CREDITS: number = 21) => {
    const { subjects, setSubjects } = useAcademicStore();
    const [errorMsg, setErrorMsg] = useState('');
    const [prevCgpa, setPrevCgpa] = useState('');
    const [prevCredits, setPrevCredits] = useState('');

    // Credit pruning logic
    useEffect(() => {
        const total = subjects.reduce((s, c) => s + (Number(c.credits) || 0), 0);
        if (total > MAX_CREDITS) {
            const copy = [...subjects];
            while (
                copy.reduce((s, c) => s + (Number(c.credits) || 0), 0) > MAX_CREDITS &&
                copy.length > 1
            )
            copy.pop();
            setSubjects(copy);
            setErrorMsg(`Automatically adjusted subjects to maintain the ${MAX_CREDITS}-credit hour limit.`);
        }
    }, [subjects, setSubjects, MAX_CREDITS]);

    const sgpaValue = useMemo(() => 
        calculateSGPA(subjects.map((s) => ({ gradePoint: s.gradePoint, credits: s.credits }))),
        [subjects]
    );

    const finalGrade = useMemo(() => getLetterFromGP(sgpaValue), [sgpaValue]);

    const currentCredits = useMemo(() => subjects.reduce((s, c) => s + (Number(c.credits) || 0), 0), [subjects]);

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
        const newSub: SGPASubject = {
            id: (Date.now() + Math.random()).toString(),
            name: '',
            code: '',
            credits: 3 as Credit,
            marks: '' as unknown as Mark,
            gradePoint: 0 as GradePoint,
            gradeLetter: 'F',
        };
        setSubjects([...subjects, newSub]);
        setErrorMsg('');
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
            })
        );
    };

    const removeSubject = (id: string) => setSubjects(subjects.filter((s: SGPASubject) => s.id !== id));

    return {
        subjects,
        setSubjects,
        errorMsg,
        setErrorMsg,
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
