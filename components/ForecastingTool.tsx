import React, { useState } from 'react';
import { calculateRequiredSGPA } from '../src/domain/gpa/engine';

interface Props {
    currentCGPA: number;
    currentCredits: number;
    theme: any;
}

const ForecastingTool: React.FC<Props> = ({ currentCGPA, currentCredits, theme }) => {
    const [targetCGPA, setTargetCGPA] = useState<string>('');
    const [nextCredits, setNextCredits] = useState<number>(18);
    const [result, setResult] = useState<number | null | 'IMPOSSIBLE' | 'ACHIEVED'>(null);

    const handleCalculate = () => {
        const target = parseFloat(targetCGPA);
        if (isNaN(target) || target < 0 || target > 4.0) return;

        const required = calculateRequiredSGPA(currentCGPA, currentCredits, target, nextCredits);
        setResult(required);
    };

    return (
        <div className={`mt-6 p-6 rounded-3xl border ${theme.border} bg-black/5 animate-in zoom-in-95`}>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-80 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                GPA Forecasting Tool
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-[10px] font-bold opacity-50 uppercase mb-1">Target CGPA</label>
                    <input
                        type="text"
                        placeholder="e.g. 3.00"
                        value={targetCGPA}
                        onChange={e => setTargetCGPA(e.target.value.replace(/[^0-9.]/g, ''))}
                        className={`w-full px-4 py-2 bg-transparent border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm ${theme.border}`}
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold opacity-50 uppercase mb-1">Next Semester Credits</label>
                    <input
                        type="number"
                        min="12"
                        max="21"
                        value={nextCredits}
                        onChange={e => setNextCredits(Math.max(0, parseInt(e.target.value) || 0))}
                        className={`w-full px-4 py-2 bg-transparent border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm ${theme.border}`}
                    />
                </div>
            </div>

            <button
                onClick={handleCalculate}
                className={`w-full py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl bg-white/10 hover:bg-white/20 transition-all border ${theme.border}`}
            >
                Calculate Required Performance
            </button>

            {result !== null && (
                <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/5 animate-in slide-in-from-bottom-2">
                    {result === 'IMPOSSIBLE' ? (
                        <div className="text-center p-2">
                            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Target is Unachievable</p>
                            <p className="text-[10px] opacity-60 mt-1">This target requires more than a 4.00 SGPA in one semester.</p>
                        </div>
                    ) : result === 'ACHIEVED' ? (
                        <div className="text-center p-2">
                            <p className="text-xs font-bold text-green-500 uppercase tracking-widest">Goal Already Reached!</p>
                            <p className="text-[10px] opacity-60 mt-1">Your current CGPA is already at or above this target.</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-[10px] font-bold opacity-50 uppercase mb-1">Required Next Semester SGPA</p>
                            <h4 className={`text-3xl font-black ${theme.accent}`}>{typeof result === 'number' ? result.toFixed(2) : result}</h4>
                            <p className="text-[10px] opacity-60 mt-2 italic">
                                Maintain this SGPA in your next {nextCredits} credits to reach {parseFloat(targetCGPA).toFixed(2)} CGPA.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ForecastingTool;
