import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Cpu, Zap, Activity } from 'lucide-react';
import userStatsApi from '../api/userStats';
import type { UserOverviewStats } from '../api/userStats';

const UsageStats = () => {
    const [stats, setStats] = useState<UserOverviewStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await userStatsApi.getUserOverview();
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch usage stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const statsConfig = stats ? [
        {
            label: '模型调用次数',
            innerLabel: 'Model Calls',
            value: loading ? '...' : formatNumber(stats.totalModelCalls),
            trend: '+0%', // TODO: 计算趋势需要历史数据
            icon: <Cpu size={18} className="text-indigo-500" />,
            color: 'bg-indigo-50'
        },
        {
            label: '工具调用总数',
            innerLabel: 'Tool Calls',
            value: loading ? '...' : formatNumber(stats.totalToolCalls),
            trend: '+0%',
            icon: <Zap size={18} className="text-amber-500" />,
            color: 'bg-amber-50'
        },
        {
            label: 'Tokens 消耗总计',
            innerLabel: 'Total Tokens',
            value: loading ? '...' : formatNumber(stats.totalTokensUsed),
            trend: '+0%',
            icon: <Activity size={18} className="text-emerald-500" />,
            color: 'bg-emerald-50'
        }
    ] : [
        {
            label: '模型调用次数',
            innerLabel: 'Model Calls',
            value: '0',
            trend: '+0%',
            icon: <Cpu size={18} className="text-indigo-500" />,
            color: 'bg-indigo-50'
        },
        {
            label: '工具调用总数',
            innerLabel: 'Tool Calls',
            value: '0',
            trend: '+0%',
            icon: <Zap size={18} className="text-amber-500" />,
            color: 'bg-amber-50'
        },
        {
            label: 'Tokens 消耗总计',
            innerLabel: 'Total Tokens',
            value: '0',
            trend: '+0%',
            icon: <Activity size={18} className="text-emerald-500" />,
            color: 'bg-emerald-50'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {statsConfig.map((stat, index) => (
                    <div
                        key={index}
                        className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-soft transition-all hover:shadow-premium hover:scale-[1.02] cursor-default"
                    >
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-3.5">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} border border-white shadow-soft transition-transform group-hover:scale-110`}>
                                    {stat.icon}
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 uppercase tracking-tight">
                                    {stat.trend}
                                </span>
                            </div>
                            <div className="text-2xl font-black text-slate-900 mb-1 tabular-nums">
                                {stat.value}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                                {stat.innerLabel}
                            </div>
                            <div className="text-[13px] font-bold text-slate-700">
                                {stat.label}
                            </div>
                        </div>

                        <div className="absolute bottom-0 right-0 h-20 w-20 translate-x-8 translate-y-8 rounded-full bg-gradient-to-br from-slate-100 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px] mb-2">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">周期剩余额度 (Cycle Remaining)</span>
                        <span className="text-slate-600 font-black text-base">∞</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden p-[2px] border border-slate-100">
                        <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full shadow-sm" style={{ width: '100%' }} />
                    </div>
                </div>
                <div className="md:w-64">
                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                        您正在使用 <span className="text-brand-600 font-black">无限额度</span> 版本。尽情创作吧！
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UsageStats;
