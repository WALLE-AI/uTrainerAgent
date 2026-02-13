import React from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, Loader2 } from 'lucide-react';

const ThoughtStream: React.FC = () => {
    const steps = [
        { title: '主题分析', desc: '解析您的学术背景与核心需求', status: 'complete' },
        { title: '文献检索', desc: '检索 Arxiv 与 Semantic Scholar (2023-2025)', status: 'complete' },
        { title: '结构生成', desc: '基于 12 个核心框架构建研究分类法', status: 'active' },
        { title: '正文草拟', desc: '生成论文摘要与背景介绍章节', status: 'pending' }
    ];

    return (
        <div className="p-6 flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    智能推理流
                </h3>
            </div>

            <div className="flex-1 space-y-0 relative">
                {steps.map((step, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx}
                        className="relative pl-6 border-l border-slate-200 pb-8 last:pb-0"
                    >
                        <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-brand-500 transition-colors" />
                        {step.status === 'active' && <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-brand-500 animate-ping" />}

                        <div className="flex items-start gap-4">
                            <div className={`mt-0.5 p-1.5 rounded-lg ${step.status === 'active' ? 'bg-brand-50 text-brand-600' :
                                step.status === 'complete' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                }`}>
                                {step.status === 'active' ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : step.status === 'complete' ? (
                                    <CheckCircle2 size={16} />
                                ) : (
                                    <Search size={16} />
                                )}
                            </div>
                            <div className="space-y-1">
                                <div className={`text-[14px] font-bold ${step.status === 'active' ? 'text-slate-900' :
                                    step.status === 'complete' ? 'text-slate-700' : 'text-slate-400'
                                    }`}>
                                    {step.title}
                                </div>
                                <p className="text-[12px] text-slate-500 leading-relaxed">
                                    {step.desc}
                                </p>
                                {step.status === 'active' && (
                                    <div className="mt-3 p-3 bg-slate-900 rounded-xl font-mono text-[10px] text-emerald-400 overflow-hidden shadow-lg">
                                        <div className="opacity-60 truncate">
                                            {'>'} sys.process_node(0xC42)
                                        </div>
                                        <div className="truncate">
                                            Generating structure nodes... Done.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ThoughtStream;
