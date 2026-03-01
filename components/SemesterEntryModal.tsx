import React, { useState, useEffect } from 'react';
import { GradePoint, Credit, asGP, asCredit } from '../src/domain/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { sgpa: GradePoint, credits: Credit }) => void;
    initialData?: { sgpa: GradePoint, credits: Credit, name: string };
    theme: any;
}

const SemesterEntryModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData, theme }) => {
    const [sgpa, setSgpa] = useState(initialData?.sgpa?.toString() || '');
    const [credits, setCredits] = useState(initialData?.credits?.toString() || '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSgpa(initialData?.sgpa?.toString() || '');
            setCredits(initialData?.credits?.toString() || '');
            setError('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSave = () => {
        const numSgpa = parseFloat(sgpa);
        const numCredits = parseInt(credits);

        if (isNaN(numSgpa) || numSgpa < 0 || numSgpa > 4.0 || isNaN(numCredits) || numCredits < 12 || numCredits > 21) {
            return;
        }

        onSubmit({
            sgpa: asGP(Number(numSgpa.toFixed(2))),
            credits: asCredit(numCredits)
        });
        onClose();
    };

    const numSgpa = parseFloat(sgpa);
    const numCredits = parseInt(credits);
    const isSgpaInvalid = sgpa !== '' && (isNaN(numSgpa) || numSgpa < 0 || numSgpa > 4.0);
    const isCreditsInvalid = credits !== '' && (isNaN(numCredits) || numCredits < 12 || numCredits > 21);
    const isFormValid = sgpa !== '' && credits !== '' && !isSgpaInvalid && !isCreditsInvalid;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`${theme.card} w-full max-w-sm rounded-[2.5rem] p-10 border ${theme.border} shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200`}>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-widest opacity-80">
                            {initialData?.name || 'Edit Semester'}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">Academic Entry</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-black/5 rounded-2xl transition-all active:scale-90">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Obtained SGPA</label>
                            {isSgpaInvalid && <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter animate-in fade-in slide-in-from-right-2">Out of Range (0-4)</span>}
                        </div>
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={sgpa}
                            onChange={(e) => setSgpa(e.target.value)}
                            className={`w-full px-6 py-4 bg-transparent border-2 rounded-2xl outline-none transition-all text-center text-2xl font-black ${isSgpaInvalid ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : sgpa !== '' ? 'border-blue-500/50' : theme.border} focus:ring-4 focus:ring-blue-500/10`}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Credit Hours</label>
                            {isCreditsInvalid && <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter animate-in fade-in slide-in-from-right-2">Range: 12-21</span>}
                        </div>
                        <input
                            type="number"
                            min="12"
                            max="21"
                            value={credits}
                            onChange={(e) => setCredits(e.target.value)}
                            className={`w-full px-6 py-4 bg-transparent border-2 rounded-2xl outline-none transition-all text-center text-2xl font-black ${isCreditsInvalid ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : credits !== '' ? 'border-blue-500/50' : theme.border} focus:ring-4 focus:ring-blue-500/10`}
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!isFormValid}
                        className={`w-full py-5 mt-6 ${theme.primary} text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed`}
                    >
                        Update Semester
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SemesterEntryModal;
