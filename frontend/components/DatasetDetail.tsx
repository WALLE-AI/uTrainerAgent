/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Icon, ICONS, Tag, tagColors, statusColors } from './shared';

export const DatasetDetail = ({ dataset, onBack, onUpdate, onRecycle, onNavigate }) => {
    const qualityData = [{ name: 'quality', value: dataset.quality }];

    const handleRemoveTag = (tagToRemove) => {
        const newTags = dataset.tags.filter(tag => tag !== tagToRemove);
        onUpdate({ ...dataset, tags: newTags });
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.value) {
            e.preventDefault();
            const newTag = e.target.value.trim();
            if (newTag && !dataset.tags.includes(newTag)) {
                const newTags = [...dataset.tags, newTag];
                onUpdate({ ...dataset, tags: newTags });
            }
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-8 animate-slide-in-right pb-12">
            <div>
                <button onClick={onBack} className="flex items-center space-x-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors mb-4 group">
                    <Icon path={ICONS.arrowLeft} className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>返回资产库</span>
                </button>
                <div className="flex justify-between items-end border-b border-gray-100 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Tag color={statusColors[dataset.status]} text={dataset.status} />
                            <span className="text-gray-400 font-mono text-xs">ID: {dataset.name.toUpperCase().replace(/-/g, '_')}</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{dataset.name}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onNavigate('训练', { action: 'create', datasetName: dataset.name })}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-xl shadow-indigo-100 transition-all active:scale-95"
                        >
                            <Icon path={ICONS.training} className="w-4 h-4" />
                            立即训练
                        </button>
                        <button
                            onClick={onRecycle}
                            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-6 py-2.5 rounded-xl text-sm transition-all active:scale-95"
                        >
                            <Icon path={ICONS.pipeline} className="w-4 h-4" />
                            再次加工 (Lab)
                        </button>
                    </div>
                </div>
            </div>

            {/* Lineage / Bloodline Visualization */}
            <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 shadow-inner">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">数据血缘 / Data Lineage</h3>
                <div className="flex items-center gap-4">
                    <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Icon path={ICONS.upload} className="w-5 h-5" /></div>
                        <div><p className="text-xs font-bold text-gray-800">Source: Local Upload</p><p className="text-[10px] text-gray-400">2024-07-30 10:00</p></div>
                    </div>
                    <Icon path={ICONS.plus} className="w-4 h-4 text-gray-300 rotate-45" />
                    <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Icon path={ICONS.beaker} className="w-5 h-5" /></div>
                        <div><p className="text-xs font-bold text-gray-800">Task: PII Anonymization</p><p className="text-[10px] text-gray-400">Completed in 12s</p></div>
                    </div>
                    <Icon path={ICONS.plus} className="w-4 h-4 text-gray-300 rotate-45" />
                    <div className="flex-1 bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/30 shadow-sm flex items-center gap-3 ring-2 ring-indigo-500 ring-opacity-10">
                        <div className="p-2 bg-indigo-600 text-white rounded-lg"><Icon path={ICONS.data} className="w-5 h-5" /></div>
                        <div><p className="text-xs font-bold text-indigo-900">Current: {dataset.version}</p><p className="text-[10px] text-indigo-400">Ready for Training</p></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-black text-gray-900 uppercase tracking-tight">资产规格 / Specifications</h2>
                            <span className="text-xs font-mono text-gray-400">MODALITY: {dataset.modality || 'TEXT'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">样本数量</p><p className="text-2xl font-black text-gray-900">{dataset.samples}</p></div>
                            <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">物理大小</p><p className="text-2xl font-black text-gray-900">{dataset.size}</p></div>
                        </div>
                        <div className="mt-8">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">详情描述</p>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                这是一个关于 {dataset.name} 的详细描述。该数据集主要用于 {dataset.tags.join(', ')} 任务。通过深度清洗与 PII 去隐私处理，包含高指令密度的对话数据。
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h2 className="font-black text-gray-900 uppercase tracking-tight mb-6">数据预览 / Data Inspection</h2>
                        <div className="overflow-hidden rounded-2xl border border-gray-100">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr className="text-[10px] font-black text-gray-400 uppercase">
                                        <th className="p-4">Instruction</th>
                                        <th className="p-4">Output Preview</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-50">
                                    <tr><td className="p-4 font-medium text-gray-700">"天空为什么是蓝色的？"</td><td className="p-4 text-gray-500">"瑞利散射是指太阳光经大气层..."</td></tr>
                                    <tr><td className="p-4 font-medium text-gray-700">"写一首关于春天的诗"</td><td className="p-4 text-gray-500">"春风拂面绿意浓，柳丝轻摇..."</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <h2 className="font-black text-gray-900 uppercase tracking-tight mb-6 w-full">质量指数</h2>
                        <ResponsiveContainer width="100%" height={160}>
                            <RadialBarChart innerRadius="70%" outerRadius="90%" data={qualityData} startAngle={90} endAngle={-270}>
                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                <RadialBar background dataKey='value' cornerRadius={10} fill="#4f46e5" />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-black fill-gray-900">{dataset.quality}</text>
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <p className="text-[10px] font-bold text-gray-400 mt-4">综合评估: <span className="text-green-600">EXCELLENT</span></p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h2 className="font-black text-gray-900 uppercase tracking-tight mb-6">分类标签 / Tags</h2>
                        <div className="flex flex-wrap gap-2">
                            {dataset.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gray-50 text-gray-700 border border-gray-100 group">
                                    {tag}
                                    <button onClick={() => handleRemoveTag(tag)} className="text-gray-300 hover:text-red-500 transition-colors">
                                        <Icon path={ICONS.close} className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                placeholder="+ Add"
                                onKeyDown={handleTagKeyDown}
                                className="bg-gray-50/50 border border-dashed border-gray-200 rounded-xl text-xs px-3 py-1.5 focus:border-indigo-500 outline-none w-20 transition-all focus:w-28"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};