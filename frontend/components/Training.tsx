/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Icon, ICONS } from './shared';
import { mockTrainingJobs } from '../api/mockData';
import { TrainingJobCard } from './TrainingJobCard';
import { NewTrainingWizard } from './NewTrainingWizard';
import { TrainingJobDetail } from './TrainingJobDetail';

const { useState, useEffect } = React;

export const Training = ({ params, onNavigate }) => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [isCreating, setIsCreating] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const filters = [
        { label: '全部', value: 'All' },
        { label: '运行中', value: 'Running' },
        { label: '已完成', value: 'Completed' },
        { label: '已失败', value: 'Failed' },
        { label: '等待中', value: 'Pending' }
    ];

    useEffect(() => {
        if (params?.action === 'create') {
            setIsCreating(true);
        }
    }, [params]);

    const filteredJobs = mockTrainingJobs.filter(job => {
        if (activeFilter === 'All') return true;
        return job.status === activeFilter;
    });

    if (selectedJob) {
        return <TrainingJobDetail job={selectedJob} onBack={() => setSelectedJob(null)} />;
    }

    return (
        <div className="space-y-6 pt-2">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">模型训练</h1>
                    <p className="text-gray-500 font-medium text-xs mt-1">分布式模型训练中心，支持大规模异构算力调度。</p>
                </div>

                <div className="flex items-center gap-6 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm backdrop-blur-md">
                    <div className="px-4 py-1.5 bg-indigo-50 rounded-xl border border-indigo-100/50">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">活跃任务 Active Jobs</p>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            <p className="text-lg font-black text-indigo-700">12</p>
                        </div>
                    </div>
                    <div className="px-4 py-1.5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">平均 Loss 趋势 Trend</p>
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-black text-gray-900">0.824</p>
                            <span className="text-[10px] font-bold text-green-500 bg-green-50 px-1 rounded">-12.5%</span>
                        </div>
                    </div>
                    <div className="px-4 py-1.5 border-x border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">算力利用率 GPU Eff</p>
                        <p className="text-lg font-black text-gray-900">92<span className="text-xs ml-0.5">%</span></p>
                    </div>
                    <div className="px-4 py-1.5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">当日消耗 Daily Tokens</p>
                        <p className="text-lg font-black text-indigo-600">8.4<span className="text-xs ml-0.5">B</span></p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Icon path={ICONS.search} className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="搜索实验 ID 或任务名称..." className="bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-xs font-bold w-72 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 shadow-inner" />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100/50 rounded-xl border border-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">排序 Order</span>
                        <select className="bg-transparent text-[11px] font-bold text-gray-700 focus:outline-none">
                            <option>创建时间 (最近)</option>
                            <option>运行状态</option>
                            <option>Loss (从小到大)</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-black px-6 py-2.5 rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-gray-200 transition-all active:scale-95"
                >
                    <Icon path={ICONS.plus} className="w-4 h-4" />
                    启动新训练实验
                </button>
            </div>

            <div className="flex items-center gap-4 py-2 border-b border-gray-100/50">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">状态筛选</span>
                <div className="flex items-center p-1 bg-gray-100/80 rounded-xl border border-gray-100/50 shadow-sm backdrop-blur-sm">
                    {filters.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setActiveFilter(f.value)}
                            className={`px-6 py-1.5 text-[13px] font-black tracking-tight rounded-lg transition-all duration-300 ${activeFilter === f.value
                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                    <TrainingJobCard key={job.id} job={job} onSelect={() => setSelectedJob(job)} />
                ))}
                {filteredJobs.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        <Icon path={ICONS.observability} className="w-12 h-12 mx-auto text-gray-300" />
                        <h3 className="mt-2 text-lg font-medium">没有找到训练任务</h3>
                        <p className="mt-1 text-sm">尝试更改筛选条件或创建一个新的训练任务。</p>
                    </div>
                )}
            </div>
            <NewTrainingWizard isOpen={isCreating} onClose={() => setIsCreating(false)} initialDatasetName={params?.datasetName} />
        </div>
    );
};