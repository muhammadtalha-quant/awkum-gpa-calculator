import React, { useState } from 'react';
import { useAcademicStore } from '../src/domain/store';
import { calculateCGPA, distributeRetakeMarks, RetakeDistributionResult } from '../src/domain/gpa/engine';

interface Props {
    theme: any;
}

const RetakeOptimizer: React.FC<Props> = ({ theme }) => {
    const { semesters } = useAcademicStore();

    const currentCGPA = Number(calculateCGPA(semesters.map(s => ({ sgpa: s.sgpa, credits: s.credits }))).toFixed(2));
    const [targetCGPA, setTargetCGPA] = useState<string>(Math.min(4.0, currentCGPA + 0.5).toFixed(2));

    const hasSubjects = semesters.some(s => s.subjects && s.subjects.length > 0);

    if (!hasSubjects) {
        return (
            <div className={`p-10 text-center border-2 border-dashed ${theme.border} rounded-[2.5rem] bg-black/5`}>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 leading-relaxed">
                    Strategy engine requires Subject-wise data.<br />
                    <span className="opacity-60">Switch to Expert Mode and add subjects to optimize your CGPA.</span>
                </p>
            </div>
        );
    }

    const parsedTarget = parseFloat(targetCGPA);
    const isTargetValid = !isNaN(parsedTarget) && parsedTarget > currentCGPA && parsedTarget <= 4.0;

    const result = isTargetValid
        ? distributeRetakeMarks(semesters as any, parsedTarget)
        : null;

    const recommendations: RetakeDistributionResult[] = Array.isArray(result) ? result : [];
    const isTooHigh = result === 'TARGET_TOO_HIGH';
    const isNoEligible = result === 'NO_ELIGIBLE';

    return (
        <div className={`p-8 rounded-[2.5rem] border ${theme.border} bg-white/5 animate-in fade-in duration-700`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] opacity-40 mb-1">Retake Strategy Engine</h3>
                    <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
                        Credit-weighted mark distribution across eligible retakes
                    </p>
                </div>
                <div className={`flex items-center gap-3 bg-black/10 px-5 py-3 rounded-2xl border ${theme.border}`}>
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Target CGPA</label>
                    <input
                        type="number"
                        step="0.01"
                        min={currentCGPA}
                        max="4.00"
                        value={targetCGPA}
                        onChange={e => setTargetCGPA(e.target.value)}
                        className={`w-20 bg-transparent outline-none text-center font-black text-lg ${isTargetValid ? 'text-blue-500' : 'text-red-500'}`}
                    />
                </div>
            </div>

            {/* Current → Target breadcrumb */}
            <div className="flex items-center gap-3 mb-8 opacity-40">
                <span className="text-[9px] font-black uppercase tracking-widest">Current:</span>
                <span className="text-[9px] font-black">{currentCGPA.toFixed(2)}</span>
                {isTargetValid && <>
                    <span className="text-[9px]">→</span>
                    <span className="text-[9px] font-black text-blue-500">{parsedTarget.toFixed(2)}</span>
                </>}
            </div>

            {/* Validation errors */}
            {!isTargetValid && (
                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center mb-6">
                    Enter a target CGPA above {currentCGPA.toFixed(2)} and at most 4.00
                </div>
            )}
            {isTooHigh && (
                <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 text-[10px] font-black uppercase tracking-widest text-center mb-6">
                    Target not reachable — even 4.0 in all eligible subjects isn't enough. Lower your target.
                </div>
            )}
            {isNoEligible && (
                <div className={`p-10 text-center border-2 border-dashed ${theme.border} rounded-[2.5rem] bg-green-500/5`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500/60 leading-relaxed">
                        No eligible retakes found.<br />
                        <span className="opacity-60 normal-case tracking-normal">Subjects with marks ≥ 60 are ineligible under AWKUM policy.</span>
                    </p>
                </div>
            )}

            {/* Distribution table */}
            {recommendations.length > 0 && (
                <>
                    {/* Column headers */}
                    <div className="grid grid-cols-5 gap-2 px-6 mb-3 text-[8px] font-black uppercase tracking-widest opacity-30">
                        <span className="col-span-2">Subject</span>
                        <span className="text-center">Now</span>
                        <span className="text-center">Need</span>
                        <span className="text-center">Jump</span>
                    </div>

                    <div className="space-y-3 mb-8">
                        {recommendations.map((rec, idx) => {
                            const jump = rec.requiredMarks - rec.currentMarks;
                            return (
                                <div
                                    key={rec.subjectId}
                                    className={`grid grid-cols-5 gap-2 items-center p-5 rounded-2xl border ${theme.border} bg-black/10 hover:bg-black/20 transition-all duration-300 ${!rec.feasible ? 'opacity-40' : ''}`}
                                >
                                    {/* Subject info */}
                                    <div className="col-span-2 flex items-center gap-4 min-w-0">
                                        {/* Credit weight bar */}
                                        <div className="relative w-8 h-8 flex-shrink-0">
                                            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                                                <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-10" />
                                                <circle
                                                    cx="16" cy="16" r="12" fill="none" stroke="rgb(59 130 246)" strokeWidth="3"
                                                    strokeDasharray={`${(rec.weightPercent / 100) * 75.4} 75.4`}
                                                />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-blue-500">{rec.weightPercent}%</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-tight truncate">{rec.name}</p>
                                            <p className="text-[8px] opacity-30 font-bold">{rec.credits} Credits</p>
                                        </div>
                                    </div>

                                    {/* Current marks */}
                                    <div className="text-center">
                                        <span className="font-black opacity-40 line-through decoration-red-500/50 text-sm">{rec.currentMarks}</span>
                                    </div>

                                    {/* Required marks */}
                                    <div className="text-center">
                                        <span className={`font-black text-sm ${rec.feasible ? 'text-green-500' : 'text-red-400'}`}>
                                            {rec.feasible ? rec.requiredMarks : '> 90'}
                                        </span>
                                    </div>

                                    {/* Jump */}
                                    <div className="text-center">
                                        <span className="font-black text-blue-500 text-sm">+{jump}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                        <p className="text-[9px] leading-relaxed opacity-60 italic text-center">
                            💡 Marks are distributed proportionally by credit weight. Heavier subjects carry more of the deficit. Only marks &lt; 60 are eligible under AWKUM policy. Achieving ≥ 90 marks earns 4.0 GP.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default RetakeOptimizer;
