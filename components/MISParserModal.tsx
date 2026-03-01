import React, { useState, useMemo } from 'react';
import { parseMISText, ParsedSubject } from '../src/core/misParser';
import { calculateGradePoint } from '../src/domain/grading/engine';
import { getLetterFromGP } from '../src/domain/grading/engine';
import { SGPASubject, Credit, Mark, GradePoint, asGP } from '../src/domain/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onImport: (subjects: SGPASubject[]) => void;
    existingSubjectCodes: string[];
    theme: any;
}

type Step = 'paste' | 'credits' | 'confirm';

interface SubjectDraft extends ParsedSubject {
    credits: number;
    isDuplicate: boolean;
}

const DEFAULT_CREDITS = 3;

const MISParserModal: React.FC<Props> = ({ isOpen, onClose, onImport, existingSubjectCodes, theme }) => {
    const [step, setStep] = useState<Step>('paste');
    const [rawText, setRawText] = useState('');
    const [drafts, setDrafts] = useState<SubjectDraft[]>([]);
    const [globalCredits, setGlobalCredits] = useState(DEFAULT_CREDITS);

    const detected = useMemo(() => parseMISText(rawText), [rawText]);

    const toStep = (next: Step) => {
        if (next === 'credits') {
            setDrafts(detected.map(sub => ({
                ...sub,
                credits: DEFAULT_CREDITS,
                isDuplicate: existingSubjectCodes.includes(sub.code)
            })));
            setGlobalCredits(DEFAULT_CREDITS);
        }
        setStep(next);
    };

    const applyGlobalCredits = (val: number) => {
        setGlobalCredits(val);
        setDrafts(prev => prev.map(d => ({ ...d, credits: val })));
    };

    const updateCredit = (code: string, credits: number) => {
        setDrafts(prev => prev.map(d => d.code === code ? { ...d, credits } : d));
    };

    const handleImport = () => {
        const subjects: SGPASubject[] = drafts.map(d => {
            const gp = calculateGradePoint(d.marks as Mark);
            return {
                id: Date.now().toString(36) + Math.random().toString(36).slice(2),
                name: d.name,
                code: d.code,
                credits: d.credits as Credit,
                marks: d.marks as Mark,
                gradePoint: gp,
                gradeLetter: getLetterFromGP(gp)
            };
        });
        onImport(subjects);
        handleClose();
    };

    const handleClose = () => {
        setStep('paste');
        setRawText('');
        setDrafts([]);
        onClose();
    };

    if (!isOpen) return null;

    const stepNum = step === 'paste' ? 1 : step === 'credits' ? 2 : 3;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[2.5rem] border ${theme.border} bg-gray-950 shadow-2xl overflow-hidden`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-10 py-7 border-b ${theme.border} flex-shrink-0`}>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-1">MIS Bulk Importer</h2>
                        <div className="flex items-center gap-3">
                            {['Paste', 'Credits', 'Confirm'].map((label, i) => (
                                <React.Fragment key={label}>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${i + 1 === stepNum ? 'text-blue-500' : 'opacity-30'}`}>
                                        {i + 1}. {label}
                                    </span>
                                    {i < 2 && <span className="opacity-20 text-[9px]">›</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-3 rounded-2xl hover:bg-white/5 transition-colors opacity-40 hover:opacity-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-10">

                    {/* ── Step 1: Paste ── */}
                    {step === 'paste' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-relaxed">
                                Open your AWKUM MIS → Result → select all text on the page → paste below.
                            </p>
                            <textarea
                                autoFocus
                                value={rawText}
                                onChange={e => setRawText(e.target.value)}
                                rows={12}
                                placeholder={"Paste your MIS result page text here...\n\nExample (copy all text from your MIS page):\n1  Introduction To Management (SS-306)  Mr. Haider Zaman\n21\n20\n35\n76\n-\n2  Programming Fundamental (CS-113)  Dr. Asif Rahim\n30\n18\n43\n91\n-"}
                                className={`w-full px-6 py-5 rounded-2xl border ${theme.border} bg-black/20 text-sm font-mono resize-none outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:opacity-20`}
                            />
                            {rawText.length > 0 && (
                                <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${theme.border} bg-black/10`}>
                                    <span className={`text-2xl font-black ${detected.length > 0 ? 'text-blue-500' : 'text-red-500'}`}>{detected.length}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
                                        {detected.length === 1 ? 'Subject Detected' : 'Subjects Detected'}
                                    </span>
                                    {detected.length === 0 && (
                                        <span className="text-[9px] text-red-500 ml-2">— No matching course codes found</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Step 2: Credits ── */}
                    {step === 'credits' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className={`flex items-center gap-4 p-5 rounded-2xl border ${theme.border} bg-blue-500/5`}>
                                <label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex-1">
                                    Set all subjects to:
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map(cr => (
                                        <button
                                            key={cr}
                                            onClick={() => applyGlobalCredits(cr)}
                                            className={`w-10 h-10 rounded-xl font-black text-sm border transition-all ${globalCredits === cr ? 'bg-blue-500 text-white border-blue-500' : `${theme.border} hover:bg-white/5`}`}
                                        >
                                            {cr}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                {drafts.map(d => (
                                    <div key={d.code} className={`flex items-center gap-4 px-5 py-4 rounded-xl border ${theme.border} bg-black/10 ${d.isDuplicate ? 'border-orange-500/30' : ''}`}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">{d.code}</span>
                                                {d.isDuplicate && <span className="text-[8px] font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">EXISTS</span>}
                                            </div>
                                            <p className="text-xs font-bold truncate">{d.name}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] opacity-40 font-black">{d.marks} marks</span>
                                            <div className={`flex items-center gap-1 border ${theme.border} rounded-xl overflow-hidden`}>
                                                {[1, 2, 3, 4].map(cr => (
                                                    <button
                                                        key={cr}
                                                        onClick={() => updateCredit(d.code, cr)}
                                                        className={`w-8 h-8 font-black text-xs transition-all ${d.credits === cr ? 'bg-blue-500 text-white' : 'hover:bg-white/5'}`}
                                                    >
                                                        {cr}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Confirm ── */}
                    {step === 'confirm' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                                Review before importing {drafts.length} subject{drafts.length !== 1 ? 's' : ''}:
                            </p>
                            <div className="space-y-2">
                                {drafts.map(d => {
                                    const gp = calculateGradePoint(d.marks as Mark);
                                    const letter = getLetterFromGP(gp);
                                    return (
                                        <div key={d.code} className={`flex items-center justify-between px-5 py-3 rounded-xl border ${theme.border} bg-black/10`}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black text-blue-500">{d.code}</span>
                                                <span className="text-xs font-bold">{d.name}</span>
                                                {d.isDuplicate && <span className="text-[8px] font-black text-orange-500">↩ UPDATE</span>}
                                            </div>
                                            <div className="flex items-center gap-4 opacity-70">
                                                <span className="text-[9px] font-black">{d.credits} Cr</span>
                                                <span className="text-[9px] font-black">{d.marks} marks</span>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded ${letter === 'F' ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'}`}>{letter}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`flex justify-between items-center px-10 py-6 border-t ${theme.border} flex-shrink-0`}>
                    <button
                        onClick={() => step === 'paste' ? handleClose() : setStep(step === 'confirm' ? 'credits' : 'paste')}
                        className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-80 transition-all"
                    >
                        {step === 'paste' ? 'Cancel' : '← Back'}
                    </button>
                    {step === 'paste' && (
                        <button
                            disabled={detected.length === 0}
                            onClick={() => toStep('credits')}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${detected.length > 0 ? `${theme.primary} text-white hover:opacity-90 shadow-lg` : 'opacity-20 cursor-not-allowed bg-gray-500 text-white'}`}
                        >
                            Next: Assign Credits →
                        </button>
                    )}
                    {step === 'credits' && (
                        <button
                            onClick={() => toStep('confirm')}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${theme.primary} text-white hover:opacity-90 shadow-lg transition-all`}
                        >
                            Next: Review →
                        </button>
                    )}
                    {step === 'confirm' && (
                        <button
                            onClick={handleImport}
                            className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-green-600 text-white hover:bg-green-500 shadow-lg transition-all"
                        >
                            ✓ Import {drafts.length} Subject{drafts.length !== 1 ? 's' : ''}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MISParserModal;
