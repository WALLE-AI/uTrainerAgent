import React, { useState, useRef, useEffect } from 'react';
import { Icon, ICONS, Tag } from './shared';
import { mockDeployments } from '../api/mockData';

export const Playground = ({ deployments = [] }) => {
    const defaultModelId = deployments[0]?.id || mockDeployments[0].id;
    const [selectedModelId, setSelectedModelId] = useState(defaultModelId);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState('You are a helpful and professional AI assistant. Provide concise and accurate answers.');
    const [params, setParams] = useState({ temp: 0.7, topP: 0.9, maxTokens: 1024, presencePenalty: 0 });
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState({}); // { modelId: [ { role, content, metrics } ] }
    const [isStreaming, setIsStreaming] = useState(false);

    // Filter available deployments to only those in deployments prop or fallback to mock
    const availableModels = deployments.length > 0 ? deployments : mockDeployments;

    const ParameterControl = ({ label, value, min, max, step, onChange }) => (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
                <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 px-1.5 rounded">{value}</span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={onChange}
                className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
            />
        </div>
    );

    const handleSend = () => {
        if (!userInput.trim() || isStreaming) return;

        const userMsg = { role: 'user', content: userInput };
        setMessages(prev => ({
            ...prev,
            [selectedModelId]: [...(prev[selectedModelId] || []), userMsg]
        }));

        setIsStreaming(true);
        const currentInput = userInput;
        setUserInput('');

        // Simulate model response
        setTimeout(() => {
            const assistantMsg = {
                role: 'assistant',
                content: `[Simulation] Model response for: "${currentInput}"`,
                metrics: { ttft: '12ms', tps: '124', tokens: 42 }
            };
            setMessages(prev => ({
                ...prev,
                [selectedModelId]: [...(prev[selectedModelId] || []), assistantMsg]
            }));
            setIsStreaming(false);
        }, 1000);
    };

    const ChatColumn = ({ deploymentId }) => {
        const deployment = availableModels.find(d => d.id === deploymentId);
        const colMsgs = messages[deploymentId] || [];
        const scrollRef = useRef(null);

        useEffect(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, [colMsgs]);

        if (!deployment) return null;

        return (
            <div className="flex flex-col h-full bg-white/50 backdrop-blur-md border border-gray-100/50 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group">
                <header className="p-4 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center group-hover:bg-gray-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-100">
                            {deployment.name[0]}
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{deployment.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{deployment.runtime}</p>
                        </div>
                    </div>
                </header>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                    {colMsgs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale scale-90">
                            <Icon path={ICONS.chatBubble} className="w-16 h-16 mb-4" />
                            <p className="font-black uppercase tracking-widest text-xs">准备就绪 / Ready</p>
                        </div>
                    ) : colMsgs.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-gray-900 text-white shadow-xl shadow-gray-200'
                                : 'bg-white border border-gray-100 text-gray-800 shadow-sm'
                                }`}>
                                {msg.content}
                            </div>
                            {msg.metrics && (
                                <div className="mt-2 flex gap-3 px-1">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">首字延迟: <span className="text-indigo-600">{msg.metrics.ttft}</span></span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">吞吐量: <span className="text-green-600">{msg.metrics.tps}</span></span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">词数: <span className="text-gray-900">{msg.metrics.tokens}</span></span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
            <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
                {/* Left Sidebar: Controls */}
                <div className="col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    {/* System Prompt */}
                    <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-[24px] p-6 shadow-sm">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Icon path={ICONS.cog} className="w-4 h-4 text-indigo-600" />
                            系统提示词 / System
                        </h3>
                        <textarea
                            value={systemPrompt}
                            onChange={e => setSystemPrompt(e.target.value)}
                            className="w-full h-40 bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-xs font-medium text-gray-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none leading-relaxed transition-all"
                            placeholder="设定模型的行为与人格..."
                        />
                    </div>

                    {/* Parameters */}
                    <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-[24px] p-6 shadow-sm flex-1">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Icon path={ICONS.chart} className="w-4 h-4 text-indigo-600" />
                            推理配置 / Config
                        </h3>
                        <div className="space-y-8">
                            <ParameterControl label="温度 (Temperature)" value={params.temp} min={0} max={2} step={0.1} onChange={e => setParams({ ...params, temp: parseFloat(e.target.value) })} />
                            <ParameterControl label="Top-P" value={params.topP} min={0} max={1} step={0.05} onChange={e => setParams({ ...params, topP: parseFloat(e.target.value) })} />
                            <ParameterControl label="重复惩罚 (Penalty)" value={params.presencePenalty} min={0} max={2} step={0.1} onChange={e => setParams({ ...params, presencePenalty: parseFloat(e.target.value) })} />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">最大生成词数 (Max Tokens)</label>
                                <input
                                    type="number" value={params.maxTokens}
                                    onChange={e => setParams({ ...params, maxTokens: parseInt(e.target.value) })}
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-xl p-3 text-xs font-mono font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main View: Model Grids */}
                <div className="col-span-9 flex flex-col gap-6">
                    <div className="relative z-30 flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-[24px] border border-gray-100/50 shadow-sm">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">当前测试模型:</span>
                            <div className="relative">
                                <button
                                    onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                                    className="flex items-center gap-3 bg-white border border-gray-100 hover:border-indigo-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all shadow-sm group/btn"
                                >
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    {availableModels.find(d => d.id === selectedModelId)?.name || '未选择模型'}
                                    <Icon path={ICONS.chevronDown} className={`w-3.5 h-3.5 text-gray-400 group-hover/btn:text-indigo-600 transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isSelectorOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsSelectorOpen(false)}></div>
                                        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-100 rounded-3xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                            <div className="p-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">可用的服务实例</p>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto p-1 py-2 custom-scrollbar space-y-1">
                                                {availableModels.map(d => {
                                                    const isSelected = selectedModelId === d.id;
                                                    return (
                                                        <button
                                                            key={d.id}
                                                            onClick={() => {
                                                                setSelectedModelId(d.id);
                                                                setIsSelectorOpen(false);
                                                            }}
                                                            className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl text-xs font-bold transition-all ${isSelected
                                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                                                : 'hover:bg-gray-50 text-gray-600'
                                                                }`}
                                                        >
                                                            <div className="flex flex-col items-start gap-0.5 pointer-events-none text-left">
                                                                <span className="truncate w-44">{d.name}</span>
                                                                <span className={`text-[9px] font-black tracking-widest ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>{d.runtime}</span>
                                                            </div>
                                                            {isSelected && <Icon path={ICONS.check} className="w-4 h-4 ml-2 flex-shrink-0" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setMessages({ [selectedModelId]: [] })}
                            className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 p-2 transition-colors flex items-center gap-1.5"
                        >
                            <Icon path={ICONS.trash} className="w-3.5 h-3.5" />
                            清空会话
                        </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 gap-6 overflow-hidden">
                        <ChatColumn deploymentId={selectedModelId} />
                    </div>

                    {/* Bottom: Universal Input */}
                    <div className="relative group w-full mt-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[28px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <div className="relative bg-white border border-gray-100 rounded-[24px] shadow-2xl p-2 flex items-center gap-3 pr-4 ring-1 ring-white/50 backdrop-blur-xl">
                            <button className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all hover:bg-indigo-50">
                                <Icon path={ICONS.paperClip} className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={userInput}
                                onChange={e => setUserInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="向模型发送消息..."
                                className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-sm font-medium text-gray-800 py-4"
                            />
                            <div className="flex items-center gap-2">
                                <kbd className="hidden md:flex px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-gray-300 uppercase select-none">Enter</kbd>
                                <button
                                    onClick={handleSend}
                                    disabled={!userInput.trim() || isStreaming}
                                    className={`p-3 rounded-2xl transition-all flex items-center justify-center shadow-lg ${userInput.trim() && !isStreaming
                                        ? 'bg-indigo-600 text-white shadow-indigo-200 hover:scale-110 active:scale-95'
                                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    <Icon path={isStreaming ? ICONS.cog : ICONS.play} className={`w-5 h-5 ${isStreaming ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
