import React from 'react';
import { ChevronDown, ChevronRight, Search, Presentation, Image, CheckCircle2, Loader2, Sparkles, Brain, Database, Activity } from 'lucide-react';

export interface ThoughtStep {
    id: string;
    title: string;
    type: 'search' | 'generate' | 'sandbox' | 'plan' | 'dataset' | 'train' | 'eval';
    status: 'complete' | 'active' | 'pending';
    previews?: string[];
    count?: number;
    reasoning?: string;  // 推理/思考内容
}

interface ThoughtProcessProps {
    steps: ThoughtStep[];
}

// 单个步骤组件，支持展开推理内容
const StepItem: React.FC<{ step: ThoughtStep; getIcon: (type: ThoughtStep['type'], status: ThoughtStep['status']) => React.ReactNode }> = ({ step, getIcon }) => {
    const [isReasoningExpanded, setIsReasoningExpanded] = React.useState(false);
    const hasReasoning = step.reasoning && step.reasoning.trim().length > 0;

    return (
        <div className="group/step">
            <div className={`flex flex-col rounded-2xl border border-slate-100 bg-white hover:border-slate-200 transition-all ${hasReasoning ? 'cursor-pointer' : ''}`}>
                <div
                    className="flex items-center justify-between p-3"
                    onClick={() => hasReasoning && setIsReasoningExpanded(!isReasoningExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-slate-50">
                            {getIcon(step.type, step.status)}
                        </div>
                        <span className={`text-[13px] font-medium ${step.status === 'active' ? 'text-slate-900' : 'text-slate-500'}`}>
                            {step.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {step.previews && step.previews.length > 0 && (
                            <div className="flex -space-x-2 mr-1">
                                {step.previews.map((url, i) => (
                                    <div key={i} className="w-6 h-6 rounded-md border-2 border-white overflow-hidden shadow-sm">
                                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {step.count && step.count > step.previews.length && (
                                    <div className="w-6 h-6 rounded-md border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shadow-sm">
                                        +{step.count - step.previews.length}
                                    </div>
                                )}
                            </div>
                        )}
                        {hasReasoning && (
                            <button
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsReasoningExpanded(!isReasoningExpanded);
                                }}
                            >
                                <Brain size={12} className="text-purple-500" />
                                <span className="text-[10px] font-medium text-purple-600">思考</span>
                                {isReasoningExpanded ? (
                                    <ChevronDown size={12} className="text-purple-400" />
                                ) : (
                                    <ChevronRight size={12} className="text-purple-400" />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* 推理内容区域 - 默认折叠 */}
                {hasReasoning && isReasoningExpanded && (
                    <div className="px-3 pb-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50/80 to-slate-50 border border-purple-100/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Brain size={14} className="text-purple-500" />
                                <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">推理过程</span>
                            </div>
                            <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap font-mono">
                                {step.reasoning}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ThoughtProcess: React.FC<ThoughtProcessProps> = ({ steps }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    if (steps.length === 0) return null;

    const getIcon = (type: ThoughtStep['type'], status: ThoughtStep['status']) => {
        if (status === 'active') return <Loader2 size={16} className="animate-spin text-brand-600" />;

        switch (type) {
            case 'search': return <Search size={16} className="text-slate-400" />;
            case 'generate': return <Presentation size={16} className="text-slate-400" />;
            case 'sandbox': return <Image size={16} className="text-slate-400" />;
            case 'plan': return <Sparkles size={16} className="text-slate-400" />;
            case 'dataset': return <Database size={16} className="text-indigo-400" />;
            case 'train': return <Activity size={16} className="text-emerald-400" />;
            case 'eval': return <CheckCircle2 size={16} className="text-amber-400" />;
            default: return <CheckCircle2 size={16} className="text-slate-400" />;
        }
    };

    // 检查是否有任何步骤包含推理内容
    const hasAnyReasoning = steps.some(s => s.reasoning && s.reasoning.trim().length > 0);

    return (
        <div className="w-full max-w-2xl mb-1">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 transition-colors group mb-1"
            >
                <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
                />
                <span className="text-[12px] font-medium text-slate-500 group-hover:text-slate-700">
                    {isExpanded ? '收起执行步骤' : `查看执行步骤 (${steps.length})`}
                </span>
                {hasAnyReasoning && !isExpanded && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-50 border border-purple-100">
                        <Brain size={10} className="text-purple-500" />
                        <span className="text-[9px] font-medium text-purple-600">含推理</span>
                    </span>
                )}
            </button>

            {isExpanded && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {steps.map((step) => (
                        <StepItem key={step.id} step={step} getIcon={getIcon} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThoughtProcess;
