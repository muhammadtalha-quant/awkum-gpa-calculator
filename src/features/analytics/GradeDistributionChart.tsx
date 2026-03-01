import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface Props {
    data: { grade: string; count: number }[];
    theme: any;
}

const GradeDistributionChart: React.FC<Props> = ({ data, theme }) => {
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="grade"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#fff'
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1500}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GradeDistributionChart;
