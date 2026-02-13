/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { mockDeployments } from '../api/mockData';
import { Icon, ICONS } from './shared';
const { useState } = React;

const ReplayModal = ({ request, onClose }) => {
    if (!request) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">请求回放</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"><Icon path={ICONS.close} className="w-5 h-5" /></button>
                </header>
                <main className="p-8 space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-500">时间</label>
                        <p className="mt-1 p-2 bg-gray-100 rounded-md font-mono text-sm">{request.time}</p>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-500">错误详情</label>
                        <p className="mt-1 p-2 bg-red-50 text-red-800 rounded-md font-mono text-sm">{request.code}: {request.msg}</p>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-500">Prompt</label>
                        <div className="mt-1 p-3 bg-gray-100 rounded-md max-h-60 overflow-y-auto">
                            <p className="text-sm whitespace-pre-wrap">{request.prompt}</p>
                        </div>
                    </div>
                </main>
                <footer className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="text-sm font-semibold text-gray-600 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100">关闭</button>
                    <button onClick={() => alert('已导出为业务测试集！')} className="text-sm font-semibold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm">导出为测试集</button>
                </footer>
            </div>
        </div>
    );
};


export const InferenceObservability = () => {
    const [replayRequest, setReplayRequest] = useState(null);
    const selectedDeployment = mockDeployments[0];

    // Simulated trend data for TTFT and TPS
    const trendData = [
        { time: '14:00', tps: 2800, ttft: 22, tpot: 10 },
        { time: '14:05', tps: 3100, ttft: 25, tpot: 12 },
        { time: '14:10', tps: 3050, ttft: 24, tpot: 11 },
        { time: '14:15', tps: 3400, ttft: 28, tpot: 13 },
        { time: '14:20', tps: 3200, ttft: 25, tpot: 12 },
        { time: '14:25', tps: 3250, ttft: 26, tpot: 12 },
    ];

    const errors = [
        { id: 1, time: '14:25:10', code: '503', msg: 'CUDA out of memory', prompt: '"请帮我总结一下这篇一万字的文章，并提取其中的关键观点、数据和结论。文章探讨了人工智能在未来十年对全球经济的潜在影响..."' },
        { id: 2, time: '14:22:05', code: '499', msg: 'Client closed request', prompt: '"写一个无限循环的故事"' },
        { id: 3, time: '14:18:40', code: '500', msg: 'Internal server error', prompt: '"解释一下爱因斯坦的相对论"' },
    ];

    const MetricCard = ({ title, value, unit, icon, color, description }) => (
        <div className="relative overflow-hidden bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 p-5 shadow-sm group hover:shadow-lg transition-all duration-300">
            <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full opacity-10 blur-2xl ${color}`}></div>
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className={`p-2 rounded-lg bg-white shadow-sm border border-gray-100`}>
                    <Icon path={icon} className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                </div>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-gray-900">{value}</span>
                <span className="text-sm font-semibold text-gray-400">{unit}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                {description}
            </p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header / Info Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">推理观测平台</h1>
                    <p className="text-gray-500 text-sm mt-1">实时监控推理引擎性能指标 (NIM 兼容)</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-indigo-700 text-xs font-bold uppercase tracking-wider">Active: {selectedDeployment.name}</span>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="TTFT (首Token延时)"
                    value={selectedDeployment.metrics.ttft.replace('ms', '')}
                    unit="ms"
                    icon={ICONS.clock}
                    color="bg-blue-500"
                    description="首字生成耗时，反映系统响应灵敏度"
                />
                <MetricCard
                    title="TPOT (每Token延时)"
                    value={selectedDeployment.metrics.tpot.replace('ms', '')}
                    unit="ms"
                    icon={ICONS.sparkles}
                    color="bg-purple-500"
                    description="除首字外平均每个Token生成耗时"
                />
                <MetricCard
                    title="Token 吞吐 (TPS)"
                    value={selectedDeployment.metrics.tps}
                    unit="t/s"
                    icon={ICONS.chartBar}
                    color="bg-emerald-500"
                    description="每秒生成的 Token 总数"
                />
                <MetricCard
                    title="错误率"
                    value={selectedDeployment.metrics.errorRate.replace('%', '')}
                    unit="%"
                    icon={ICONS.shield}
                    color="bg-rose-500"
                    description="过去 5 分钟请求失败比例"
                />
            </div>

            {/* Second Row Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between">
                    <div>
                        <p className="text-indigo-100 text-sm font-medium opacity-80">并发活跃请求</p>
                        <h3 className="text-4xl font-bold mt-2">42</h3>
                    </div>
                    <div className="mt-8 flex items-center justify-between text-indigo-100 text-xs font-semibold">
                        <span>正在处理: 28</span>
                        <span>等待队列: 14</span>
                    </div>
                </div>

                <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">ITL (Token间隙)</p>
                            <h3 className="text-2xl font-bold mt-1 text-gray-800">{selectedDeployment.metrics.itl}</h3>
                        </div>
                        <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">P95</div>
                    </div>
                    <div className="mt-4 text-xs text-gray-400">跨 Token 生成的平均时间波动</div>
                </div>

                <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">E2EL (端到端延时)</p>
                            <h3 className="text-2xl font-bold mt-1 text-gray-800">{selectedDeployment.metrics.e2el}</h3>
                        </div>
                        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">AVG</div>
                    </div>
                    <div className="mt-4 text-xs text-gray-400">单次完整请求从开始到结束的总时长</div>
                </div>
            </div>

            {/* Performance Trend Charts */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white/20">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <Icon path={ICONS.chart} className="w-5 h-5 text-indigo-600" />
                        推理吞吐与首Token响应趋势
                    </h2>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm">实时</button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-200">1H</button>
                    </div>
                </div>
                <div className="p-8 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" fontSize={11} axisLine={false} tickLine={false} dy={10} />
                            <YAxis yAxisId="left" fontSize={11} axisLine={false} tickLine={false} unit=" t/s" />
                            <YAxis yAxisId="right" orientation="right" fontSize={11} axisLine={false} tickLine={false} unit=" ms" />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} iconType="circle" />
                            <Line yAxisId="left" type="monotone" dataKey="tps" name="Token 吞吐 (TPS)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            <Line yAxisId="right" type="monotone" dataKey="ttft" name="TTFT (ms)" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Error Analysis Section */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-white/20">
                    <h2 className="font-bold text-gray-900">异常请求深度分析</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                            <tr>
                                <th className="px-8 py-4">Timestamp</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Error Message</th>
                                <th className="px-6 py-4">Input Snippet</th>
                                <th className="px-8 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {errors.map((e) => (
                                <tr key={e.id} className="hover:bg-indigo-50/30 transition-colors group">
                                    <td className="px-8 py-5 text-gray-500 font-mono text-xs">{e.time}</td>
                                    <td className="px-6 py-5">
                                        <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-bold border border-rose-100">{e.code}</span>
                                    </td>
                                    <td className="px-6 py-5 text-gray-700 font-medium">{e.msg}</td>
                                    <td className="px-6 py-5 text-gray-400 italic max-w-xs truncate">{e.prompt}</td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => setReplayRequest(e)}
                                            className="text-indigo-600 font-bold text-xs hover:text-indigo-800 flex items-center gap-1 justify-end ml-auto"
                                        >
                                            <Icon path={ICONS.play} className="w-3 h-3" />
                                            回放调试
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ReplayModal request={replayRequest} onClose={() => setReplayRequest(null)} />
        </div>
    );
};