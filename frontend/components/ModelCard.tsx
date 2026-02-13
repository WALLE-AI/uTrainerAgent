/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Icon, ICONS, Tag, Toggle } from './shared';
const { useState } = React;


// Fix: Use React.FC to correctly type the component for use in lists with a 'key' prop.
export const ModelCard: React.FC<{ deployment: any, onDelete?: () => void }> = ({ deployment, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const statusClass = deployment.status === 'Healthy' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';

    // Fix: Used React.FC to correctly type the component and its children prop.
    const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div>
            <h4 className="font-semibold text-gray-600 mb-3">{title}</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">{children}</div>
        </div>
    );
    // Fix: Add explicit prop types for DetailItem component using React.FC for consistency.
    const DetailItem: React.FC<{ label: React.ReactNode; value: React.ReactNode; }> = ({ label, value }) => (
        <div className="flex justify-between items-center">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-800">{value}</span>
        </div>
    );

    return (
        <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 group relative overflow-hidden">
            <div className="p-5 cursor-pointer hover:bg-gray-50/80 rounded-t-[20px] transition-all group-hover:bg-indigo-50/5" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-200 group-hover:rotate-3 transition-transform">
                            <Icon path={ICONS.inference} className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-black text-lg text-gray-900 tracking-tight">{deployment.name}</h3>
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${deployment.status === 'Healthy' ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-orange-100 text-orange-600 border border-orange-200'
                                    }`}>
                                    {deployment.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
                                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/50 uppercase tracking-tighter">{deployment.runtime}</span>
                                <span className="truncate max-w-[300px] border-l border-gray-200 pl-3">{deployment.model}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 pr-2">
                        <div className="flex gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Throughput</p>
                                <p className="text-sm font-black text-gray-900">{deployment.metrics.qps} QPS</p>
                            </div>
                            <div className="text-right border-l border-gray-100 pl-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Latency P95</p>
                                <p className="text-sm font-black text-gray-900">{deployment.metrics.p95}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 ml-4">
                            {[0, 1].map(index => (
                                <div key={index} className="flex flex-col items-center gap-1">
                                    <div className={`w-6 h-3 rounded-sm border ${deployment.status === 'Healthy' ? 'bg-green-500 border-green-600 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-orange-500 border-orange-600'}`}></div>
                                    <span className="text-[8px] font-black text-gray-400 uppercase">GPU {index}</span>
                                </div>
                            ))}
                        </div>

                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-colors">
                            <Icon path={isOpen ? ICONS.chevronUp : ICONS.chevronDown} className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="p-6 border-t border-gray-200 bg-gray-50/70 space-y-6">
                    <DetailSection title="实例参数">
                        <DetailItem label="运行时" value={deployment.runtime} />
                        <DetailItem label="并发上限" value={deployment.params.concurrency} />
                        <DetailItem label="批处理" value={deployment.params.batching} />
                        <DetailItem label="KV Cache" value={deployment.params.kvCache} />
                        <DetailItem label="Tensor Parallel" value={deployment.params.tensorParallel} />
                        <div className="flex justify-between items-center col-span-1">
                            <span className="text-gray-500">Speculative Decoding</span>
                            <Toggle enabled={deployment.params.speculativeDecoding} setEnabled={() => { }} />
                        </div>
                    </DetailSection>
                    <DetailSection title="路由">
                        <DetailItem label="权重" value={`${deployment.routing.weight}%`} />
                        <DetailItem label="健康检查" value={deployment.routing.healthCheck} />
                        <DetailItem label="A/B/灰度" value={deployment.routing.abTest} />
                        <DetailItem label="限流" value={deployment.routing.rateLimit} />
                        <div className="flex justify-between items-center col-span-1">
                            <span className="text-gray-500">熔断与重试</span>
                            <Toggle enabled={deployment.routing.circuitBreaker} setEnabled={() => { }} />
                        </div>
                    </DetailSection>
                    <div className="flex justify-end pt-4 gap-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.();
                            }}
                            className="text-sm font-semibold text-gray-600 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                        >
                            删除
                        </button>
                        <button className="text-sm font-semibold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700">保存修改</button>
                    </div>
                </div>
            )}
        </div>
    );
};