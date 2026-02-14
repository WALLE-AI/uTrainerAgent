/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
// import { Icon, ICONS } from './shared'; // Removed unused imports

const modelWeights = [
    { id: 'MW-001', name: 'llama3-7b-sft-med', base: 'Llama-3-7B', size: '14.5GB', files: 12, date: '2024-05-20', status: 'Healthy' },
    { id: 'MW-002', name: 'qwen-14b-dpo-legal', base: 'Qwen-14B', size: '28.2GB', files: 24, date: '2024-05-19', status: 'Healthy' },
    { id: 'MW-003', name: 'mistral-7b-v0.3-fine', base: 'Mistral-7B', size: '13.8GB', files: 8, date: '2024-05-18', status: 'Healthy' },
    { id: 'MW-004', name: 'yi-34b-chat-alpha', base: 'Yi-34B', size: '68.5GB', files: 42, date: '2024-05-17', status: 'Optimizing' },
];

export const ModelWeights: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        模型权重资产 <span className="text-indigo-600">Weights</span>
                    </h1>
                    <p className="mt-2 text-slate-500 font-medium text-xs">管理已完成训练的模型权重、检查点与磁盘占用情况。</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Storage</p>
                        <p className="text-2xl font-black text-slate-900 leading-none mt-1">125.0 GB</p>
                    </div>
                </div>
            </header>

            <div className="bg-white/70 backdrop-blur-xl border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">模型名称 Model Name</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">基础模型 Base</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">磁盘占用 Size</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">文件数量 Files</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">状态 Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">保存日期 Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {modelWeights.map(weight => (
                            <tr key={weight.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-black text-slate-900">{weight.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{weight.id}</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                        {weight.base}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-mono text-xs font-bold text-slate-700">{weight.size}</td>
                                <td className="px-6 py-4 text-center font-mono text-xs text-slate-500">{weight.files} items</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${weight.status === 'Healthy' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600 animate-pulse'}`}>
                                        {weight.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-slate-400 font-medium">{weight.date}</span>
                                        <button className="mt-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                            Deploy Now →
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {[
                    { label: 'Checkpoints Total', value: '156' },
                    { label: 'Avg Size/Model', value: '31.2 GB' },
                    { label: 'Compression Ratio', value: '1.4x' }
                ].map((stat, i) => (
                    <div key={i} className="p-6 bg-slate-50/50 border border-slate-100 rounded-[32px]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
