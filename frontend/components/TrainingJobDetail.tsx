/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Icon, ICONS, Tag } from './shared';
import { MetricChart } from './MetricChart';
import { KpiCard } from './KpiCard';

const { useState } = React;

const statusStyles = {
    Running: { color: 'bg-blue-100 text-blue-800', icon: ICONS.training, iconBg: 'bg-blue-500' },
    Completed: { color: 'bg-green-100 text-green-800', icon: ICONS.shield, iconBg: 'bg-green-500' },
    Failed: { color: 'bg-red-100 text-red-800', icon: ICONS.close, iconBg: 'bg-red-500' },
    Pending: { color: 'bg-yellow-100 text-yellow-800', icon: ICONS.clock, iconBg: 'bg-yellow-500' },
};

const TabButton = ({ name, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(name)}
        className={`whitespace-nowrap py-3 px-4 font-medium text-sm transition-colors rounded-t-lg
            ${activeTab === name
                ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
    >
        {name}
    </button>
);

const ArtifactsContent = ({ job }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="font-semibold text-gray-800 mb-4">产物: Checkpoints</h2>
        {job.artifacts && job.artifacts.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="p-3">名称</th>
                            <th className="p-3">大小</th>
                            <th className="p-3">创建于</th>
                            <th className="p-3 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {job.artifacts.map(artifact => (
                            <tr key={artifact.name} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium text-gray-800">{artifact.name}</td>
                                <td className="p-3">{artifact.size}</td>
                                <td className="p-3">{artifact.createdAt}</td>
                                <td className="p-3 text-right space-x-2">
                                    <button className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-indigo-600 transition-colors">
                                        <Icon path={ICONS.download} className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-indigo-600 transition-colors">
                                        <Icon path={ICONS.upload} className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="text-center py-8 text-gray-500">
                <Icon path={ICONS.data} className="w-12 h-12 mx-auto text-gray-300" />
                <h3 className="mt-2 text-lg font-medium">没有产物</h3>
                <p className="mt-1 text-sm">该任务尚未生成任何 checkpoint。</p>
            </div>
        )}
    </div>
);

type TrainingJobDetailProps = {
    job: any;
    onBack: () => void;
    isEmbedded?: boolean;
};

export const TrainingJobDetail: React.FC<TrainingJobDetailProps> = ({ job, onBack, isEmbedded = false }) => {
    const status = statusStyles[job.status] || { color: 'bg-gray-100 text-gray-800', icon: ICONS.cog, iconBg: 'bg-gray-500' };
    const [activeTab, setActiveTab] = useState('指标');

    const kpis = [
        { title: '状态', value: <Tag text={job.status} color={status.color} />, icon: status.icon, iconBgColor: status.iconBg },
        { title: '运行时长', value: job.duration, icon: ICONS.clock, iconBgColor: 'bg-purple-500' },
        { title: '总 Tokens', value: job.totalTokens, icon: ICONS.data, iconBgColor: 'bg-yellow-500' },
        { title: 'Token 吞吐量', value: job.throughput, icon: ICONS.dashboard, iconBgColor: 'bg-sky-500' },
    ];

    const renderTabContent = () => {
        if (!job.history || job.history.length === 0) {
            return (
                <div className="col-span-full text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200">
                    <Icon path={ICONS.chartBar} className="w-12 h-12 mx-auto text-gray-300" />
                    <h3 className="mt-2 text-lg font-medium">暂无指标数据</h3>
                    <p className="mt-1 text-sm">任务正在等待或尚未开始记录指标。</p>
                </div>
            );
        }

        switch (activeTab) {
            case '指标':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MetricChart title="训练 vs. 验证 Loss" data={job.history} xKey="step" yKey="loss" yUnit="损失" stroke="#ef4444" />
                        <MetricChart title="学习率对比 Steps" data={job.history} xKey="step" yKey="learning_rate" yUnit="学习率" stroke="#3b82f6" />
                        <MetricChart title="梯度范数对比 Steps" data={job.history} xKey="step" yKey="grad_norm" yUnit="范数" stroke="#84cc16" />
                        <MetricChart title="Token 吞吐量对比 Steps" data={job.history} xKey="step" yKey="throughput" yUnit="Token/秒" stroke="#a855f7" />
                    </div>
                );
            case '资源':
            case 'GPU监控':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MetricChart title="GPU 利用率 (%)" data={job.history} xKey="step" yKey="gpu_utilization" yUnit="%" stroke="#f97316" />
                        <MetricChart title="GPU 显存占用 (%)" data={job.history} xKey="step" yKey="gpu_memory_usage" yUnit="%" stroke="#14b8a6" />
                        <MetricChart title="GPU 温度 (°C)" data={job.history} xKey="step" yKey="gpu_temp" yUnit="°C" stroke="#dc2626" />
                        <MetricChart title="网络带宽 (MB/s)" data={job.history} xKey="step" yKey="network_bw" yUnit="MB/s" stroke="#6366f1" />
                    </div>
                );
            case '产物':
            case '模型保存':
                return <ArtifactsContent job={job} />;
            case '概覽':
            case '任务配置':
                return (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 backdrop-blur-sm">
                        <h2 className="font-semibold text-gray-800 mb-4">任务配置</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            <div><p className="text-gray-500">基础模型</p><p className="font-medium text-gray-800 mt-1">{job.baseModel}</p></div>
                            <div><p className="text-gray-500">数据集</p><p className="font-medium text-gray-800 mt-1">{job.dataset}</p></div>
                            <div><p className="text-gray-500">GPU 资源</p><p className="font-medium text-gray-800 mt-1">{job.gpus}</p></div>
                            <div><p className="text-gray-500">创建于</p><p className="font-medium text-gray-800 mt-1">{job.createdAt}</p></div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8">
            {!isEmbedded && (
                <div>
                    <button onClick={onBack} className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors mb-4">
                        <Icon path={ICONS.arrowLeft} className="w-4 h-4" />
                        <span>返回训练任务列表</span>
                    </button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">{job.name}</h1>
                        <div className="flex items-center gap-2">
                            <button className="text-sm font-semibold text-gray-600 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">查看日志</button>
                            <button className="text-sm font-semibold text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700">停止任务</button>
                        </div>
                    </div>
                </div>
            )}

            {!isEmbedded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
                </div>
            )}

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                    <TabButton name="指标" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton name="GPU监控" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton name="模型保存" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton name="任务配置" activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </div>

            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};