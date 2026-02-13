import React from 'react';
import { Icon, ICONS, Tag, statusColors } from './shared';

const { useState, useEffect } = React;

// --- Pipeline Strategies Definitions ---
const STRATEGIES = {
    enhance: [
        { id: 'refine', name: 'Deep Refinement', desc: '利用 LLM 进行语法纠错、逻辑增强与风格对齐 (Self-Correction)。', icon: ICONS.sparkles },
        { id: 'expand', name: 'Breadth Expansion', desc: '基于种子数据进行主题外推，生成全新的指令领域。', icon: ICONS.plus },
        { id: 'diverse', name: 'Diversity Boosting', desc: '通过改写 Query 结构，提升数据集的指令分布密度。', icon: ICONS.transform },
    ],
    'kb-synthesis': [
        { id: 'qa-gen', name: 'QA Pair Gen', desc: '将非结构化知识库原子化，自动批量生成高质量问答对。', icon: ICONS.chatBubble },
        { id: 'instruct-evolve', name: 'Instruction Evolve', desc: '参考 WizardLM 方案，对简单指令进行深度与复杂度的自动化演进。', icon: ICONS.transform },
        { id: 'domain-synth', name: 'Domain Synthesis', desc: '针对特定专业领域（金融/法律等）进行合规性指令合成。', icon: ICONS.shield },
    ],
    'vision-annotation': [
        { id: 'auto-label', name: 'SAM Auto-Label', desc: '集成 Segment Anything Model 进行全自动多模态 Mask 生成。', icon: ICONS.sparkles },
        { id: 'manual-review', name: 'Review Pipeline', desc: '标注 -> 复核 -> 质检的三段式人工标注流水线。', icon: ICONS.observability },
        { id: 'qa-review', name: 'QA Inspection', desc: '针对多模态 VQA 数据的一致性与事实准确性抽检。', icon: ICONS.shield },
    ],
    'vqa-synthesis': [
        { id: 'detail-caption', name: 'Detailed Caption', desc: '生成细粒度的图像/视频描述，包括空间关系与动态变化。', icon: ICONS.data },
        { id: 'reasoning-vqa', name: 'Reasoning VQA', desc: '合成需要多步推理的问答对，提升模型的逻辑推演能力。', icon: ICONS.beaker },
        { id: 'eval-synth', name: 'Eval Synthesis', desc: '自动构建多模态评测集，包含幻觉检测与指令遵循测试。', icon: ICONS.star },
    ]
};

const FlowCard = ({ flow, onSelect }) => (
    <div
        onClick={() => onSelect(flow)}
        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 ${flow.bgGrad} rounded-full -mr-16 -mt-16 opacity-10 group-hover:scale-125 transition-transform duration-500`}></div>

        <div className="relative z-10">
            <div className={`w-14 h-14 ${flow.iconBg} rounded-2xl flex items-center justify-center ${flow.iconColor} mb-6 shadow-lg group-hover:rotate-6 transition-transform`}>
                <Icon path={flow.icon} className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-gray-900 mb-1.5 uppercase tracking-tight">{flow.name}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 line-clamp-2">{flow.desc}</p>

            <div className="flex flex-wrap gap-2 mb-6">
                {flow.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-black px-2 py-1 bg-gray-50 text-gray-400 rounded-lg uppercase tracking-widest border border-gray-100 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="flex items-center text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:gap-3 transition-all gap-2">
                配置流水线策略
                <Icon path={ICONS.arrowLeft} className="w-3 h-3 rotate-180" />
            </div>
        </div>
    </div>
);

const StrategySelectionView = ({ flow, onBack, onSelectStrategy }) => (
    <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
        <header>
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 mb-4 transition-colors group">
                <Icon path={ICONS.arrowLeft} className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                返回流选择
            </button>
            <div className="flex items-end gap-4">
                <div className={`w-16 h-16 ${flow.iconBg} rounded-2xl flex items-center justify-center ${flow.iconColor} shadow-xl`}>
                    <Icon path={flow.icon} className="w-10 h-10" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{flow.name} <span className="text-indigo-600">策略选择</span></h2>
                    <p className="text-gray-500 font-medium text-xs">请选择最适合您当前数据集的生产策略</p>
                </div>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STRATEGIES[flow.id]?.map(strategy => (
                <div
                    key={strategy.id}
                    onClick={() => onSelectStrategy(strategy)}
                    className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all cursor-pointer group flex flex-col h-full"
                >
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-6">
                        <Icon path={strategy.icon} className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-black text-gray-900 mb-2">{strategy.name}</h4>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 flex-1">{strategy.desc}</p>
                    <button className="w-full py-3 bg-gray-50 text-gray-600 font-black text-xs uppercase tracking-widest rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        选择并配置
                    </button>
                </div>
            ))}
        </div>
    </div>
);

const FlowDetailView = ({ flow, strategy, onBack }) => {
    const [status, setStatus] = useState('configuring'); // configuring, running, complete
    const [progress, setProgress] = useState(0);

    const startExecution = () => {
        setStatus('running');
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 5;
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
                setStatus('complete');
            }
            setProgress(p);
        }, 1000);
    };

    return (
        <div className="animate-in fade-in zoom-in-95 space-y-8">
            <header className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                    <button onClick={onBack} className="p-3 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-gray-900 transition-all shadow-sm">
                        <Icon path={ICONS.arrowLeft} className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{flow.name}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">/</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{strategy.name}</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{strategy.name}</h2>
                    </div>
                </div>
                <div className="flex gap-3">
                    {status === 'configuring' ? (
                        <button
                            onClick={startExecution}
                            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            <Icon path={ICONS.play} className="w-4 h-4" />
                            启动流水线
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pipeline Status</span>
                                <span className={`text-xs font-black uppercase ${status === 'running' ? 'text-indigo-600 animate-pulse' : 'text-green-600'}`}>{status}</span>
                            </div>
                            <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 shadow-sm transition-all"><Icon path={ICONS.close} className="w-5 h-5" /></button>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-gray-800">
                <div className="lg:col-span-2 space-y-6">
                    {/* Execution Parameters or Visualization */}
                    <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <Icon path={ICONS.cog} className={`w-10 h-10 text-gray-50 ${status === 'running' ? 'animate-spin' : ''}`} />
                        </div>

                        <h3 className="font-black text-gray-900 uppercase tracking-tighter mb-8 flex items-center gap-2">
                            引擎工作区 / Engine Scope
                        </h3>

                        {status === 'configuring' ? (
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block font-bold">基础模型配置</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 outline-none focus:border-indigo-500 transition-all">
                                        <option>Llama-3-70B-Instruct</option>
                                        <option>GPT-4o</option>
                                        <option>Claude-3.5-Sonnet</option>
                                        <option>DeepSeek-V2</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block font-bold">生成样本上限</label>
                                    <input type="number" defaultValue={5000} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 outline-none focus:border-indigo-500 transition-all" />
                                </div>
                                <div className="col-span-2 space-y-4">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block font-bold">策略微调 (Prompt Template)</label>
                                    <textarea
                                        rows={4}
                                        placeholder="在此处输入自定义 Prompt 变量..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-medium text-gray-700 outline-none focus:border-indigo-500 transition-all"
                                    ></textarea>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                            <Icon path={ICONS.sparkles} className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">Engine Mode</p>
                                            <p className="text-sm font-bold text-indigo-700">Dynamic Synthesis Protocol Active</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Threads</p>
                                        <p className="text-xl font-black text-gray-900 font-mono">128</p>
                                    </div>
                                </div>

                                <div className="space-y-4 font-mono text-[10px] bg-gray-900 rounded-2xl p-6 text-white shadow-2xl">
                                    <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="ml-2 text-gray-500 uppercase tracking-widest">Terminal Output</span>
                                    </div>
                                    <div className="h-32 overflow-y-auto custom-scrollbar-dark pr-2 space-y-1">
                                        <p className="text-indigo-400">[EXE] Initializing {strategy.id} worker pool...</p>
                                        <p className="text-gray-500">[INF] API Endpoint verified: Cluster-A-South</p>
                                        <p className="text-white">[CMD] runner --strategy={strategy.id} --batch-size=64</p>
                                        <p className="text-green-400">[SUC] Block #{Math.floor(progress * 4)} processed successfully.</p>
                                        {status === 'running' && <p className="animate-pulse text-indigo-500">_</p>}
                                        {status === 'complete' && <p className="text-green-500 font-black tracking-widest mt-2">-- PIPELINE EXECUTION FINISHED --</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="font-black text-gray-900 uppercase tracking-tighter mb-6 flex items-center gap-2">
                            策略质量指标 / Strategy Metrics
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center font-bold">
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] text-gray-400 uppercase mb-1">指令语义相关性</p>
                                <p className="text-xl font-black text-gray-900">0.92</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] text-gray-400 uppercase mb-1">逻辑一致性评分</p>
                                <p className="text-xl font-black text-gray-900">0.88</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] text-gray-400 uppercase mb-1">分布熵 (Diversity)</p>
                                <p className="text-xl font-black text-gray-900">4.25</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] text-gray-400 uppercase mb-1">重复率因子</p>
                                <p className="text-xl font-black text-green-600">0.02%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="font-black text-gray-900 uppercase tracking-tighter mb-6 font-bold">执行进度 / Runtime Progress</h3>
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-end text-xs font-black mb-3">
                                    <span className="text-gray-400 uppercase tracking-widest font-bold">Progress</span>
                                    <span className="text-2xl font-black text-gray-900">{Math.floor(progress)}%</span>
                                </div>
                                <div className="h-4 bg-gray-50 rounded-full border border-gray-100 p-1">
                                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-500 shadow-lg shadow-indigo-100" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                    <span className="text-[10px] font-black text-gray-400 uppercase font-bold">已产出样本</span>
                                    <span className="text-lg font-black text-indigo-600">{(progress * 100).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                    <span className="text-[10px] font-black text-gray-400 uppercase font-bold">预计剩余耗时</span>
                                    <span className="text-lg font-black text-gray-900">{status === 'running' ? '24m 12s' : status === 'complete' ? '0s' : '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                        <h4 className="font-black text-lg mb-4 flex items-center gap-2">
                            智能提示 / AI Insight
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                        </h4>
                        <p className="text-gray-400 text-xs leading-relaxed mb-6 font-medium">
                            检测到当前数据集在 <span className="text-white">"代码逻辑推理"</span> 领域的覆盖率较低，已自动激活策略中的 Breadth-Code 模块进行增强。
                        </p>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-indigo-400 tracking-tighter cursor-pointer hover:gap-4 transition-all">
                            查看优化报告 <Icon path={ICONS.arrowLeft} className="w-3 h-3 rotate-180" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DatasetConstruction = () => {
    const [view, setView] = useState('list'); // list, strategy, execute
    const [selectedFlow, setSelectedFlow] = useState(null);
    const [selectedStrategy, setSelectedStrategy] = useState(null);

    const flows = [
        {
            id: 'enhance',
            name: '现有数据集增强',
            desc: '对现有数据集进行合成增强，优化训练格式 (distlabel)，提升数据多样性与广度。支持自动纠错与语义对齐。',
            icon: ICONS.beaker,
            iconBg: 'bg-indigo-600',
            iconColor: 'text-white',
            bgGrad: 'bg-indigo-500',
            tags: ['distlabel', 'SYNTHETIC', 'SFT']
        },
        {
            id: 'kb-synthesis',
            name: '原子数据合成',
            desc: '基于知识库中的原子数据进行合成及QA生成，构建专业指令数据集 (Camel AI/EasyDataset)。',
            icon: ICONS.data,
            iconBg: 'bg-pink-600',
            iconColor: 'text-white',
            bgGrad: 'bg-pink-500',
            tags: ['RAG-to-SFT', 'CAMEL-AI', 'KNOWLEDGE']
        },
        {
            id: 'vision-annotation',
            name: '多模态视觉标注',
            desc: '图片/视频数据的目标检测与Mask分割标注，支持工作流闭环：标注 -> 复核 -> 提交。系统集成自动辅助标注。',
            icon: ICONS.observability,
            iconBg: 'bg-emerald-600',
            iconColor: 'text-white',
            bgGrad: 'bg-emerald-500',
            tags: ['CV', 'SEGMENTATION', 'DETECTION']
        },
        {
            id: 'vqa-synthesis',
            name: 'VQA/Caption 合成',
            desc: '图片/视频到 VQA 及 Caption 的自动化标注与合成，专门针对多模态理解模型提升视觉逻辑推理。',
            icon: ICONS.play,
            iconBg: 'bg-orange-600',
            iconColor: 'text-white',
            bgGrad: 'bg-orange-500',
            tags: ['VQA', 'CAPTION', 'VIDEO-UNDERSTANDING']
        },
    ];

    const handleSelectFlow = (flow) => {
        setSelectedFlow(flow);
        setView('strategy');
    };

    const handleSelectStrategy = (strategy) => {
        setSelectedStrategy(strategy);
        setView('execute');
    };

    return (
        <div className="space-y-6 pt-4 animate-in fade-in pb-10">
            {view === 'list' && (
                <div className="space-y-12">
                    <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                                数据集构建
                            </h2>
                            <p className="text-gray-500 font-medium max-w-2xl text-xs">
                                工业级数据生产闭环，从合成增强到人工微调的全链路流水线管理。
                            </p>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm text-gray-800">
                            <div className="px-4 py-2 bg-gray-50 rounded-xl">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">活跃流水线</p>
                                <p className="text-xl font-black">12 <span className="text-xs text-green-500">RUNNING</span></p>
                            </div>
                            <div className="px-4 py-2 border-l border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">昨日产量</p>
                                <p className="text-xl font-black">1.2M <span className="text-xs text-indigo-500">+12%</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {flows.map(flow => (
                            <FlowCard key={flow.id} flow={flow} onSelect={handleSelectFlow} />
                        ))}
                    </div>

                    {/* Quick Stats or Tips below */}
                    <div className="bg-gray-50/50 rounded-[32px] p-8 border border-dashed border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-gray-100">
                                <Icon path={ICONS.cog} className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 uppercase tracking-tighter">流水线预热加载中...</h4>
                                <p className="text-sm text-gray-500 font-medium">全局合成引擎负载均衡已开启，当前响应延时 42ms。</p>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all">引擎控制台</button>
                    </div>
                </div>
            )}

            {view === 'strategy' && (
                <StrategySelectionView
                    flow={selectedFlow}
                    onBack={() => setView('list')}
                    onSelectStrategy={handleSelectStrategy}
                />
            )}

            {view === 'execute' && (
                <FlowDetailView
                    flow={selectedFlow}
                    strategy={selectedStrategy}
                    onBack={() => setView('strategy')}
                />
            )}
        </div>
    );
};
