import React, { useState, useEffect } from 'react';
import { SGPASubject, Mark, Credit, asMark, asCredit } from '../src/domain/types';
import { calculateGradePoint, getLetterFromGP } from '../src/domain/grading/engine';
import { isValidCourseCode, sanitizeSubjectName } from '../src/core/validation';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (subject: Partial<SGPASubject>) => void;
    initialData?: Partial<SGPASubject>;
    theme?: any;
    enableCodes: boolean;
}

const SubjectEntryModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData, enableCodes }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [code, setCode] = useState(initialData?.code || '');
    const [credits, setCredits] = useState(initialData?.credits?.toString() || '3');
    const [marks, setMarks] = useState(initialData?.marks?.toString() || '');

    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || '');
            setCode(initialData?.code || '');
            setCredits(initialData?.credits?.toString() || '3');
            setMarks(initialData?.marks?.toString() || '');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const numCredits = parseInt(credits);
    const numMarks = marks === '' ? -1 : parseInt(marks);
    const isNameInvalid = name !== '' && !name.trim();
    const isCodeInvalid = enableCodes && code !== '' && !isValidCourseCode(code);
    const isCreditsInvalid = credits !== '' && (isNaN(numCredits) || numCredits < 2 || numCredits > 6);
    const isMarksInvalid = marks !== '' && (isNaN(numMarks) || numMarks < 0 || numMarks > 100);
    const isFormValid = name.trim() && (!enableCodes || (code && isValidCourseCode(code))) && !isCreditsInvalid && !isMarksInvalid && credits !== '' && marks !== '';

    const handleSave = () => {
        if (!isFormValid) return;
        const gp = calculateGradePoint(asMark(numMarks));
        onSubmit({
            name: sanitizeSubjectName(name),
            code: enableCodes ? code.toUpperCase() : '',
            credits: asCredit(numCredits),
            marks: asMark(numMarks),
            gradePoint: gp,
            gradeLetter: getLetterFromGP(gp)
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#121215] w-full max-w-md rounded-xl p-8 border border-[#27272a] shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-[#fafafa]">
                            {initialData?.id ? 'Edit Subject' : 'Add New Subject'}
                        </h3>
                        <p className="text-xs text-[#71717a] mt-0.5 uppercase tracking-widest">Course Entry</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#27272a] rounded-lg transition-all text-[#71717a] hover:text-[#fafafa]">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-[#71717a] uppercase tracking-wider">Subject Name</label>
                            {isNameInvalid && <span className="text-[10px] font-bold text-[#ef4444] uppercase">Required</span>}
                        </div>
                        <input
                            type="text" placeholder="e.g. Data Structures" value={name} onChange={e => setName(e.target.value)}
                            className={`w-full px-4 py-3 bg-[#18181b] border rounded-lg outline-none text-[#fafafa] font-medium transition-all placeholder:text-[#52525b] ${isNameInvalid ? 'border-[#ef4444]' : 'border-[#27272a] focus:border-[#a78bfa]'}`}
                        />
                    </div>

                    {enableCodes && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-[#71717a] uppercase tracking-wider">Course Code</label>
                                {isCodeInvalid && <span className="text-[10px] font-bold text-[#ef4444] uppercase">Format: CS-123</span>}
                            </div>
                            <input
                                type="text" placeholder="e.g. CS-123" value={code} onChange={e => setCode(e.target.value)}
                                className={`w-full px-4 py-3 bg-[#18181b] border rounded-lg outline-none text-[#fafafa] font-mono font-medium tracking-widest transition-all placeholder:text-[#52525b] ${isCodeInvalid ? 'border-[#ef4444]' : 'border-[#27272a] focus:border-[#a78bfa]'}`}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-[#71717a] uppercase tracking-wider">Credit Hours</label>
                                {isCreditsInvalid && <span className="text-[10px] font-bold text-[#ef4444]">2-6</span>}
                            </div>
                            <input
                                type="number" min="2" max="6" value={credits} onChange={e => setCredits(e.target.value)}
                                className={`w-full px-4 py-3 bg-[#18181b] border rounded-lg outline-none text-center text-xl font-black text-[#fafafa] transition-all ${isCreditsInvalid ? 'border-[#ef4444]' : 'border-[#27272a] focus:border-[#a78bfa]'}`}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-[#71717a] uppercase tracking-wider">Marks</label>
                                {isMarksInvalid && <span className="text-[10px] font-bold text-[#ef4444]">0-100</span>}
                            </div>
                            <input
                                type="number" min="0" max="100" value={marks} onChange={e => setMarks(e.target.value)} placeholder="0-100"
                                className={`w-full px-4 py-3 bg-[#18181b] border rounded-lg outline-none text-center text-xl font-black text-[#fafafa] transition-all placeholder:text-[#52525b] ${isMarksInvalid ? 'border-[#ef4444]' : 'border-[#27272a] focus:border-[#a78bfa]'}`}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSave} disabled={!isFormValid}
                        className="w-full py-4 mt-2 bg-[#a78bfa] text-[#0a0012] font-bold uppercase tracking-wider rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Save Subject
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubjectEntryModal;
