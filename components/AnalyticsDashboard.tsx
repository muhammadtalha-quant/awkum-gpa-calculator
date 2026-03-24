import React from 'react';
import { useAcademicStore } from '../src/domain/store';
import GPATrendChart from '../src/features/analytics/GPATrendChart';
import GradeDistributionChart from '../src/features/analytics/GradeDistributionChart';

interface Props {
    theme?: any;
}

const AnalyticsDashboard: React.FC<Props> = () => {
    const { semesters } = useAcademicStore();

    // Prepare GPA Trend Data
    const trendData = semesters
        .filter(s => s.sgpa > 0)
        .map((s, idx) => ({
            name: `Sem ${idx + 1}`,
            sgpa: Number(s.sgpa)
        }));

    if (semesters.length === 0 || trendData.length === 0) {
        return (
            <div className="p-8 text-center opacity-50 border-2 border-dashed border-[#27272a] rounded-xl mt-6">
                <p className="text-xs font-bold uppercase tracking-widest">No Analytics Data Available</p>
                <p className="text-[10px] mt-2 italic">Fill your semester details to see visual performance trends.</p>
            </div>
        );
    }

    return (
        <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 opacity-50">
                <div className="h-px bg-current flex-1"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Performance Analytics</span>
                <div className="h-px bg-current flex-1"></div>
            </div>

            <div className="max-w-2xl mx-auto">
                {/* GPA Trend */}
                <div className="p-8 rounded-xl border border-[#27272a] bg-[#121215] backdrop-blur-sm shadow-xl">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 opacity-60">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                        GPA Progression Trend
                    </h4>
                    <GPATrendChart data={trendData} theme={null} />
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
