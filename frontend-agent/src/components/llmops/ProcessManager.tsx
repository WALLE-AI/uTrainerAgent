/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    AreaChart, Area
} from 'recharts';
import { Icon, ICONS, Tag } from './shared';
import {
    mockDatasetTasks,
    mockTrainingTasks,
    mockInferenceTasks,
    type DatasetTask,
    type TrainingTask,
    type InferenceTask
} from '../../api/mockTasks';

const DatasetSection: React.FC<{ tasks: DatasetTask[] }> = ({ tasks }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tasks.map(task => (
                <div key={task.id} className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:border-indigo-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="font-black text-slate-900 uppercase tracking-tight">{task.name}</h4>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{task.id}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${task.status === 'Running' ? 'bg-emerald-100 text-emerald-600' :
                            task.status === 'Suspended' ? 'bg-amber-100 text-amber-600' :
                                'bg-red-100 text-red-600'
                            }`}>
                            {task.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="text-center p-2 bg-slate-50 rounded-2xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Disk</p>
                            <p className="text-xs font-black text-slate-800">{task.diskUsage}</p>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded-2xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rows</p>
                            <p className="text-xs font-black text-slate-800">{task.dataVolume}</p>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded-2xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tokens</p>
                            <p className="text-xs font-black text-slate-800">{task.tokens}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {task.stages.map((stage, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    <span>{stage.name}</span>
                                    <span>{stage.progress}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stage.progress}%` }}
                                        className={`h-full rounded-full ${stage.status === 'Done' ? 'bg-slate-300' :
                                            stage.status === 'Active' ? 'bg-indigo-600' :
                                                'bg-red-500'
                                            }`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const TrainingSection: React.FC<{ tasks: TrainingTask[] }> = ({ tasks }) => (
    <div className="space-y-8">
        {tasks.map(task => (
            <div key={task.id} className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Icon path={ICONS.training} className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{task.name}</h3>
                            <div className="flex gap-2 mt-1">
                                <Tag text={task.engine} color="bg-slate-100 text-slate-600" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Epoch {task.currentEpoch}/{task.totalEpochs} • Step {task.currentStep}/{task.totalSteps}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Loss</p>
                            <p className="text-xl font-black text-indigo-600">{(task.metrics[task.metrics.length - 1]?.loss || 0).toFixed(4)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[300px] mb-8">
                    <div className="bg-slate-50 rounded-[32px] p-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Training Loss</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={task.metrics}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="step" hide />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                                <Line type="monotone" dataKey="loss" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-slate-50 rounded-[32px] p-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Accuracy / LR</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={task.metrics}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="step" hide />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                                <Area type="monotone" dataKey="accuracy" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
                                <Area type="monotone" dataKey="learningRate" stroke="#f59e0b" fill="#f59e0b20" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
                    <h5 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Icon path={ICONS.bell} className="w-3 h-3" />
                        uTrainerAgent 运行预警分析
                    </h5>
                    <ul className="space-y-1">
                        {task.alerts.map((alert, idx) => (
                            <li key={idx} className="text-[11px] text-indigo-700 font-medium leading-relaxed">• {alert}</li>
                        ))}
                    </ul>
                </div>
            </div>
        ))}
    </div>
);

const InferenceSection: React.FC<{ tasks: InferenceTask[] }> = ({ tasks }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
                <div key={task.id} className="lg:col-span-1 bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h4 className="font-black text-slate-900 uppercase tracking-tight">{task.name}</h4>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{task.id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${task.status === 'Healthy' ? 'bg-emerald-100 text-emerald-600' :
                            task.status === 'Hanging' ? 'bg-amber-100 text-amber-600' :
                                'bg-red-100 text-red-600'
                            }`}>
                            {task.status}
                        </span>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Latency</span>
                            <span className="text-sm font-black text-slate-900">{task.latency}ms</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Throughput</span>
                            <span className="text-sm font-black text-slate-900">{task.throughput} req/s</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uptime</span>
                            <span className="text-sm font-black text-slate-900">{task.uptime}</span>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-4 h-[200px] flex flex-col">
                        <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Process Logs</h5>
                        <div className="flex-1 overflow-y-auto font-mono text-[9px] text-slate-300 space-y-1 custom-scrollbar">
                            {task.logs.map((log, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <span className="text-slate-600 shrink-0">{log.timestamp.split(' ')[1]}</span>
                                    <span className={log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-amber-400' : 'text-emerald-400'}>
                                        [{log.level}]
                                    </span>
                                    <span className="break-all">{log.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {task.status === 'Hanging' && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">检测到进程挂起，正在尝试自动重启...</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export const ProcessManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dataset' | 'training' | 'inference'>('dataset');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">后台任务中心 <br /><span className="text-indigo-600">Process Manager</span></h1>
                    <p className="mt-4 text-slate-500 font-medium text-sm">由 uTrainerAgent 驱动的实时任务追踪、监控与预警分析中心。</p>
                </div>
                <div className="flex gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Processes</p>
                        <p className="text-2xl font-black text-slate-900 leading-none mt-1">12</p>
                    </div>
                </div>
            </header>

            <div className="flex gap-2 p-1.5 bg-slate-100/50 rounded-2xl w-fit">
                {[
                    { id: 'dataset', label: '数据集任务', icon: ICONS.data },
                    { id: 'training', label: '训练监控', icon: ICONS.training },
                    { id: 'inference', label: '部署观察', icon: ICONS.inference },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Icon path={tab.icon} className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="mt-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'dataset' && (
                        <motion.div
                            key="dataset"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <DatasetSection tasks={mockDatasetTasks} />
                        </motion.div>
                    )}
                    {activeTab === 'training' && (
                        <motion.div
                            key="training"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <TrainingSection tasks={mockTrainingTasks} />
                        </motion.div>
                    )}
                    {activeTab === 'inference' && (
                        <motion.div
                            key="inference"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <InferenceSection tasks={mockInferenceTasks} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
