import React from 'react';
import { useAcademicStore } from '../src/domain/store';
import { calculateProjectedCGPA } from '../src/domain/gpa/engine';

interface Props {
    theme: any;
}

const PredictiveDashboard: React.FC<Props> = ({ theme }) => {
    const {
        semesters,
        projectionMode,
        setProjectionMode,
        futureCredits,
        setFutureCredits
    } = useAcademicStore();

    const projectedCGPA = calculateProjectedCGPA(semesters, projectionMode as any, futureCredits);

    const modes = [
        { id: 'current', label: 'Current Path', icon: '🎯' },
        { id: 'best', label: 'Best Case (4.00)', icon: '🚀' },
        { id: 'expected', label: 'Expected (Avg)', icon: '📊' },
        { id: 'worst', label: 'Worst Case (2.00)', icon: '⚠️' }
    ];

    return (
        <div className={`p-4 sm:p-8 rounded-[2.5rem] border ${theme.border} bg-white/5 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-500`}>
            <div className="flex flex-col gap-5 mb-8">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] opacity-40 mb-2">Outcome Simulator</h3>
                    <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Model your future academic trajectory</p>
                </div>

                <div className="flex items-center gap-3 bg-black/10 p-2 rounded-2xl border border-white/5 self-start">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-3">Future Credits</label>
                    <input
                        type="number"
                        min="0"
                        max="120"
                        value={futureCredits}
                        onChange={(e) => setFutureCredits(parseInt(e.target.value) || 0)}
                        className="w-20 px-4 py-2 bg-black/20 border border-white/10 rounded-xl outline-none text-center font-black text-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
                {modes.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => setProjectionMode(mode.id as any)}
                        className={`p-6 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center gap-3 group relative overflow-hidden ${projectionMode === mode.id
                            ? `${theme.border} bg-blue-500/10 shadow-[0_10px_30px_rgba(59,130,246,0.1)]`
                            : 'border-transparent hover:bg-white/5 hover:border-white/10'
                            }`}
                    >
                        <span className="text-2xl group-hover:scale-125 transition-transform duration-500">{mode.icon}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${projectionMode === mode.id ? 'text-blue-500' : 'opacity-40'}`}>
                            {mode.label}
                        </span>
                        {projectionMode === mode.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 animate-in slide-in-from-left duration-300"></div>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex flex-col items-center justify-center py-6 text-center border-t border-white/5 relative">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-4">Projected Termination CGPA</p>
                <div className="relative">
                    <span className={`text-6xl font-black tracking-tighter drop-shadow-2xl transition-all duration-700 ${projectionMode === 'best' ? 'text-green-500' :
                        projectionMode === 'worst' ? 'text-red-500' :
                            projectionMode === 'expected' ? 'text-blue-500' : ''
                        }`}>
                        {projectedCGPA.toFixed(2)}
                    </span>
                    <div className="absolute -top-4 -right-8">
                        <span className={`animate-pulse-subtle px-3 py-1 rounded-full text-[8px] font-black uppercase border border-current shadow-sm ${projectionMode === 'current' ? 'bg-black/20 text-blue-400' :
                            projectionMode === 'best' ? 'bg-green-500/20 text-green-400' :
                                projectionMode === 'expected' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-red-500/20 text-red-400'
                            }`}>
                            Simulating
                        </span>
                    </div>
                </div>

                <p className="mt-4 text-[10px] font-bold opacity-40 max-w-sm leading-relaxed text-center px-2">
                    Based on {futureCredits} additional credits at {
                        projectionMode === 'best' ? 'Perfect 4.0' :
                            projectionMode === 'worst' ? 'Minimum passing 2.0' :
                                projectionMode === 'expected' ? 'your current historical average' :
                                    'your existing performance data'
                    }.
                </p>
            </div>
        </div>
    );
};

export default PredictiveDashboard;
