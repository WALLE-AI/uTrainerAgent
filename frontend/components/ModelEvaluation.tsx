/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {
    ResponsiveContainer, BarChart, Bar,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    CartesianGrid, XAxis, YAxis, Tooltip, Legend, Cell
} from 'recharts';
import { Icon, ICONS, SelectField, InputField } from './shared';

const { useState, useMemo } = React;

// --- Mock Data ---

const generalBenchmarks = [
    { name: 'GPT-4o', mmlu: 88.7, ceval: 84.5, gsm8k: 97.4, humaneval: 90.2, mtbench: 9.55 },
    { name: 'Claude-3.5-Sonnet', mmlu: 86.8, ceval: 82.1, gsm8k: 95.0, humaneval: 92.0, mtbench: 9.40 },
    { name: 'Llama3-70B', mmlu: 82.0, ceval: 78.4, gsm8k: 94.1, humaneval: 85.1, mtbench: 9.32 },
    { name: 'Qwen2-72B', mmlu: 82.5, ceval: 85.2, gsm8k: 91.6, humaneval: 88.2, mtbench: 9.35 },
    { name: 'Yi-1.5-34B', mmlu: 78.1, ceval: 76.5, gsm8k: 88.5, humaneval: 79.4, mtbench: 9.05 },
];

const domainBenchmarks = {
    '医学 (Medical)': [
        { name: 'GPT-4o', score: 92.4, accuracy: 91.5, reasoning: 94.0, knowledge: 91.8 },
        { name: 'Med-Llama3', score: 88.5, accuracy: 87.2, reasoning: 89.1, knowledge: 89.2 },
        { name: 'Qwen-Medical', score: 86.2, accuracy: 85.0, reasoning: 87.5, knowledge: 86.1 },
    ],
    '法律 (Legal)': [
        { name: 'GPT-4o', score: 89.1, accuracy: 88.0, reasoning: 91.2, knowledge: 88.1 },
        { name: 'Legal-Claude', score: 87.4, accuracy: 86.5, reasoning: 89.0, knowledge: 86.7 },
        { name: 'Law-GPT', score: 84.5, accuracy: 83.2, reasoning: 85.8, knowledge: 84.5 },
    ],
    '金融 (Finance)': [
        { name: 'GPT-4o', score: 90.5, accuracy: 89.4, reasoning: 92.1, knowledge: 90.0 },
        { name: 'Fin-Qwen', score: 87.8, accuracy: 86.2, reasoning: 89.5, knowledge: 87.7 },
        { name: 'Bloom-Finance', score: 82.1, accuracy: 81.0, reasoning: 83.4, knowledge: 82.0 },
    ],
    '建筑 (Architecture)': [
        { name: 'GPT-4o', score: 85.6, accuracy: 84.2, reasoning: 87.0, knowledge: 85.6 },
        { name: 'Archi-Mistral', score: 81.2, accuracy: 80.5, reasoning: 82.1, knowledge: 81.0 },
        { name: 'Design-GPT', score: 79.8, accuracy: 78.5, reasoning: 81.2, knowledge: 79.7 },
    ],
};

const evaluationTasks = [
    { id: 'EV-001', name: 'MMLU Baseline', model: 'Yi-1.5-34B', status: 'Success', date: '2024-05-20', duration: '12m' },
    { id: 'EV-002', name: 'Medical QA Test', model: 'Qwen-Medical', status: 'Success', date: '2024-05-19', duration: '45m' },
    { id: 'EV-003', name: 'Legal Reasoning', model: 'Llama3-70B', status: 'Running', date: '2024-05-19', duration: '2h' },
    { id: 'EV-004', name: 'Finance Alpha', model: 'Fin-Qwen', status: 'Failed', date: '2024-05-18', duration: '5m' },
];

// --- Sub-components ---

const BenchmarkRadar = ({ data }) => {
    const radarData = [
        { subject: 'MMLU', A: data[0].mmlu, B: data[1].mmlu, fullMark: 100 },
        { subject: 'C-Eval', A: data[0].ceval, B: data[1].ceval, fullMark: 100 },
        { subject: 'GSM8K', A: data[0].gsm8k, B: data[1].gsm8k, fullMark: 100 },
        { subject: 'HumanEval', A: data[0].humaneval, B: data[1].humaneval, fullMark: 100 },
        { subject: 'MT-Bench', A: data[0].mtbench * 10, B: data[1].mtbench * 10, fullMark: 100 },
    ];

    return (
        <div className="bg-white/50 backdrop-blur-xl border border-gray-100 rounded-[32px] p-6 shadow-sm h-[400px]">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">能力雷达图 / Capability Radar</h3>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#f3f4f6" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: '#6b7280' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name={data[0].name}
                        dataKey="A"
                        stroke="#4f46e5"
                        fill="#4f46e5"
                        fillOpacity={0.6}
                    />
                    <Radar
                        name={data[1].name}
                        dataKey="B"
                        stroke="#ec4899"
                        fill="#ec4899"
                        fillOpacity={0.6}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase' }} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const ModelEvaluation = () => {
    const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard' | 'tasks' | 'analysis'
    const [category, setCategory] = useState('General'); // 'General' | 'Medicine' | 'Law' | 'Finance' | 'Architecture'

    const renderLeaderboard = () => {
        const isGeneral = category === 'General';
        const data = isGeneral ? generalBenchmarks : domainBenchmarks[category as keyof typeof domainBenchmarks] || [];

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                        { name: 'General', label: '综合', icon: ICONS.chartBar },
                        { name: '医学 (Medical)', label: '医学', icon: ICONS.heart },
                        { name: '法律 (Legal)', label: '法律', icon: ICONS.briefcase },
                        { name: '金融 (Finance)', label: '金融', icon: ICONS.currency },
                        { name: '建筑 (Architecture)', label: '建筑', icon: ICONS.building }
                    ].map(cat => (
                        <button
                            key={cat.name}
                            onClick={() => setCategory(cat.name)}
                            className={`p-6 rounded-[32px] border transition-all duration-500 group text-left relative overflow-hidden ${category === cat.name
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-100 scale-[1.02]'
                                : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-200 hover:bg-indigo-50/30'
                                }`}
                        >
                            {category === cat.name && (
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full -mr-8 -mt-8 animate-pulse"></div>
                            )}
                            <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-all duration-500 ${category === cat.name ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-indigo-100 group-hover:text-indigo-600 group-hover:rotate-6'
                                }`}>
                                <Icon path={cat.icon} className="w-6 h-6" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{cat.label}</p>
                            <p className="text-sm font-black tracking-tight">{cat.name.includes('(') ? cat.name : 'General Benchmarks'}</p>
                        </button>
                    ))}
                </div>

                <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">{category} 性能排行榜</h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Icon path={ICONS.search} className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="过滤模型..." className="bg-gray-50/50 border border-gray-100 rounded-xl pl-9 pr-4 py-1.5 text-[10px] font-bold w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">排名 Rank</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">模型 Model</th>
                                    {isGeneral ? (
                                        <>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">MMLU</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">C-Eval</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">GSM8K</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest text-center">综合 Score</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">准度 Accuracy</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">推理 Reasoning</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">知识 Knowledge</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest text-center">平均分 Avg</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.map((item: any, idx) => (
                                    <tr key={item.name} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100' :
                                                    idx === 1 ? 'bg-gray-300 text-white shadow-lg shadow-gray-100' :
                                                        idx === 2 ? 'bg-amber-600 text-white shadow-lg shadow-amber-100' :
                                                            'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    {idx + 1}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-gray-900">{item.name}</p>
                                        </td>
                                        {isGeneral ? (
                                            <>
                                                <td className="px-6 py-4 text-center font-mono text-xs text-gray-600">{item.mmlu}</td>
                                                <td className="px-6 py-4 text-center font-mono text-xs text-gray-600">{item.ceval}</td>
                                                <td className="px-6 py-4 text-center font-mono text-xs text-gray-600">{item.gsm8k}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm font-black text-indigo-600">{(item.mmlu * 0.4 + item.ceval * 0.3 + item.gsm8k * 0.3).toFixed(1)}</span>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 text-center font-mono text-xs text-gray-600">{item.accuracy}</td>
                                                <td className="px-6 py-4 text-center font-mono text-xs text-gray-600">{item.reasoning}</td>
                                                <td className="px-6 py-4 text-center font-mono text-xs text-gray-600">{item.knowledge}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm font-black text-indigo-600">{item.score}</span>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderTasks = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">任务 ID</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">任务名称</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">模型 Model</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">状态 Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">日期 Date</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">用时</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {evaluationTasks.map(task => (
                            <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-indigo-600">{task.id}</td>
                                <td className="px-6 py-4 text-sm font-black text-gray-900">{task.name}</td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-600">{task.model}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${task.status === 'Success' ? 'bg-green-100 text-green-600' :
                                        task.status === 'Running' ? 'bg-blue-100 text-blue-600 animate-pulse' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-400 font-medium">{task.date}</td>
                                <td className="px-6 py-4 text-right font-mono text-xs font-bold text-gray-900">{task.duration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAnalysis = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BenchmarkRadar data={[generalBenchmarks[0], generalBenchmarks[1]]} />

            <div className="bg-white/50 backdrop-blur-xl border border-gray-100 rounded-[32px] p-6 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">头部模型得分对比 / SOTA Comparison</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={generalBenchmarks} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} />
                            <Tooltip
                                cursor={{ fill: '#f9fafb' }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="mmlu" name="MMLU" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="ceval" name="C-Eval" fill="#818cf8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="gsm8k" name="GSM8K" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">模型评测工作室</h1>
                    <p className="mt-1 text-gray-500 font-medium text-xs">全维度、跨领域的大模型能力追踪与基准测试系统。</p>
                </div>
                <div className="flex bg-white/70 backdrop-blur-md p-1 rounded-2xl border border-gray-100 shadow-sm">
                    {[
                        { id: 'leaderboard', label: '排行榜 Leaderboard', icon: ICONS.chartBar },
                        { id: 'analysis', label: '对比分析 Analysis', icon: ICONS.chart },
                        { id: 'tasks', label: '任务追踪 Tasks', icon: ICONS.tasks },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                                : 'text-gray-400 hover:text-gray-900'
                                }`}
                        >
                            <Icon path={tab.icon} className="w-4 h-4" />
                            {tab.label.split(' ')[0]}
                            <span className="hidden lg:inline opacity-40">{tab.label.split(' ')[1]}</span>
                        </button>
                    ))}
                </div>
            </div>

            <main className="mt-8">
                {activeTab === 'leaderboard' && renderLeaderboard()}
                {activeTab === 'tasks' && renderTasks()}
                {activeTab === 'analysis' && renderAnalysis()}
            </main>
        </div>
    );
};
