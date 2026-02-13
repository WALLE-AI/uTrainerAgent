/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { Icon, ICONS, Tag } from './shared';

const statusStyles = {
    Running: { color: 'bg-indigo-100 text-indigo-600 border-indigo-200', label: '运行中' },
    Completed: { color: 'bg-green-100 text-green-600 border-green-200', label: '已完成' },
    Failed: { color: 'bg-red-100 text-red-600 border-red-200', label: '已停机' },
    Pending: { color: 'bg-gray-100 text-gray-400 border-gray-200', label: '队列中' },
};

const Metric = ({ label, value, subValue = null, trend = null }) => (
    <div className="flex flex-col">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
            <p className="text-sm font-black text-gray-900">{value}</p>
            {subValue && <p className="text-[10px] font-bold text-gray-400">{subValue}</p>}
            {trend && <span className={`text-[9px] font-black ${trend.startsWith('-') ? 'text-green-500' : 'text-red-500'}`}>{trend}</span>}
        </div>
    </div>
);

const Sparkline = ({ data, dataKey, stroke }) => (
    <div className="w-full h-10">
        <ResponsiveContainer>
            <LineChart data={data}>
                <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

// Fix: Use React.FC to correctly type the component for use in lists with a 'key' prop.
export const TrainingJobCard: React.FC<{ job: any; onSelect: () => void; }> = ({ job, onSelect }) => {
    const status = statusStyles[job.status] || { color: 'bg-gray-100 text-gray-400 border-gray-200', label: job.status };

    return (
        <div
            onClick={onSelect}
            className="bg-white border border-gray-100 rounded-[24px] shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 group relative overflow-hidden"
        >
            {job.status === 'Running' && (
                <div className="absolute top-0 right-0 p-4">
                    <div className="w-12 h-12 rounded-full border-2 border-indigo-100 flex items-center justify-center relative">
                        <svg className="w-12 h-12 absolute -rotate-90">
                            <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600" strokeDasharray="138" strokeDashoffset="40" />
                        </svg>
                        <span className="text-[10px] font-black text-indigo-600">72%</span>
                    </div>
                </div>
            )}

            <header className="p-6 border-b border-gray-50 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                            {status.label}
                        </span>
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ID: {job.id.split('-')[1]}</span>
                    </div>
                    <h3 className="font-black text-xl text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors truncate max-w-[240px]">{job.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Launched {job.createdAt}</p>
                </div>
            </header>

            <main className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">基础模型 Base</p>
                        <p className="text-sm font-black text-gray-900 truncate">{job.baseModel}</p>
                    </div>
                    <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">数据集 Data</p>
                        <p className="text-sm font-black text-gray-900 truncate">{job.dataset}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <Metric label="算力 Resource" value={job.gpus.split('x')[0] + 'x'} subValue={job.gpus.split('x')[1]} />
                    <Metric label="时长 Dur" value={job.duration} />
                    <Metric label="吞吐 Tpt" value={job.throughput.split(' ')[0]} subValue="t/s" />
                </div>

                {job.history && job.history.length > 0 && (
                    <div className="pt-4 border-t border-gray-50 flex gap-6">
                        <div className="flex-1">
                            <div className="flex justify-between items-end mb-2">
                                <Metric label="收敛 Loss" value={job.loss} trend="-0.012" />
                            </div>
                            <Sparkline data={job.history} dataKey="loss" stroke="#6366f1" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-end mb-2">
                                <Metric label="步速率 Steps" value="2.4" subValue="ops" />
                            </div>
                            <Sparkline data={job.history} dataKey="throughput" stroke="#3b82f6" />
                        </div>
                    </div>
                )}
            </main>

            <footer className="px-6 py-4 bg-gray-50/30 border-t border-gray-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2">
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase border border-indigo-100/50">BF16</span>
                    <span className="text-[9px] font-black text-gray-400 bg-white px-2 py-0.5 rounded uppercase border border-gray-100">Optimizer: AdamW</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); }} className="p-2 rounded-xl hover:bg-white hover:shadow-md text-gray-400 hover:text-indigo-600 transition-all">
                        <Icon path={ICONS.tasks} className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); }} className="p-2 rounded-xl hover:bg-red-50 hover:shadow-md text-gray-400 hover:text-red-600 transition-all">
                        <Icon path={ICONS.close} className="w-4 h-4" />
                    </button>
                </div>
            </footer>
        </div>
    );
};