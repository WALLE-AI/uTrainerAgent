/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ResponsiveContainer, LineChart, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar } from 'recharts';
// FIX: KpiCard and MetricChart were incorrectly imported from './shared'. They have their own component files and are now imported from their respective paths.
import { Icon, ICONS, SelectField, InputField } from './shared';
import { KpiCard } from './KpiCard';
import { MetricChart } from './MetricChart';
import { mockTrainingJobs, mockAlerts, mockSystemMetrics, mockLogs } from '../api/mockData';
import { InferenceObservability } from './Observability';
import { TrainingJobDetail } from './TrainingJobDetail';
import { GPUClusterMonitoring } from './GPUClusterMonitoring';

const { useState, useMemo } = React;

// FIX: Added explicit types for TabButton component props. This resolves an error where TypeScript couldn't assign the 'key' prop during list rendering because the component's props were implicitly typed.
const TabButton: React.FC<{ name: string, activeTab: string, setActiveTab: (name: string) => void, icon: string }> = ({ name, activeTab, setActiveTab, icon }) => (
    <button
        onClick={() => setActiveTab(name)}
        className={`flex items-center whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm transition-colors
            ${activeTab === name
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
    >
        <Icon path={icon} className="w-5 h-5 mr-2" />
        {name}
    </button>
);

const OverviewDashboard = () => {
    const alertColors = { Critical: 'bg-red-100 text-red-800', Warning: 'bg-yellow-100 text-yellow-800', Info: 'bg-blue-100 text-blue-800' };
    const kpis = [
        { title: '训练中任务', value: mockTrainingJobs.filter(j => j.status === 'Running').length, icon: ICONS.training, iconBgColor: 'bg-blue-500' },
        { title: '健康部署', value: '2 / 3', icon: ICONS.inference, iconBgColor: 'bg-green-500' },
        { title: '平台 GPU 利用率', value: '82%', icon: ICONS.dashboard, iconBgColor: 'bg-purple-500' },
        { title: '告警 (24h)', value: mockAlerts.length, icon: ICONS.bell, iconBgColor: 'bg-red-500' },
    ];
    const combinedData = [
        { name: '10:00', training: 18200, inference: 8500 },
        { name: '11:00', training: 19500, inference: 9200 },
        { name: '12:00', training: 17800, inference: 8800 },
        { name: '13:00', training: 21000, inference: 10500 },
        { name: '14:00', training: 22500, inference: 11200 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200">
                    <h2 className="font-semibold text-gray-800 mb-4">平台流量总览 (Tokens/s)</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={combinedData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }} />
                                <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                                <Bar dataKey="training" name="训练吞吐" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="inference" name="推理吞吐" fill="#84cc16" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h2 className="font-semibold text-gray-800 mb-4">最近告警</h2>
                    <div className="space-y-3">
                        {mockAlerts.slice(0, 4).map(alert => (
                            <div key={alert.id} className="flex items-start gap-3">
                                <span className={`flex-shrink-0 mt-1 w-2 h-2 rounded-full ${alertColors[alert.severity].split(' ')[0]}`}></span>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">{alert.source}: {alert.entity}</p>
                                    <p className="text-xs text-gray-500">{alert.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const JobHealthCard = ({ job, isSelected, onSelect }) => {
    const statusColors = {
        Running: 'bg-blue-500',
        Completed: 'bg-green-500',
        Failed: 'bg-red-500',
        Pending: 'bg-gray-400'
    };

    return (
        <div
            onClick={() => onSelect(job.id)}
            className={`p-5 rounded-[32px] border transition-all cursor-pointer group relative overflow-hidden ${isSelected
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 ring-4 ring-indigo-50'
                : 'bg-white border-gray-100 text-gray-900 hover:border-indigo-200 hover:shadow-lg'
                }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-gray-50'}`}>
                    <Icon path={ICONS.training} className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {job.status}
                    </span>
                    <div className="mt-2 flex gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-1 h-3 rounded-full ${job.status === 'Running' ? (isSelected ? 'bg-white/40 animate-pulse' : 'bg-indigo-400 animate-pulse') : (isSelected ? 'bg-white/10' : 'bg-gray-100')
                                }`} style={{ animationDelay: `${i * 0.2}s` }}></div>
                        ))}
                    </div>
                </div>
            </div>

            <h4 className={`text-sm font-black mb-1 truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>{job.name}</h4>
            <p className={`text-[10px] font-bold mb-4 ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>{job.baseModel}</p>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${isSelected ? 'text-white' : ''}`}>Loss</p>
                    <p className="text-sm font-mono font-black">{job.loss === 'N/A' ? '--' : job.loss}</p>
                </div>
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${isSelected ? 'text-white' : ''}`}>Tokens/s</p>
                    <p className="text-sm font-mono font-black">{job.throughput === 'N/A' ? '--' : job.throughput.split(' ')[0]}</p>
                </div>
            </div>

            {/* Micro Sparkline Simulation */}
            <div className="mt-4 h-8 flex items-end gap-1 opacity-40">
                {job.history.slice(-12).map((h, i) => (
                    <div
                        key={i}
                        className={`flex-1 rounded-t-sm ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}
                        style={{ height: `${Math.min(100, Math.max(10, 100 - (h.loss * 20)))}%` }}
                    ></div>
                ))}
            </div>
        </div>
    );
};

const TrainingObservability = () => {
    const [selectedJobId, setSelectedJobId] = useState(mockTrainingJobs[0].id);
    const selectedJob = mockTrainingJobs.find(job => job.id === selectedJobId);

    const activeJobs = mockTrainingJobs.filter(j => j.status === 'Running').length;
    const completedJobs = mockTrainingJobs.filter(j => j.status === 'Completed').length;

    // Multi-job loss comparison data
    const comparisonData = useMemo(() => {
        const maxLength = Math.max(...mockTrainingJobs.map(j => j.history.length));
        return Array.from({ length: maxLength }, (_, i) => {
            const entry: any = { step: i * 10 };
            mockTrainingJobs.forEach(job => {
                if (job.history[i]) {
                    entry[job.id] = job.history[i].loss;
                }
            });
            return entry;
        });
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Fleet Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: '正在运行任务', value: activeJobs, color: 'text-blue-600', icon: ICONS.play },
                    { label: '累计处理 Token', value: '27.5B', color: 'text-indigo-600', icon: ICONS.chart },
                    { label: '算力节点负载', value: '88%', color: 'text-purple-600', icon: ICONS.cog },
                    { label: '完成/异常', value: `${completedJobs} / 1`, color: 'text-green-600', icon: ICONS.check },
                ].map(stat => (
                    <div key={stat.label} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${stat.color}`}>
                            <Icon path={stat.icon} className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left: Job Matrix */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">全量训练任务列表</h3>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{mockTrainingJobs.length} TOTAL</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
                        {mockTrainingJobs.map(job => (
                            <JobHealthCard
                                key={job.id}
                                job={job}
                                isSelected={selectedJobId === job.id}
                                onSelect={setSelectedJobId}
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Comparative Analysis & Details */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Comparative Loss Convergence */}
                    <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-[40px] p-8 shadow-sm">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">任务收敛对比 / Loss Convergence Baseline</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={comparisonData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="step" tick={{ fontSize: 10, fontWeight: 900, fill: '#6b7280' }} />
                                    <YAxis tick={{ fontSize: 10, fontWeight: 900, fill: '#6b7280' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                                    />
                                    {mockTrainingJobs.map((job, idx) => (
                                        <Line
                                            key={job.id}
                                            type="monotone"
                                            dataKey={job.id}
                                            name={job.name}
                                            stroke={idx === 0 ? '#4f46e5' : idx === 1 ? '#10b981' : idx === 2 ? '#ef4444' : '#f59e0b'}
                                            strokeWidth={selectedJobId === job.id ? 4 : 2}
                                            dot={false}
                                            opacity={selectedJobId === job.id ? 1 : 0.3}
                                            strokeDasharray={job.status === 'Running' ? '0' : '5 5'}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Drill-down Detail View */}
                    {selectedJob && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-gray-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden mb-6">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                        深度解析 / Deep Insights: {selectedJob.name}
                                    </h3>
                                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
                                        Open SwanLab Panel
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">训练算力</p>
                                        <p className="text-lg font-black">{selectedJob.gpus}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">累计时长</p>
                                        <p className="text-lg font-black">{selectedJob.duration}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">吞吐量</p>
                                        <p className="text-lg font-black">{selectedJob.throughput}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">状态</p>
                                        <p className="text-lg font-black text-indigo-400">{selectedJob.status}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SystemMonitoring = () => {
    return <GPUClusterMonitoring />;
};

const LogCenter = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const logLevels = { INFO: 'bg-blue-100 text-blue-800', WARN: 'bg-yellow-100 text-yellow-800', ERROR: 'bg-red-100 text-red-800' };

    const filteredLogs = useMemo(() => {
        return mockLogs.filter(log => log.message.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex-grow relative">
                    <Icon path={ICONS.search} className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="搜索日志..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
                <SelectField label="" options={['Source: All', 'Training', 'Inference', 'System', 'Data']} />
                <SelectField label="" options={['Last 15 minutes', 'Last hour', 'Last 24 hours']} />
            </div>
            <div className="bg-white p-2 rounded-xl border border-gray-200 h-[65vh] overflow-y-auto">
                <table className="w-full text-sm font-mono">
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="p-2 text-gray-400 whitespace-nowrap">{log.time}</td>
                                <td className="p-2 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${logLevels[log.level]}`}>{log.level}</span>
                                </td>
                                <td className="p-2 text-purple-600 whitespace-nowrap">[{log.source}]</td>
                                <td className="p-2 text-gray-700 w-full">{log.message}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export const ObservabilityPlatform = () => {
    const tabs = ['概览', '训练观测', '推理观测', '系统监控', '日志中心'];
    const tabIcons = {
        '概览': ICONS.dashboard,
        '训练观测': ICONS.training,
        '推理观测': ICONS.inference,
        '系统监控': ICONS.chartBar,
        '日志中心': ICONS.tasks,
    };

    const [activeTab, setActiveTab] = useState(tabs[0]);

    const renderContent = () => {
        switch (activeTab) {
            case '概览': return <OverviewDashboard />;
            case '训练观测': return <TrainingObservability />;
            case '推理观测': return <InferenceObservability />;
            case '系统监控': return <SystemMonitoring />;
            case '日志中心': return <LogCenter />;
            default: return null;
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">观测性平台</h1>
                <p className="mt-2 text-gray-600">统一监控、追踪与分析训练、推理与系统日志。</p>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                    {tabs.map(tab => (
                        <TabButton key={tab} name={tab} icon={tabIcons[tab]} activeTab={activeTab} setActiveTab={setActiveTab} />
                    ))}
                </nav>
            </div>

            <div className="pt-4">
                {renderContent()}
            </div>
        </div>
    );
};