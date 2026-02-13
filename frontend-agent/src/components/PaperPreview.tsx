import React from 'react';
import { motion } from 'framer-motion';
import { FileDown, Maximize2, RefreshCcw, Eye } from 'lucide-react';

const PaperPreview: React.FC = () => {
    return (
        <div className="flex flex-col h-full bg-slate-900/10">
            {/* Toolbar */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2">
                    <Eye size={14} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-300">Preview: draft_v1.pdf</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-white/5 rounded transition-colors text-slate-400" title="Refresh">
                        <RefreshCcw size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-white/5 rounded transition-colors text-slate-400" title="Full Screen">
                        <Maximize2 size={14} />
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white transition-all">
                        <FileDown size={14} />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Document View */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#1e293b]/50 select-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mx-auto max-w-[400px] aspect-[1/1.41] bg-white text-slate-900 p-10 shadow-2xl relative overflow-hidden"
                >
                    {/* Subtle paper texture/overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />

                    <div className="text-center space-y-2 mb-10">
                        <h1 className="text-lg font-serif font-bold tracking-tight">
                            A Comprehensive Survey of Open-Source Autonomous AI Agent Frameworks
                        </h1>
                        <div className="text-[10px] text-slate-500 font-medium">
                            uGen Intelligence Platform
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="h-2 w-16 bg-slate-200 rounded" />
                        <div className="text-xs font-serif leading-relaxed text-slate-800">
                            <span className="font-bold text-sm block mb-2">Abstract</span>
                            The rapid proliferation of Large Language Models (LLMs) has catalyzed the emergence of autonomous AI agents—systems capable of performing complex multi-step tasks with minimal human intervention. This paper provides a systematic taxonomical analysis of the current open-source agentic landscape...
                        </div>

                        <div className="space-y-2">
                            <div className="h-1.5 w-full bg-slate-100 rounded" />
                            <div className="h-1.5 w-full bg-slate-100 rounded" />
                            <div className="h-1.5 w-3/4 bg-slate-100 rounded" />
                        </div>

                        <div className="pt-4">
                            <div className="h-2 w-24 bg-slate-200 rounded mb-2" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-20 bg-slate-50 rounded border border-slate-100" />
                                <div className="h-20 bg-slate-50 rounded border border-slate-100" />
                            </div>
                        </div>
                    </div>

                    {/* Floating hint */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity bg-brand-600/90 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md cursor-pointer whitespace-nowrap">
                        Click to Edit Content
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PaperPreview;
