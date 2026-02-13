import React, { useState, useEffect } from 'react';
import { FileText, Download, User, Edit3, Zap, LogOut, Mail, Cpu } from 'lucide-react';
import UsageStats from '../UsageStats';
import UsageCharts from './UsageCharts';
import userStatsApi from '../../api/userStats';
import type { UserOverviewStats } from '../../api/userStats';

interface UserOverviewProps {
    user: {
        name: string;
        email: string;
        avatar: string;
        role?: string;
    };
    onLogout: () => void;
}

const UserOverview: React.FC<UserOverviewProps> = ({ user, onLogout }) => {
    const [stats, setStats] = useState<UserOverviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await userStatsApi.getUserOverview();
                setStats(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch user overview stats:', err);
                setError('加载统计数据失败');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatTime = (minutes: number): string => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m`;
    };

    const mainStats = stats ? [
        {
            label: '创作总时长',
            value: loading ? '加载中...' : formatTime(stats.totalCreationTime),
            icon: Zap,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
        {
            label: 'Token 消耗',
            value: loading ? '加载中...' : `${(stats.totalTokensUsed / 1000).toFixed(1)}K`,
            icon: Cpu,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            label: '模型调用',
            value: loading ? '加载中...' : `${stats.totalModelCalls} 次`,
            icon: Zap,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            label: '全平台下载',
            value: loading ? '加载中...' : `${stats.totalDownloads} 次`,
            icon: Download,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10'
        },
    ] : [
        { label: '创作总时长', value: '0 min', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Token 消耗', value: '0K', icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: '模型调用', value: '0 次', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: '全平台下载', value: '0 次', icon: Download, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    ];

    return (
        <div className="w-full h-full min-h-screen bg-slate-50 overflow-y-auto">
            <div className="max-w-[1500px] mx-auto px-6 lg:px-12 xl:px-20 py-10">
                <div className="space-y-12 pb-24">
                    {/* Premium Header Section */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-10 shadow-premium">
                        <div className="absolute top-0 right-0 h-96 w-96 translate-x-24 translate-y-[-10rem] rounded-full bg-brand-500/20 blur-[120px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 h-64 w-64 translate-x-[-4rem] translate-y-16 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:items-start text-center md:text-left">
                            <div className="relative group">
                                <div className="h-24 w-24 overflow-hidden rounded-[1.5rem] border-4 border-white/10 shadow-2xl ring-1 ring-white/5 transition-all duration-500 group-hover:scale-[1.05] group-hover:rotate-3">
                                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                </div>
                                <button className="absolute -bottom-2 -right-2 rounded-2xl bg-white p-2.5 text-slate-900 shadow-xl transition-all hover:bg-brand-500 hover:text-white hover:scale-110 active:scale-95">
                                    <Edit3 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex-1 w-full">
                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                                    <div>
                                        <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                            <h1 className="text-2xl font-black text-white tracking-tight font-inter">{user.name}</h1>
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-500/30">
                                                Active Now
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                            <span className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                                <Mail className="h-4 w-4" />
                                                {user.email}
                                            </span>
                                            <div className="hidden md:block h-4 w-[1px] bg-slate-800"></div>
                                            <span className="inline-flex items-center gap-2 text-sm font-black text-brand-400 uppercase tracking-tight">
                                                Pro Infinity Plan
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-4">
                                        <button className="flex items-center gap-3 rounded-[1.25rem] bg-white px-7 py-3.5 text-sm font-black text-slate-900 shadow-xl transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]">
                                            <Zap className="h-4 w-4 text-brand-500 fill-brand-500" />
                                            管理订阅
                                        </button>
                                        <button
                                            onClick={onLogout}
                                            className="flex items-center justify-center h-12 w-12 rounded-[1.25rem] border border-white/10 bg-white/5 text-white transition-all hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 cursor-pointer"
                                            title="退出登录"
                                        >
                                            <LogOut className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-12">
                                    {mainStats.map((stat, idx) => (
                                        <div key={idx} className="flex items-center gap-4 group cursor-default">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${stat.bg} border border-white/5 backdrop-blur-md transition-transform group-hover:scale-110`}>
                                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                            </div>
                                            <div>
                                                <div className="text-lg font-black text-white">{stat.value}</div>
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Core Usage Analytics */}
                    <div className="grid grid-cols-1 gap-16">
                        <section className="rounded-[2.5rem] bg-white p-8 shadow-soft border border-slate-100 transition-all hover:shadow-premium group">
                            <div className="mb-10 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                        智能创作趋势
                                        <span className="text-[9px] font-black bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-lg border border-brand-100 uppercase tracking-tighter">ADVANCED</span>
                                    </h3>
                                    <p className="text-sm text-slate-500 font-bold mt-1.5 opacity-70">深度解析您的创作效率与资源占用概况</p>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-[0.1em]">System Live</span>
                                </div>
                            </div>

                            <div className="space-y-12">
                                <UsageCharts />
                                <div className="pt-4">
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6 px-1 flex items-center gap-2">
                                        <span className="w-8 h-px bg-slate-200"></span>
                                        本月统计概览
                                        <span className="flex-1 h-px bg-slate-200"></span>
                                    </h4>
                                    <UsageStats />
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 2xl:grid-cols-3 gap-16">
                            {/* Recent Activity - 2/3 width */}
                            <div className="2xl:col-span-2 rounded-[2.5rem] bg-white p-8 shadow-soft border border-slate-100 transition-all hover:shadow-md">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">操作日志与动态</h3>
                                    <button className="text-xs font-black text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-widest">查看全部活动</button>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { action: '生成了新论文', target: 'Deep Learning in Medicine', time: '2小时前', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
                                        { action: '下载了论文 PDF', target: 'Quantum Computing Fundamentals', time: '昨天', icon: Download, color: 'text-purple-500', bg: 'bg-purple-50' },
                                        { action: '更新了个人资料', target: '头像与简介', time: '3天前', icon: User, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-5 rounded-3xl border border-slate-50 bg-slate-50/50 p-5 transition-all hover:bg-white hover:shadow-md hover:border-slate-100 group cursor-default">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} border border-white shadow-soft transition-transform group-hover:scale-110`}>
                                                <item.icon className={`h-5 w-5 ${item.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-black text-slate-800 mb-0.5">{item.action}</div>
                                                <div className="text-xs text-slate-400 font-bold truncate">{item.target}</div>
                                            </div>
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-slate-100">{item.time}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Suggestions / Security - 1/3 width */}
                            <div className="rounded-[2.5rem] bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-premium relative overflow-hidden group min-h-[400px] flex flex-col justify-between">
                                <div className="absolute top-0 right-0 h-40 w-40 translate-x-12 translate-y-[-2rem] rounded-full bg-white/10 blur-2xl pointer-events-none transition-transform group-hover:scale-150 duration-1000"></div>

                                <div>
                                    <h3 className="text-xl font-black mb-10 tracking-tight">安全建议与监控</h3>

                                    <div className="space-y-8 relative z-10">
                                        <div className="flex gap-4">
                                            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/20">
                                                <Zap className="h-5 w-5 text-yellow-300" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black mb-1">开启高级 MFA 认证</h4>
                                                <p className="text-[11px] text-white/70 font-bold leading-relaxed">启用多因素身份验证，为您的账户多加一层安全锁。</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/20">
                                                <Cpu className="h-5 w-5 text-blue-300" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black mb-1">监控实时 API 调用</h4>
                                                <p className="text-[11px] text-white/70 font-bold leading-relaxed">您的 API 调用在本周增加了 15%，建议锁定来源 IP。</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button className="mt-12 w-full py-4 rounded-2xl bg-white text-slate-900 text-sm font-black transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl">
                                    安全设置中心
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserOverview;
