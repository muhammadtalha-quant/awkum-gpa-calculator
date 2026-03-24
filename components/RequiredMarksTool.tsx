import React, { useState } from 'react';
import { calculateRequiredMarks } from '../src/domain/gpa/engine';

interface Props {
    subjects: any[];
    theme?: any;
}

const RequiredMarksTool: React.FC<Props> = ({ subjects }) => {
    const [targetSGPA, setTargetSGPA] = useState<string>('');
    const [result, setResult] = useState<number | null | 'IMPOSSIBLE' | 'ACHIEVED'>(null);

    const handleCalculate = () => {
        const target = parseFloat(targetSGPA);
        if (isNaN(target) || target < 0 || target > 4.0) return;

        const filledSubjects = subjects.filter(s => s.marks !== '');
        const remainingSubjects = subjects.filter(s => s.marks === '');

        const filledWeightedGP = filledSubjects.reduce((sum, s) => sum + (Number(s.gradePoint) * Number(s.credits)), 0);
        const totalCredits = subjects.reduce((sum, s) => sum + Number(s.credits), 0);
        const remainingCredits = remainingSubjects.reduce((sum, s) => sum + Number(s.credits), 0);

        const required = calculateRequiredMarks(filledWeightedGP, totalCredits, remainingCredits, target);
        setResult(required);
    };

    const remainingCount = subjects.filter(s => s.marks === '').length;

    // ... (JSX reflects this in previous edit style)

    return (
        <div className="animate-in zoom-in-95">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-[#fafafa] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a78bfa] text-[18px]">assignment</span>
                Required Marks Predictor
            </h3>

            {remainingCount > 0 ? (
                <>
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold opacity-50 uppercase mb-1">Target SGPA</label>
                            <input
                                type="text"
                                placeholder="e.g. 3.50"
                                value={targetSGPA}
                                onChange={e => setTargetSGPA(e.target.value.replace(/[^0-9.]/g, ''))}
                                className="w-full px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-lg focus:border-[#a78bfa] focus:ring-1 focus:ring-[#a78bfa] outline-none text-sm text-[#fafafa]"
                            />
                        </div>
                        <button
                            onClick={handleCalculate}
                            className="px-6 mt-5 text-xs font-bold uppercase tracking-widest rounded-lg bg-[#a78bfa] text-[#0a0012] hover:opacity-90 transition-all py-2"
                        >
                            Predict
                        </button>
                    </div>

                    {result !== null && (
                        <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/5 animate-in slide-in-from-bottom-2">
                            {result === 'IMPOSSIBLE' ? (
                                <div className="text-center p-2">
                                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Target is Unachievable</p>
                                    <p className="text-[10px] opacity-60 mt-1">This target requires more than 100 marks in remaining subjects.</p>
                                </div>
                            ) : result === 'ACHIEVED' ? (
                                <div className="text-center p-2">
                                    <p className="text-xs font-bold text-green-500 uppercase tracking-widest">Goal Already Reached!</p>
                                    <p className="text-[10px] opacity-60 mt-1">Your current performance is already at or above this target.</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-[10px] font-bold opacity-50 uppercase mb-1">Average Marks per Remaining Subject</p>
                                    <h4 className="text-3xl font-black text-[#a78bfa]">{typeof result === 'number' ? result : result}</h4>
                                    <p className="text-[10px] opacity-60 mt-2 italic">
                                        You need to score at least {result} marks in each of your {remainingCount} remaining subjects to reach {parseFloat(targetSGPA).toFixed(2)} SGPA.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {result === null && targetSGPA !== '' && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 animate-in shake">
                            <p className="text-xs font-bold text-red-500 text-center uppercase tracking-widest">
                                Target SGPA is Unachievable
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-4 opacity-50">
                    <p className="text-[10px] font-bold uppercase tracking-widest">All Subject Marks Entered</p>
                    <p className="text-[9px] mt-1">Calculation reflects your current performance.</p>
                </div>
            )}
        </div>
    );
};

export default RequiredMarksTool;
