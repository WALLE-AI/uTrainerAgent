/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {
    ResponsiveContainer, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
    AreaChart, Area
} from 'recharts';

const performanceData = [
    { time: '10:00', latency: 45, throughput: 120, cpu: 45, mem: 62 },
    { time: '10:05', latency: 52, throughput: 115, cpu: 48, mem: 63 },
    { time: '10:10', latency: 48, throughput: 125, cpu: 52, mem: 65 },
    { time: '10:15', latency: 75, throughput: 90, cpu: 85, mem: 70 },
    { time: '10:20', latency: 55, throughput: 130, cpu: 60, mem: 68 },
    { time: '10:25', latency: 42, throughput: 150, cpu: 55, mem: 67 },
    { time: '10:30', latency: 40, throughput: 145, cpu: 50, mem: 66 },
];

const modelInstances = [
    { id: 'inst-001', name: 'vLLM-Llama3-8B', status: 'Healthy', version: 'v1.4.2', engine: 'vLLM', uptime: '12d 4h', load: '65%' },
    { id: 'inst-002', name: 'SGLang-DeepSeek-MoE', status: 'Healthy', version: 'v2.1.0', engine: 'SGLang', uptime: '5d 1h', load: '42%' },
    { id: 'inst-003', name: 'vLLM-Mistral-v3', status: 'Warning', version: 'v1.0.0', engine: 'vLLM', uptime: '2d 12h', load: '92%' },
];

export const InferenceObservability: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">推理部署可观测 Observability</h1>
                    <p className="mt-1 text-slate-500 font-medium text-xs">全链路监控模型推理性能、资源负载与服务健康度。</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global P95 Latency</p>
                        <p className="text-2xl font-black text-emerald-500 leading-none mt-1">42ms</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/70 backdrop-blur-xl border border-slate-100 rounded-[32px] p-8 shadow-sm h-[350px]">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">推理延迟 (Latency) / ms</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Line type="monotone" dataKey="latency" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white/70 backdrop-blur-xl border border-slate-100 rounded-[32px] p-8 shadow-sm h-[350px]">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">吞吐量 (Throughput) / tokens/s</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" dataKey="throughput" stroke="#10b981" fill="#10b98120" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">活跃服务实例 Running Instances</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">模型名称 Model</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">状态 Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">引擎 Engine</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">负载 Load</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">运行时长 Uptime</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {modelInstances.map(inst => (
                                <tr key={inst.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-indigo-600">{inst.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-slate-900">{inst.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">{inst.version}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${inst.status === 'Healthy' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                            {inst.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-600">{inst.engine}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${parseInt(inst.load) > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                                    style={{ width: inst.load }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400">{inst.load}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-xs font-bold text-slate-900">{inst.uptime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
