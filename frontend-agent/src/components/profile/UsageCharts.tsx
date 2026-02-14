import React, { useState, useEffect, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Cpu, Wrench } from 'lucide-react';
import userStatsApi from '../../api/userStats';
import type { TrendDataPoint, ToolUsageItem } from '../../api/userStats';

const MODEL_COLORS = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#8b5cf6', // violet-500
    '#f59e0b', // amber-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#f43f5e', // rose-500
    '#6366f1', // indigo-500
    '#84cc16', // lime-500
    '#d946ef', // fuchsia-500
];

const UsageCharts: React.FC = () => {
    const [timeRange, setTimeRange] = useState<'daily' | 'monthly'>('daily');
    const [metric, setMetric] = useState<'tokens' | 'calls' | 'tools' | 'compute'>('tokens');
    const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
    const [toolData, setToolData] = useState<ToolUsageItem[]>([]);
    const [, setLoading] = useState(true);
    const [breakdownView, setBreakdownView] = useState<'tools' | 'models'>('tools');
    const [modelData, setModelData] = useState<{ name: string; provider: string; value: number; color: string }[]>([]);

    const allModels = useMemo(() => {
        const models = new Set<string>();
        trendData.forEach(point => {
            if (point.breakdown) {
                Object.values(point.breakdown).forEach((providerData: any) => {
                    if (providerData.models) {
                        Object.keys(providerData.models).forEach(modelName => {
                            models.add(modelName);
                        });
                    }
                });
            }
        });
        return Array.from(models);
    }, [trendData]);

    const modelColors = useMemo(() => {
        const colors: Record<string, string> = {};
        allModels.forEach((model, index) => {
            colors[model] = MODEL_COLORS[index % MODEL_COLORS.length];
        });
        return colors;
    }, [allModels]);

    const chartData = useMemo(() => {
        return trendData.map(point => {
            const dataPoint: any = {
                name: point.name,
                [metric]: metric === 'compute' ? 0 : (point as any)[metric],
                original: point
            };

            if (metric === 'tokens' || metric === 'calls') {
                if (point.breakdown) {
                    Object.values(point.breakdown).forEach((providerData: any) => {
                        if (providerData.models) {
                            Object.entries(providerData.models).forEach(([modelName, modelStats]: [string, any]) => {
                                dataPoint[modelName] = modelStats[metric];
                            });
                        }
                    });
                }
            } else if (metric === 'compute') {
                // Mocking LLMOps specific compute breakdown
                dataPoint.training = Math.floor(Math.random() * 40) + 10;
                dataPoint.synthesis = Math.floor(Math.random() * 30) + 5;
                dataPoint.evaluation = Math.floor(Math.random() * 15) + 2;
            }

            return dataPoint;
        });
    }, [trendData, metric]);

    useEffect(() => {
        const fetchTrendData = async () => {
            try {
                setLoading(true);
                const days = timeRange === 'daily' ? 7 : 5;
                const trends = await userStatsApi.getUserTrends(timeRange, days);
                setTrendData(trends);

                const modelStats: Record<string, { tokens: number; calls: number; tool_calls: number; provider: string }> = {};
                trends.forEach(point => {
                    if (point.breakdown) {
                        Object.entries(point.breakdown).forEach(([provider, pData]) => {
                            Object.entries((pData as any).models || {}).forEach(([model, mData]: [string, any]) => {
                                if (!modelStats[model]) {
                                    modelStats[model] = { tokens: 0, calls: 0, tool_calls: 0, provider };
                                }
                                modelStats[model].tokens += mData.tokens;
                                modelStats[model].calls += mData.calls;
                                modelStats[model].tool_calls += (mData.tool_calls || 0);
                            });
                        });
                    }
                });

                const processedModelData = Object.entries(modelStats).map(([name, stats], idx) => {
                    let value = stats.tokens;
                    if (metric === 'calls') value = stats.calls;
                    if (metric === 'tools') value = stats.tool_calls;

                    return {
                        name,
                        provider: stats.provider,
                        value: value,
                        color: ['bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-purple-500', 'bg-rose-500'][idx % 5]
                    };
                }).sort((a, b) => b.value - a.value);

                setModelData(processedModelData);

            } catch (err) {
                console.error('Failed to fetch trend data:', err);
                setTrendData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendData();
    }, [timeRange, metric]);

    useEffect(() => {
        const fetchToolData = async () => {
            try {
                const tools = await userStatsApi.getToolUsage(8);
                // Map existing tools to LLMOps categories if possible, or just decorate
                const toolsWithColors = tools.map((tool, idx) => ({
                    ...tool,
                    color: ['bg-blue-500', 'bg-emerald-500', 'bg-slate-700', 'bg-indigo-500',
                        'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-rose-500'][idx] || 'bg-gray-500'
                }));
                setToolData(toolsWithColors);
            } catch (err) {
                console.error('Failed to fetch tool usage data:', err);
                setToolData([]);
            }
        };

        fetchToolData();
    }, []);

    const metricConfig: Record<string, { label: string; color: string; unit: string }> = {
        tokens: { label: '智能额度消耗趋势', color: '#10b981', unit: timeRange === 'daily' ? '' : 'M' },
        calls: { label: '智能体调用趋势', color: '#7c3aed', unit: '' },
        tools: { label: 'LLMOps 工具流水线分布', color: '#3b82f6', unit: '' },
        compute: { label: '算力集群分配 (VRAM-Hours)', color: '#f59e0b', unit: 'h' },
    };

    const maxToolValue = Math.max(...(toolData.length ? toolData.map((t) => t.value) : [1]));
    const maxModelValue = Math.max(...(modelData.length ? modelData.map((t) => t.value) : [1]));
    const currentBreakdownData = breakdownView === 'tools' ? toolData : modelData;
    const maxBreakdownValue = breakdownView === 'tools' ? maxToolValue : maxModelValue;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const total = payload.reduce((sum: number, entry: any) => sum + (Number(entry.value) || 0), 0);
            return (
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                    <p className="text-xs font-black text-slate-500 uppercase mb-2">{label}</p>
                    <div className="space-y-1">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center justify-between gap-4 text-xs font-bold">
                                <span style={{ color: entry.color }}>{entry.name}:</span>
                                <span className="text-slate-700">
                                    {entry.value.toLocaleString()} {metricConfig[metric].unit}
                                </span>
                            </div>
                        ))}
                        <div className="border-t border-slate-100 mt-2 pt-2 flex items-center justify-between gap-4 text-xs font-black">
                            <span className="text-slate-400">总计:</span>
                            <span className="text-slate-900">
                                {total.toLocaleString()} {metricConfig[metric].unit}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200/50">
                        <button
                            onClick={() => setTimeRange('daily')}
                            className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${timeRange === 'daily' ? 'bg-white text-slate-900 shadow-premium' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            日趋势
                        </button>
                        <button
                            onClick={() => setTimeRange('monthly')}
                            className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${timeRange === 'monthly' ? 'bg-white text-slate-900 shadow-premium' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            月趋势
                        </button>
                    </div>
                </div>

                <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200/50">
                    {(['tokens', 'calls', 'tools', 'compute'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMetric(m)}
                            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${metric === m ? 'bg-white text-slate-900 shadow-premium' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {metricConfig[m].label.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 h-[420px] w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-soft relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-emerald-400 opacity-50"></div>
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">{metricConfig[metric].label}</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">数据分析 • {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    {allModels.map((model) => (
                                        <linearGradient key={model} id={`color-${model}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={modelColors[model]} stopOpacity={0.25} />
                                            <stop offset="95%" stopColor={modelColors[model]} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={metricConfig[metric].color} stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={metricConfig[metric].color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                                <Tooltip content={<CustomTooltip />} />

                                {(metric === 'tokens' || metric === 'calls') && allModels.length > 0 ? (
                                    allModels.map((model) => (
                                        <Area key={model} type="monotone" dataKey={model} stackId="1" stroke={modelColors[model]} strokeWidth={2} fillOpacity={1} fill={`url(#color-${model})`} animationDuration={1500} />
                                    ))
                                ) : metric === 'compute' ? (
                                    <>
                                        <Area type="monotone" dataKey="training" stackId="compute" stroke="#f59e0b" strokeWidth={3} fillOpacity={0.4} fill="#f59e0b" name="SFT/RL 训练" />
                                        <Area type="monotone" dataKey="synthesis" stackId="compute" stroke="#6366f1" strokeWidth={3} fillOpacity={0.4} fill="#6366f1" name="数据合成/清洗" />
                                        <Area type="monotone" dataKey="evaluation" stackId="compute" stroke="#ec4899" strokeWidth={3} fillOpacity={0.4} fill="#ec4899" name="自动评测" />
                                    </>
                                ) : (
                                    <Area type="monotone" dataKey={metric} stroke={metricConfig[metric].color} strokeWidth={4} fillOpacity={1} fill="url(#colorMetric)" animationDuration={2000} activeDot={{ r: 6, strokeWidth: 0, fill: metricConfig[metric].color }} />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-6 shadow-premium relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 translate-y-[-2rem] rounded-full bg-brand-500/10 blur-3xl pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                            <button onClick={() => setBreakdownView('tools')} className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all flex items-center gap-1.5 ${breakdownView === 'tools' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <Wrench className="h-3 w-3" /> 工具
                            </button>
                            <button onClick={() => setBreakdownView('models')} className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all flex items-center gap-1.5 ${breakdownView === 'models' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <Cpu className="h-3 w-3" /> 模型
                            </button>
                        </div>
                        <span className="text-[10px] text-brand-400 bg-brand-400/10 px-2 py-0.5 rounded-lg border border-brand-400/20">LIVE</span>
                    </div>

                    <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-6">{breakdownView === 'tools' ? '工具调用分布' : '模型使用分布'}</h4>

                    <div className="space-y-5 h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                        {currentBreakdownData.length === 0 ? (
                            <div className="text-center text-slate-500 text-xs py-10">暂无数据</div>
                        ) : (
                            currentBreakdownData.slice(0, 8).map((item) => (
                                <div key={item.name} className="group/item cursor-default">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-300 group-hover/item:text-white transition-colors truncate max-w-[120px]">{item.name}</span>
                                            {(item as any).provider && <span className="text-[9px] text-slate-500 border border-slate-700 px-1 rounded">{(item as any).provider}</span>}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 tabular-nums">{item.value.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} transition-all duration-1000 ease-out`} style={{ width: `${(item.value / maxBreakdownValue) * 100}%` }} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsageCharts;
