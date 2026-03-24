import React, { useState, useMemo } from 'react';
import { parseMISText, ParsedSubject } from '../src/core/misParser';
import { calculateGradePoint } from '../src/domain/grading/engine';
import { getLetterFromGP } from '../src/domain/grading/engine';
import { SGPASubject, Credit, Mark } from '../src/domain/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onImport: (subjects: SGPASubject[]) => void;
    existingSubjectCodes: string[];
    theme?: any;
}

type Step = 'paste' | 'credits' | 'confirm';

interface SubjectDraft extends ParsedSubject {
    credits: number;
    isDuplicate: boolean;
}

const DEFAULT_CREDITS = 3;

const MISParserModal: React.FC<Props> = ({ isOpen, onClose, onImport, existingSubjectCodes }) => {
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            {/* Sheet on mobile, centered modal on tablet+ */}
            <div className="w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-t-xl sm:rounded-xl border-t sm:border border-[#27272a] bg-[#121215] shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-10 py-5 sm:py-7 border-b border-[#27272a] flex-shrink-0">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-1">MIS Bulk Importer</h2>
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
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
                    <button onClick={handleClose} className="p-3 rounded-2xl hover:bg-black/10 transition-colors opacity-40 hover:opacity-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8">

                    {/* ── Step 1: Paste ── */}
                    {step === 'paste' && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-relaxed">
                                Open your AWKUM MIS → Result → select all text on the page → paste below.
                            </p>
                            <textarea
                                autoFocus
                                value={rawText}
                                onChange={e => setRawText(e.target.value)}
                                rows={9}
                                placeholder={"Paste your MIS result page text here...\n\nExample:\n1  Introduction To Management (SS-306)  Mr. Haider Zaman\n21\n20\n35\n76\n-"}
                                className="w-full px-4 sm:px-6 py-4 sm:py-5 rounded-lg border border-[#27272a] bg-[#18181b] text-sm font-mono resize-none outline-none focus:border-[#a78bfa] transition-all placeholder:opacity-20 text-[#fafafa]"
                            />
                            {rawText.length > 0 && (
                                <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg border border-[#27272a] bg-[#18181b]">
                                    <span className={`text-2xl font-black ${detected.length > 0 ? 'text-blue-500' : 'text-red-500'}`}>{detected.length}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
                                        {detected.length === 1 ? 'Subject Detected' : 'Subjects Detected'}
                                    </span>
                                    {detected.length === 0 && (
                                        <span className="text-[9px] text-red-500">— No course codes found</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Step 2: Credits ── */}
                    {step === 'credits' && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                            <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-[#27272a] bg-[#a78bfa]/5">
                                <label className="text-[9px] font-black uppercase tracking-widest opacity-50 flex-1 min-w-[8rem]">
                                    Set all subjects to:
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map(cr => (
                                        <button
                                            key={cr}
                                            onClick={() => applyGlobalCredits(cr)}
                                            className={`w-10 h-10 rounded-lg font-black text-sm border transition-all ${globalCredits === cr ? 'bg-[#a78bfa] text-[#0a0012] border-[#a78bfa]' : 'border-[#27272a] hover:bg-[#18181b] text-[#fafafa]'}`}
                                        >
                                            {cr}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                {drafts.map(d => (
                                    <div key={d.code} className={`flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg border border-[#27272a] bg-[#18181b] ${d.isDuplicate ? 'border-[#f2a100]/30' : ''}`}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">{d.code}</span>
                                                {d.isDuplicate && <span className="text-[8px] font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">EXISTS</span>}
                                            </div>
                                            <p className="text-xs font-bold truncate">{d.name}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-[9px] opacity-40 font-black hidden sm:block">{d.marks} marks</span>
                                            <div className="flex items-center border border-[#27272a] rounded-lg overflow-hidden">
                                                {[1, 2, 3, 4].map(cr => (
                                                    <button
                                                        key={cr}
                                                        onClick={() => updateCredit(d.code, cr)}
                                                        className={`w-8 h-8 font-black text-xs transition-all ${d.credits === cr ? 'bg-[#a78bfa] text-[#0a0012]' : 'hover:bg-[#27272a] text-[#71717a]'}`}
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
                                        <div key={d.code} className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg border border-[#27272a] bg-[#18181b]">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <span className="text-[9px] font-black text-blue-500 flex-shrink-0">{d.code}</span>
                                                <span className="text-xs font-bold truncate">{d.name}</span>
                                                {d.isDuplicate && <span className="text-[8px] font-black text-orange-500 flex-shrink-0">↩ UPDATE</span>}
                                            </div>
                                            <div className="flex items-center gap-2 sm:gap-4 opacity-70 flex-shrink-0">
                                                <span className="text-[9px] font-black">{d.credits}Cr</span>
                                                <span className="text-[9px] font-black hidden sm:block">{d.marks} marks</span>
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
                <div className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 border-t border-[#27272a] flex-shrink-0">
                    <button
                        onClick={() => step === 'paste' ? handleClose() : setStep(step === 'confirm' ? 'credits' : 'paste')}
                        className="px-4 sm:px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-80 transition-all"
                    >
                        {step === 'paste' ? 'Cancel' : '← Back'}
                    </button>
                    {step === 'paste' && (
                        <button
                            disabled={detected.length === 0}
                            onClick={() => toStep('credits')}
                            className={`px-5 sm:px-8 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${detected.length > 0 ? 'bg-[#a78bfa] text-[#0a0012] hover:opacity-90 shadow-lg' : 'opacity-20 cursor-not-allowed bg-[#27272a] text-[#52525b]'}`}
                        >
                            Next: Credits →
                        </button>
                    )}
                    {step === 'credits' && (
                        <button
                            onClick={() => toStep('confirm')}
                            className="px-5 sm:px-8 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#a78bfa] text-[#0a0012] hover:opacity-90 shadow-lg transition-all"
                        >
                            Next: Review →
                        </button>
                    )}
                    {step === 'confirm' && (
                        <button
                            onClick={handleImport}
                            className="px-5 sm:px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-green-600 text-white hover:bg-green-500 shadow-lg transition-all"
                        >
                            ✓ Import {drafts.length}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MISParserModal;
