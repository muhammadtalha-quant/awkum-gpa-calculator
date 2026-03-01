import React, { useState, useEffect } from 'react';
import { SGPASubject, Mark, Credit, asMark, asCredit } from '../src/domain/types';
import { calculateGradePoint, getLetterFromGP } from '../src/domain/grading/engine';
import { isValidCourseCode, sanitizeSubjectName } from '../src/core/validation';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (subject: Partial<SGPASubject>) => void;
    initialData?: Partial<SGPASubject>;
    theme: any;
    enableCodes: boolean;
}

const SubjectEntryModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData, theme, enableCodes }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [code, setCode] = useState(initialData?.code || '');
    const [credits, setCredits] = useState(initialData?.credits?.toString() || '3');
    const [marks, setMarks] = useState(initialData?.marks?.toString() || '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || '');
            setCode(initialData?.code || '');
            setCredits(initialData?.credits?.toString() || '3');
            setMarks(initialData?.marks?.toString() || '');
            setError('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSave = () => {
        const numCredits = parseInt(credits);
        const numMarks = marks === '' ? -1 : parseInt(marks);

        if (!name.trim() || (enableCodes && (!code || !isValidCourseCode(code))) || isNaN(numCredits) || numCredits < 2 || numCredits > 6 || numMarks < 0 || numMarks > 100) {
            return;
        }

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

    const numCredits = parseInt(credits);
    const numMarks = marks === '' ? -1 : parseInt(marks);
    const isNameInvalid = name !== '' && !name.trim();
    const isCodeInvalid = enableCodes && code !== '' && !isValidCourseCode(code);
    const isCreditsInvalid = credits !== '' && (isNaN(numCredits) || numCredits < 2 || numCredits > 6);
    const isMarksInvalid = marks !== '' && (isNaN(numMarks) || numMarks < 0 || numMarks > 100);

    const isFormValid = name.trim() &&
        (!enableCodes || (code && isValidCourseCode(code))) &&
        !isCreditsInvalid &&
        !isMarksInvalid &&
        credits !== '' &&
        marks !== '';

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`${theme.card} w-full max-w-md rounded-[2.5rem] p-10 border ${theme.border} shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200`}>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-widest opacity-80">
                            {initialData?.id ? 'Edit Subject' : 'Add New Subject'}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">Course Entry</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-black/5 rounded-2xl transition-all active:scale-90">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Subject Name</label>
                            {isNameInvalid && <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter">Required</span>}
                        </div>
                        <input
                            type="text"
                            placeholder="e.g. Data Structures"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full px-5 py-3 bg-transparent border-2 rounded-2xl outline-none transition-all ${isNameInvalid ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : name !== '' ? 'border-blue-500/30' : theme.border} focus:ring-4 focus:ring-blue-500/10 font-bold`}
                        />
                    </div>

                    {enableCodes && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Course Code</label>
                                {isCodeInvalid && <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter">Format: CS-123</span>}
                            </div>
                            <input
                                type="text"
                                placeholder="e.g. CS-123"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className={`w-full px-5 py-3 bg-transparent border-2 rounded-2xl outline-none transition-all ${isCodeInvalid ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : code !== '' ? 'border-blue-500/30' : theme.border} focus:ring-4 focus:ring-blue-500/10 font-mono font-bold tracking-widest`}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Credit Hours</label>
                                {isCreditsInvalid && <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter">2-6</span>}
                            </div>
                            <input
                                type="number"
                                min="2"
                                max="6"
                                value={credits}
                                onChange={(e) => setCredits(e.target.value)}
                                className={`w-full px-5 py-3 bg-transparent border-2 rounded-2xl outline-none transition-all text-center text-xl font-black ${isCreditsInvalid ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : credits !== '' ? 'border-blue-500/30' : theme.border} focus:ring-4 focus:ring-blue-500/10`}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Obtained Marks</label>
                                {isMarksInvalid && <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter">0-100</span>}
                            </div>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={marks}
                                onChange={(e) => setMarks(e.target.value)}
                                className={`w-full px-5 py-3 bg-transparent border-2 rounded-2xl outline-none transition-all text-center text-xl font-black ${isMarksInvalid ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : marks !== '' ? 'border-blue-500/30' : theme.border} focus:ring-4 focus:ring-blue-500/10`}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!isFormValid}
                        className={`w-full py-5 mt-6 ${theme.primary} text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed`}
                    >
                        Save Subject
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubjectEntryModal;
