/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { EnginesAndInstances } from './EnginesAndInstances';
import { Playground } from './Playground';
import { NewDeploymentModal } from './NewDeploymentModal';
import { Icon, ICONS } from './shared';
import { mockDeployments } from '../api/mockData';

const { useState } = React;

export const ModelDeployment = () => {
    const tabs = ['引擎与实例', '调试台'];
    const tabIcons = {
        '引擎与实例': ICONS.cog,
        '调试台': ICONS.chatBubble,
    };
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [isCreating, setIsCreating] = useState(false);
    const [deployments, setDeployments] = useState(mockDeployments);

    const handleDeploy = (newService) => {
        const newDeployment = {
            id: Date.now(),
            name: newService.name || `new-service-${Date.now().toString().slice(-4)}`,
            model: newService.model,
            status: 'Healthy',
            runtime: newService.engine,
            params: {
                concurrency: 16,
                batching: 'Continuous',
                kvCache: '8GB',
                tensorParallel: 1,
                speculativeDecoding: true
            },
            routing: {
                weight: 100,
                healthCheck: '/health',
                abTest: 'main',
                circuitBreaker: false,
                rateLimit: '1000/m'
            },
            metrics: {
                qps: 0,
                p95: '0ms',
                throughput: '0 t/s',
                errorRate: '0%'
            }
        };
        setDeployments([newDeployment, ...deployments]);
        setIsCreating(false);
    };

    const handleDeleteDeployment = (id) => {
        setDeployments(deployments.filter(d => d.id !== id));
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case '引擎与实例':
                return (
                    <EnginesAndInstances
                        deployments={deployments}
                        openCreationModal={() => setIsCreating(true)}
                        onDelete={handleDeleteDeployment}
                    />
                );
            case '调试台':
                return <Playground deployments={deployments} />;
            default:
                return null;
        }
    }

    return (
        <div className="space-y-6 pt-2">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">模型部署</h1>
                    <p className="text-gray-500 font-medium text-xs mt-1">工业级推理基础设施，支持分布式负载均衡与热更新。</p>
                </div>

                <div className="flex items-center gap-6 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm backdrop-blur-md">
                    <div className="px-4 py-1.5 bg-green-50 rounded-xl border border-green-100/50">
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-0.5">节点健康度Status</p>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <p className="text-lg font-black text-green-700">99.9%</p>
                        </div>
                    </div>
                    <div className="px-4 py-1.5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">平均延迟 Avg Latency</p>
                        <p className="text-lg font-black text-gray-900">84<span className="text-xs ml-0.5">ms</span></p>
                    </div>
                    <div className="px-4 py-1.5 border-x border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">全局流量 Global QPS</p>
                        <p className="text-lg font-black text-gray-900">1.2K</p>
                    </div>
                    <div className="px-4 py-1.5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">请求错误率 Error Rate</p>
                        <p className="text-lg font-black text-red-500">0.02%</p>
                    </div>
                </div>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Icon path={tabIcons[tab]} className="w-5 h-5 mr-2" />
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="pt-4">
                {renderTabContent()}
            </div>
            <NewDeploymentModal
                isOpen={isCreating}
                onClose={() => setIsCreating(false)}
                onDeploy={handleDeploy}
            />
        </div>
    );
};