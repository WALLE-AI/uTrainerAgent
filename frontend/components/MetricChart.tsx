/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

type MetricChartProps = {
    title: string;
    data: any[];
    xKey: string;
    yKey: string;
    yUnit: string;
    stroke: string;
};

export const MetricChart: React.FC<MetricChartProps> = ({ title, data, xKey, yKey, yUnit, stroke }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 backdrop-blur-sm">
        <h2 className="font-semibold text-gray-800 mb-4">{title}</h2>
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey={xKey} fontSize={12} tickLine={false} axisLine={{ stroke: '#d1d5db' }} unit=" 步" />
                    <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => typeof value === 'number' ? value.toPrecision(3) : value}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(4px)',
                            borderRadius: '0.75rem',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                        }}
                    />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                    <Line
                        type="monotone"
                        dataKey={yKey}
                        name={yUnit}
                        stroke={stroke}
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);
