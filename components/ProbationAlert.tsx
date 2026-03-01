import React from 'react';
import { getProbationStatus } from '../src/domain/gpa/engine';

interface Props {
    cgpa: number;
    theme: any;
}

const ProbationAlert: React.FC<Props> = ({ cgpa, theme }) => {
    const status = getProbationStatus(cgpa);

    if (status === 'GOOD') return null;

    const isWarning = status === 'WARNING';

    // High-contrast styles for maximum visibility
    const containerStyles = isWarning
        ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-amber-500/20'
        : 'bg-red-600 border-red-400 text-white shadow-red-600/40';

    const iconColor = isWarning ? 'text-amber-600' : 'text-white';
    const subtextColor = isWarning ? 'opacity-80' : 'opacity-90';

    const icon = isWarning
        ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
        : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';

    return (
        <div className={`mt-8 p-6 rounded-[2rem] border-2 ${containerStyles} shadow-2xl animate-in fade-in slide-in-from-top-6 duration-1000 relative overflow-hidden`}>
            <div className="flex items-start gap-5 relative z-10">
                <div className={`p-3 rounded-2xl ${isWarning ? 'bg-amber-500/10' : 'bg-white/20'}`}>
                    <svg className={`w-8 h-8 flex-shrink-0 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon}></path>
                    </svg>
                </div>
                <div>
                    <h4 className={`text-xs font-black uppercase tracking-[0.3em] mb-2 ${isWarning ? 'text-amber-700' : 'text-white'}`}>
                        {isWarning ? 'ACADEMIC PERFORMANCE WARNING' : 'CRITICAL PROBATION RISK'}
                    </h4>
                    <p className={`text-sm font-bold leading-relaxed ${subtextColor}`}>
                        {isWarning
                            ? `Your CGPA is ${cgpa.toFixed(2)}. This is approaching the 2.00 probation threshold. Significant improvement in your next semester is required to maintain academic standing.`
                            : `Your CGPA is ${cgpa.toFixed(2)}. Under official AWKUM policy, a CGPA below 2.00 triggers academic probation. Accumulating two more consecutive probations will result in the immediate dismissal of your admission (Academic Dropout).`
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProbationAlert;
