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
  Area,
} from 'recharts';

interface Props {
  data: { name: string; sgpa: number }[];
  theme?: any;
}

const GPATrendChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-[320px] w-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="rgba(255,255,255,0.03)" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: '#71717a', fontWeight: 'bold' }}
            dy={15}
          />
          <YAxis
            domain={[0, 4]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: '#71717a', fontWeight: 'bold' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#09090b',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              fontSize: '11px',
              color: '#fff',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            }}
            itemStyle={{
              color: '#6366f1',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
            cursor={{ stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="sgpa"
            stroke="#6366f1"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorSgpa)"
            animationBegin={200}
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GPATrendChart;
