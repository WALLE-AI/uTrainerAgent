/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect } from 'react';
import {
    LogOut, MessageSquare, ChevronRight, Activity, Zap, Cpu,
    Database, Microscope, Rocket, Layout, ArrowUpRight, Terminal, History
} from 'lucide-react';
import UsageStats from '../UsageStats';
import UsageCharts from './UsageCharts';

interface UserOverviewProps {
    user: {
        name: string;
        email: string;
        avatar: string;
    };
    onLogout: () => void;
}

const UserOverview: React.FC<UserOverviewProps> = ({ user, onLogout }) => {
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch stats here if needed
            } catch (err) {
                console.error('Failed to fetch user overview stats:', err);
            }
        };

        fetchStats();
    }, []);

    const pillars = [
        {
            id: 'data',
            title: 'Data Factory',
            label: '数据集工厂',
            icon: Database,
            stats: '1.2M Samples',
            status: 'Health: 94%',
            color: 'indigo',
            tags: ['Magpie', 'Synthesis', 'Cleaning']
        },
        {
            id: 'training',
            title: 'Neural Foundry',
            label: '神经网络熔炉',
            icon: Zap,
            stats: '2 Active Runs',
            status: 'Loss: 0.124',
            color: 'emerald',
            tags: ['SFT', 'RLHF', 'DPO']
        },
        {
            id: 'evaluation',
            title: 'Evaluation Lab',
            label: '自动评测实验室',
            icon: Microscope,
            stats: '3 Pending',
            status: 'Win Rate: 68%',
            color: 'amber',
            tags: ['MMLU', 'HumanEval', 'GSM8K']
        },
        {
            id: 'inference',
            title: 'Production Gate',
            label: '推理发布网关',
            icon: Rocket,
            stats: '5 Models Live',
            status: 'P99: 45ms',
            color: 'rose',
            tags: ['vLLM', 'SGLang', 'Scale']
        }
    ];

    return (
        <div className="w-full h-full min-h-screen bg-[#f8fafc] overflow-y-auto">
            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 xl:px-16 py-8">
                <div className="space-y-12 pb-24 text-left">

                    {/* uTrainerAgent System Header / Resource Pulse */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-2 relative group overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-indigo-500/30 transition-all duration-700" />
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="h-20 w-20 rounded-3xl border-2 border-white/10 p-1 bg-gradient-to-tr from-slate-800 to-indigo-900 group-hover:rotate-3 transition-transform">
                                        <img src={user.avatar} alt={user.name} className="h-full w-full rounded-[1.25rem] object-cover" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-2xl font-black text-white tracking-tight uppercase">{user.name}</h1>
                                            <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[10px] font-black text-indigo-400 tracking-widest uppercase">
                                                Active Agent Mode
                                            </span>
                                        </div>
                                        <p className="text-slate-400 font-medium text-sm">{user.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-500 transition-all"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>

                        {[
                            { label: 'GPU Utilization', value: '84%', icon: Cpu, sub: '8x H800 Active' },
                            { label: 'Token Balance', value: '154.2M', icon: Activity, sub: 'Budget: 500M' }
                        ].map((resource, i) => (
                            <div key={i} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm group hover:border-indigo-200 transition-all flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                        <resource.icon className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{resource.label}</p>
                                    <p className="text-3xl font-black text-slate-900">{resource.value}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tight">{resource.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Agent Insight Feed */}
                    <div className="flex items-center gap-4 p-5 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                            <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">uTrainer Agent 实时洞察</p>
                            <p className="text-sm font-black text-slate-900 mt-1.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                我发现您的 SFT 任务数据集多样性较低。建议通过 Magpie 自动合成方案补充 4.5k 条高质量原子指令。
                            </p>
                        </div>
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-sm">
                            立即执行
                        </button>
                    </div>

                    {/* The Four Pillars Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                        {pillars.map((pillar) => (
                            <div key={pillar.id} className="relative group p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-500">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-all duration-500 ${pillar.color === 'indigo' ? 'bg-indigo-500/10' :
                                    pillar.color === 'emerald' ? 'bg-emerald-500/10' :
                                        pillar.color === 'amber' ? 'bg-amber-500/10' :
                                            'bg-rose-500/10'
                                    }`}>
                                    <pillar.icon className={`h-7 w-7 ${pillar.color === 'indigo' ? 'text-indigo-600' :
                                        pillar.color === 'emerald' ? 'text-emerald-600' :
                                            pillar.color === 'amber' ? 'text-amber-600' :
                                                'text-rose-600'
                                        }`} />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{pillar.title}</p>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{pillar.label}</h3>
                                    </div>
                                    <div className="py-4 border-y border-slate-50">
                                        <div className="flex justify-between items-end">
                                            <p className="text-2xl font-black text-slate-900 leading-none">{pillar.stats}</p>
                                            <span className={`text-[11px] font-black uppercase tracking-widest ${pillar.color === 'indigo' ? 'text-indigo-600' :
                                                pillar.color === 'emerald' ? 'text-emerald-600' :
                                                    pillar.color === 'amber' ? 'text-amber-600' :
                                                        'text-rose-600'
                                                }`}>{pillar.status}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {pillar.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-slate-50 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Global Task Center & Intelligence Log */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                        <section className="xl:col-span-2 space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <Layout className="h-5 w-5 text-indigo-600" />
                                    全局任务总线 Global Task Bus
                                </h2>
                                <button className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                                    查看全部后台任务 →
                                </button>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { id: 'T-104', type: 'Synthesis', model: 'v1.2-atomic', progress: 84, status: 'Running', tool: 'Magpie' },
                                    { id: 'T-105', type: 'Training', model: 'Llama3-SFT', progress: 42, status: 'Running', tool: 'LLaMA-Factory' },
                                    { id: 'T-102', type: 'Eval', model: 'Bench-v3', progress: 100, status: 'Completed', tool: 'Self-Eval' }
                                ].map((task, i) => (
                                    <div key={i} className="p-6 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:border-indigo-100 transition-all shadow-sm">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                                                <Terminal className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <div className="text-left">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-black text-slate-900 tracking-tight uppercase leading-none">{task.model}</h4>
                                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase">{task.type}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 font-mono">
                                                    ID: {task.id} • TOOL: {task.tool}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="w-32 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                                        <div className={`h-full ${task.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-600 animate-pulse'}`} style={{ width: `${task.progress}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-800">{task.progress}%</span>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${task.status === 'Completed' ? 'text-emerald-500' : 'text-indigo-600'}`}>{task.status}</span>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-8">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <History className="h-5 w-5 text-indigo-600" />
                                智能日志 Agent Logs
                            </h2>
                            <div className="relative pl-6 space-y-10 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                                {[
                                    { time: '12:45', action: '执行自主评测', detail: '基于 MMLU 基准测试 Llama3-SFT-v4 模型精度', status: 'Success' },
                                    { time: '11:20', action: '自动化数据清洗', detail: '过滤掉 1.2k 条含有 PII 信息的语料对', status: 'Success' },
                                    { time: '09:15', action: '构建训练脚本', detail: '已选择 DeepSpeed Zero-3 加速方案并优化超参数', status: 'Active' }
                                ].map((log, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[27px] top-1 w-2 h-2 rounded-full border-2 border-indigo-600 bg-white z-10" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{log.time}</p>
                                        <h4 className="text-sm font-black text-slate-900 leading-tight mb-1">{log.action}</h4>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{log.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Technical Monitoring (Collapsible) */}
                    <details className="group border-t border-slate-200 pt-12">
                        <summary className="list-none flex items-center justify-between cursor-pointer group-hover:text-indigo-600 transition-colors">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 underline decoration-indigo-200 decoration-4">
                                <Activity className="h-5 w-5" />
                                基础设施与全链路监控 Infrastructure Pulse
                            </h3>
                            <ChevronRight className="h-5 w-5 text-slate-400 group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="pt-10 space-y-12">
                            <UsageCharts />
                            <div className="pt-4 border-t border-slate-100">
                                <UsageStats />
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    );
};

export default UserOverview;
