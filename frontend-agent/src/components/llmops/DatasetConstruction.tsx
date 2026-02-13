/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, ICONS, Tag, tagColors } from './shared';

const flows = [
    {
        id: 'enhance',
        title: '已存数据集增强',
        subtitle: 'Enhance Existing Dataset',
        description: '通过 LLM 对现有语料进行指令增强、清洗和改写。',
        icon: ICONS.augment,
        color: 'bg-indigo-500',
        tags: ['SFT', 'DPO', 'Cleaning']
    },
    {
        id: 'kb-synthesis',
        title: '知识库原子合成',
        subtitle: 'Atomic Data Synthesis',
        description: '基于知识库或原始文档自动合成高质量原子指令对。',
        icon: ICONS.pipeline,
        color: 'bg-emerald-500',
        tags: ['RAG', 'Synthesis', 'Instruction']
    },
    {
        id: 'vision-annotation',
        title: '多模态视觉标注',
        subtitle: 'Multimodal Vision Annotation',
        description: '自动化视觉任务数据构建，支持目标检测与描述合成。',
        icon: ICONS.observability,
        color: 'bg-amber-500',
        tags: ['Vision', 'VQA', 'OCR']
    },
    {
        id: 'vqa-synthesis',
        title: 'VQA 问答对合成',
        subtitle: 'VQA/Caption Synthesis',
        description: '分析图像内容并自动生成图文对齐的高质量问答数据。',
        icon: ICONS.inference,
        color: 'bg-rose-500',
        tags: ['Video', 'Image', 'Detailed']
    }
];

const strategies = [
    { id: 'alpaca', name: 'Alpaca+', desc: '基础指令遵循增强' },
    { id: 'evol-instruct', name: 'Evol-Instruct', desc: '复杂度渐进式扩增' },
    { id: 'magpie', name: 'Magpie Self-gen', desc: '全自动流水线式合成' },
    { id: 'distilabel', name: 'Distilabel', desc: '多模型协同蒸馏' }
];

export const DatasetConstruction: React.FC = () => {
    const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
    const [step, setStep] = useState<'selection' | 'execution'>('selection');

    const handleStart = () => {
        setStep('execution');
    };

    if (step === 'execution') {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setStep('selection')}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <Icon path={ICONS.arrowLeft} className="w-5 h-5 text-slate-400" />
                        </button>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                                流水线执行: <span className="text-indigo-600">Atomic Synthesis</span>
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Executing Data Synthesis Pipeline - v1.0.4</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Tasks', value: '45,000' },
                        { label: 'Completed', value: '12,450' },
                        { label: 'Quality Score', value: '0.84' },
                        { label: 'Est. Time', value: '04:22:15' }
                    ].map((stat, i) => (
                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">实时执行序列 / Real-time Execution</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pipeline Running</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {[
                            { name: 'Document Chunking', progress: 100, status: 'Done' },
                            { name: 'Atomic Knowledge Extraction', progress: 65, status: 'Active' },
                            { name: 'Instruction Generation', progress: 0, status: 'Pending' },
                            { name: 'Quality Assessment', progress: 0, status: 'Pending' }
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider">
                                    <span className={item.status === 'Done' ? 'text-slate-400' : 'text-slate-800'}>{item.name}</span>
                                    <span className={item.status === 'Active' ? 'text-indigo-600' : 'text-slate-400'}>{item.progress}%</span>
                                </div>
                                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.progress}%` }}
                                        className={`h-full rounded-full ${item.status === 'Done' ? 'bg-slate-200' : 'bg-indigo-600 font-bold'}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all">
                        停止执行 / Stop execution
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        数据集构建工作室 <br /><span className="text-indigo-600">Studio</span>
                    </h1>
                    <p className="mt-4 text-slate-500 font-medium text-sm max-w-lg">
                        使用 SOTA 合成技术与 LLM 指令增强方案，构建属于你的高质量、私域化的模型训练语料。
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Generated</p>
                        <p className="text-2xl font-black text-slate-900 leading-none mt-1">1.28M</p>
                    </div>
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {flows.map((flow) => (
                    <motion.button
                        key={flow.id}
                        whileHover={{ y: -8, scale: 1.02 }}
                        onClick={() => setSelectedFlow(flow.id)}
                        className={`p-8 rounded-[40px] border text-left transition-all relative group overflow-hidden ${selectedFlow === flow.id
                                ? 'bg-slate-900 border-slate-900 text-white shadow-2xl shadow-indigo-200 lg:scale-[1.05]'
                                : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'
                            }`}
                    >
                        {selectedFlow === flow.id && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full -mr-16 -mt-16 animate-pulse" />
                        )}
                        <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-all duration-500 ${selectedFlow === flow.id ? 'bg-white/10 rotate-6 scale-110' : 'bg-slate-50 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                            }`}>
                            <Icon path={flow.icon} className="w-7 h-7" />
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedFlow === flow.id ? 'text-indigo-400' : 'text-slate-400'}`}>
                            {flow.subtitle}
                        </p>
                        <h3 className="text-lg font-black tracking-tight mb-2 leading-none uppercase">{flow.title}</h3>
                        <p className={`text-[11px] leading-relaxed mb-6 font-medium ${selectedFlow === flow.id ? 'text-slate-300' : 'text-slate-400'}`}>
                            {flow.description}
                        </p>
                        <div className="flex gap-2">
                            {flow.tags.map((tag) => (
                                <Tag key={tag} text={tag} color={selectedFlow === flow.id ? 'bg-white/10 text-white' : tagColors[tag as keyof typeof tagColors] || 'bg-slate-100'} />
                            ))}
                        </div>
                    </motion.button>
                ))}
            </section>

            <AnimatePresence>
                {selectedFlow && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-slate-50 border border-slate-100 rounded-[48px] p-10 lg:p-14 shadow-sm"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-8 space-y-8">
                                <div>
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6">选择构建策略 / Selecting Strategy</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {strategies.map((strategy) => (
                                            <button
                                                key={strategy.id}
                                                className="p-6 bg-white border border-slate-100 rounded-3xl text-left hover:border-indigo-600 transition-all hover:shadow-xl hover:shadow-indigo-50 group active:scale-[0.98]"
                                            >
                                                <div className="flex justify-between items-start mb-2 font-bold uppercase tracking-tight">
                                                    <span className="text-slate-800">{strategy.name}</span>
                                                    <div className="w-5 h-5 rounded-full border border-slate-200 group-hover:border-indigo-600 transition-colors" />
                                                </div>
                                                <p className="text-[11px] text-slate-400 font-medium">{strategy.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">指定语料源 / Corpus Source</h3>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="HuggingFace Repo ID or Local Path..."
                                            className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-300 transition-all shadow-sm"
                                        />
                                        <button className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Browse</button>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-4 flex flex-col justify-end">
                                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl space-y-6">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">预估成本 / Estimation</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-slate-400">Tokens</span>
                                            <span className="text-slate-900 font-bold">~15.4M</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-slate-400">Time (8x H800)</span>
                                            <span className="text-slate-900 font-bold">~2.5h</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleStart}
                                        className="w-full py-5 bg-indigo-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        立即开启工作流 / Launch Workflow
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
