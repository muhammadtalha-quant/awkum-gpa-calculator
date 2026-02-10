import React, { useEffect } from 'react';
import { SGPASubject } from '../types';
import { calculateGradePoint, getLetterFromGP } from '../utils/gradingLogic';
import { isValidCourseCode } from '../utils/validation';

interface Props {
    semesterId: string;
    subjects: SGPASubject[];
    onUpdate: (semesterId: string, updatedSubjects: SGPASubject[]) => void;
    theme: any;
}



const SemesterSubjectTable: React.FC<Props> = ({ semesterId, subjects, onUpdate, theme }) => {

    const MAX_CREDITS_PER_SEM = 21;
    const MAX_ROWS = 7;

    // Credit Hour Pruning logic
    useEffect(() => {
        const totalCredits = subjects.reduce((sum, s) => sum + (parseInt(s.credits.toString()) || 0), 0);
        if (totalCredits > MAX_CREDITS_PER_SEM) {
            let current = [...subjects];
            // Remove subjects from the end until we are within limits
            while (current.reduce((sum, s) => sum + (parseInt(s.credits.toString()) || 0), 0) > MAX_CREDITS_PER_SEM && current.length > 1) {
                current.pop();
            }
            // Only update if we actually removed something to avoid infinite loops if logic is slightly off
            if (current.length < subjects.length) {
                onUpdate(semesterId, current);
            }
        }
    }, [subjects, semesterId]);

    const addRow = () => {
        const currentTotalCredits = subjects.reduce((sum, s) => sum + (parseInt(s.credits.toString()) || 0), 0);
        // Ensure there is room for at least 3 credits (default new subject credits)
        if (subjects.length >= MAX_ROWS || (MAX_CREDITS_PER_SEM - currentTotalCredits) < 3) return;

        // Create new subject
        const newSubject: SGPASubject = {
            id: (Date.now() + Math.random()).toString(),
            name: '',
            code: '',
            credits: 3,
            marks: '',
            gradePoint: 0,
            gradeLetter: 'F',
            isLocked: false // Keeping for type compatibility, but effective no-op
        };

        onUpdate(semesterId, [...subjects, newSubject]);
    };

    const removeRow = (subjectId: string) => {
        if (subjects.length <= 1) return; // Keep at least one row? SGPA tab keeps 1.
        const updated = subjects.filter(s => s.id !== subjectId);
        onUpdate(semesterId, updated);
    };

    const handleInputChange = (subjectId: string, field: keyof SGPASubject, value: string) => {
        const updatedSubjects = subjects.map(s => {
            if (s.id === subjectId) {
                let finalVal = value;

                // Name validation
                if (field === 'name') finalVal = value.replace(/[^A-Za-z\s]/g, '');

                // Code validation
                if (field === 'code') {
                    finalVal = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                    const dashCount = (finalVal.match(/-/g) || []).length;
                    if (dashCount > 1) finalVal = finalVal.substring(0, finalVal.lastIndexOf('-'));
                }

                // Credits validation (0-6)
                if (field === 'credits') {
                    let num = parseInt(value.replace(/\D/g, ''));
                    if (isNaN(num)) finalVal = '';
                    else { if (num > 6) num = 6; finalVal = num.toString(); }
                }

                // Marks validation (0-100)
                if (field === 'marks') {
                    let num = parseInt(value.replace(/\D/g, ''));
                    if (isNaN(num)) finalVal = '';
                    else { if (num > 100) num = 100; finalVal = num.toString(); }
                }

                const updated = { ...s, [field]: finalVal };

                // Calculate Grade Point automatically if marks change
                if (field === 'marks' && finalVal !== '') {
                    const marks = parseInt(finalVal);
                    const gp = calculateGradePoint(marks);
                    updated.gradePoint = gp;
                    updated.gradeLetter = getLetterFromGP(gp);
                } else if (field === 'marks' && finalVal === '') {
                    updated.gradePoint = 0;
                    updated.gradeLetter = 'F';
                }

                return updated;
            }
            return s;
        });
        onUpdate(semesterId, updatedSubjects);
    };

    const handleBlur = (subjectId: string, field: keyof SGPASubject, value: string) => {
        if (field === 'credits') {
            const num = parseInt(value);
            if (isNaN(num) || num < 1) { // 1 or 2 as min? SGPA says 2. Let's use 2 to match SGPA.
                // Actually SGPA Calculator has "if (isNaN(num) || num < 2) handleInputChange(id, 'credits', '2');"
                // I should stick to that.
                handleInputChange(subjectId, 'credits', '2');
            }
        }
    };

    return (
        <div className="w-full overflow-x-auto bg-black/5 rounded-xl p-4 mb-4 border border-white/5">
            <table className="w-full text-left min-w-[600px] border-collapse">
                <thead>
                    <tr className="border-b border-white/10">
                        <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider w-[25%] opacity-70">Subject</th>
                        <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider w-[20%] opacity-70">Code</th>
                        <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider w-[10%] text-center opacity-70">Credits</th>
                        <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider w-[10%] text-center opacity-70">Marks</th>
                        <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider w-[15%] text-center opacity-70">Grade Point</th>
                        <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider w-[10%] text-center opacity-70">Grade</th>
                        <th className="px-4 py-2 w-[10%]"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/5">
                    {subjects.map((sub) => (
                        <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-2">
                                <input
                                    type="text"
                                    placeholder="Subject Name"
                                    value={sub.name}
                                    onChange={(e) => handleInputChange(sub.id, 'name', e.target.value)}
                                    className={`w-full px-2 py-1 bg-transparent border rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none ${theme.border}`}
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input
                                    type="text"
                                    placeholder="Code"
                                    value={sub.code || ''}
                                    onChange={(e) => handleInputChange(sub.id, 'code', e.target.value)}
                                    className={`w-full px-2 py-1 bg-transparent border rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none ${(sub.code && !isValidCourseCode(sub.code)) ? 'border-red-500' : theme.border
                                        }`}
                                />
                            </td>
                            <td className="px-2 py-2">
                                <input
                                    type="text"
                                    placeholder="3"
                                    value={sub.credits}
                                    onChange={(e) => handleInputChange(sub.id, 'credits', e.target.value)}
                                    onBlur={(e) => handleBlur(sub.id, 'credits', e.target.value)}
                                    className={`w-full px-2 py-1 bg-transparent border rounded text-xs text-center focus:ring-1 focus:ring-blue-500 outline-none ${theme.border}`}
                                />
                            </td>
                            <td className="px-2 py-2">
                                <input
                                    type="text"
                                    placeholder="Marks"
                                    value={sub.marks}
                                    onChange={(e) => handleInputChange(sub.id, 'marks', e.target.value)}
                                    className={`w-full px-2 py-1 bg-transparent border rounded text-xs text-center focus:ring-1 focus:ring-blue-500 outline-none ${theme.border}`}
                                />
                            </td>
                            <td className={`px-2 py-2 text-xs font-mono font-semibold text-center ${theme.accent}`}>
                                {sub.gradePoint.toFixed(2)}
                            </td>
                            <td className="px-2 py-2 text-xs font-bold text-center">
                                {sub.gradeLetter}
                            </td>
                            <td className="px-4 py-2 text-right">
                                {subjects.length > 1 && (
                                    <button onClick={() => removeRow(sub.id)} className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors" title="Remove Subject">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-2 flex justify-start">
                <button onClick={addRow} className={`text-[10px] font-bold px-3 py-1 rounded-full border border-dashed ${theme.border} hover:bg-white/5 transition-colors flex items-center gap-1 opacity-60 hover:opacity-100`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Subject
                </button>
            </div>
        </div>
    );
};

export default SemesterSubjectTable;
