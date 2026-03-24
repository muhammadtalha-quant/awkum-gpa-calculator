import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface Props {
    data: { name: string; sgpa: number }[];
    theme?: any;
}

const GPATrendChart: React.FC<Props> = ({ data }) => {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                        dy={10}
                    />
                    <YAxis
                        domain={[0, 4]}
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
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="sgpa"
                        stroke="#a78bfa"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSgpa)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GPATrendChart;
