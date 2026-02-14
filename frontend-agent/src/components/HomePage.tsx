import React, { useState, useRef } from 'react';
import { Plus, Globe, Mic, Send, Paperclip, Puzzle, Database, Zap, Cpu, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FilePreviewItem from './FilePreviewItem';
import type { UploadedFile } from './FilePreviewItem';
import AddConnectorModal from './AddConnectorModal';

interface HomePageProps {
    onStart: (text: string, activeTag?: string, agentMode?: 'build' | 'plan' | 'explore') => void;
}


const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
    const [inputText, setInputText] = useState("");
    const [agentMode, setAgentMode] = useState<'build' | 'plan' | 'explore'>('build');
    const [isDataSourceMenuOpen, setIsDataSourceMenuOpen] = useState(false);
    const [isAgentModeMenuOpen, setIsAgentModeMenuOpen] = useState(false);
    const [isAddConnectorModalOpen, setIsAddConnectorModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [dataSources, setDataSources] = useState({
        webSearch: true,
        googleDrive: false
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files).map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: file.size,
                type: file.type,
                progress: 0,
                status: 'uploading' as const
            }));

            setUploadedFiles(prev => [...prev, ...newFiles]);

            // Simulate upload progress
            newFiles.forEach(newFile => {
                let currentProgress = 0;
                const interval = setInterval(() => {
                    currentProgress += Math.floor(Math.random() * 20) + 5;
                    if (currentProgress >= 100) {
                        currentProgress = 100;
                        clearInterval(interval);
                        setUploadedFiles(prev =>
                            prev.map(f => f.id === newFile.id ? { ...f, progress: 100, status: 'complete' } : f)
                        );
                    } else {
                        setUploadedFiles(prev =>
                            prev.map(f => f.id === newFile.id ? { ...f, progress: currentProgress } : f)
                        );
                    }
                }, 400);
            });
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (id: string) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && inputText.trim()) {
            e.preventDefault();
            onStart(inputText, undefined, agentMode);
        }
    };

    return (
        <div className="flex-1 bg-white flex flex-col items-center justify-center px-4 overflow-y-auto min-h-full">
            <div className="w-full max-w-3xl flex flex-col items-center -mt-20">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-black uppercase tracking-[0.2em] mb-6"
                >
                    <Sparkles size={12} fill="currentColor" />
                    <span>uTrainer Pro Agent</span>
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-black text-slate-900 mb-6 text-center leading-tight"
                >
                    专业级 <span className="text-indigo-600">LLMOps</span> 协作空间
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-500 text-center mb-12 max-w-xl text-lg font-medium leading-relaxed"
                >
                    通过自然语言驱动全链路模型训练、数据集构建与推理部署，
                    让 AI 开发变得像聊天一样简单。
                </motion.p>

                {/* Command Center */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full bg-[#f8faff] rounded-[24px] border border-slate-100 shadow-sm focus-within:shadow-md transition-all mb-8 relative"
                >
                    <AnimatePresence>
                        {uploadedFiles.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="flex flex-wrap gap-2 p-3 bg-slate-50/50 border-b border-slate-100 overflow-hidden rounded-t-[24px]"
                            >
                                {uploadedFiles.map(file => (
                                    <FilePreviewItem
                                        key={file.id}
                                        file={file}
                                        onRemove={removeFile}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="p-4">
                        <textarea
                            ref={textareaRef}
                            value={inputText}
                            onChange={(e) => {
                                setInputText(e.target.value);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="在此输入您的学术研究课题或论文需求..."
                            className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-700 min-h-[100px] resize-none text-lg placeholder:text-slate-300"
                        />
                    </div>
                    <div className="flex items-center justify-between px-4 pb-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                multiple
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all"
                                title="上传文档/图片"
                            >
                                <Paperclip size={20} />
                            </button>

                            <div className="h-4 w-[1px] bg-slate-200 mx-1" />

                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAgentModeMenuOpen(!isAgentModeMenuOpen);
                                    }}
                                    className={`transition-colors flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg ${isAgentModeMenuOpen
                                        ? 'bg-brand-50 text-brand-600'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                                        }`}
                                >
                                    {agentMode === 'build' && (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                                            </svg>
                                            <span>Build</span>
                                        </>
                                    )}
                                    {agentMode === 'plan' && (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="9" y1="9" x2="15" y2="9"></line>
                                                <line x1="9" y1="15" x2="15" y2="15"></line>
                                            </svg>
                                            <span>Plan</span>
                                        </>
                                    )}
                                    {agentMode === 'explore' && (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="11" cy="11" r="8"></circle>
                                                <path d="m21 21-4.35-4.35"></path>
                                            </svg>
                                            <span>Explore</span>
                                        </>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isAgentModeMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-30"
                                                onClick={() => setIsAgentModeMenuOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                                className="absolute bottom-full left-0 mb-4 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-40 overflow-hidden"
                                            >
                                                <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                    选择智能体模式
                                                </div>

                                                <div className="space-y-1">
                                                    <button
                                                        onClick={() => {
                                                            setAgentMode('build');
                                                            setIsAgentModeMenuOpen(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl ${agentMode === 'build'
                                                            ? 'bg-brand-50 text-brand-600'
                                                            : 'hover:bg-slate-50 text-slate-600'
                                                            } transition-colors text-left`}
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium">Build</div>
                                                            <div className="text-xs text-slate-400">执行模式</div>
                                                        </div>
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setAgentMode('plan');
                                                            setIsAgentModeMenuOpen(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl ${agentMode === 'plan'
                                                            ? 'bg-brand-50 text-brand-600'
                                                            : 'hover:bg-slate-50 text-slate-600'
                                                            } transition-colors text-left`}
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                                <line x1="9" y1="9" x2="15" y2="9"></line>
                                                                <line x1="9" y1="15" x2="15" y2="15"></line>
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium">Plan</div>
                                                            <div className="text-xs text-slate-400">规划模式</div>
                                                        </div>
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setAgentMode('explore');
                                                            setIsAgentModeMenuOpen(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl ${agentMode === 'explore'
                                                            ? 'bg-brand-50 text-brand-600'
                                                            : 'hover:bg-slate-50 text-slate-600'
                                                            } transition-colors text-left`}
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <circle cx="11" cy="11" r="8"></circle>
                                                                <path d="m21 21-4.35-4.35"></path>
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium">Explore</div>
                                                            <div className="text-xs text-slate-400">探索模式</div>
                                                        </div>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="h-4 w-[1px] bg-slate-200 mx-1" />

                            <div className="relative flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDataSourceMenuOpen(!isDataSourceMenuOpen);
                                    }}
                                    className={`transition-colors flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg ${isDataSourceMenuOpen ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                                >
                                    <Puzzle size={18} />
                                    <span>连接器</span>
                                </button>


                                <AnimatePresence>
                                    {isDataSourceMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-30"
                                                onClick={() => setIsDataSourceMenuOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                                className="absolute bottom-full left-0 mb-4 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-40 overflow-hidden"
                                            >
                                                <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                    已启用的连接器与数据源
                                                </div>

                                                <div className="space-y-1 mt-1">
                                                    <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                                <Globe size={16} />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-700">网页搜索</span>
                                                        </div>
                                                        <button
                                                            onClick={() => setDataSources(prev => ({ ...prev, webSearch: !prev.webSearch }))}
                                                            className={`w-10 h-5 rounded-full transition-colors relative ${dataSources.webSearch ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                                        >
                                                            <motion.div
                                                                animate={{ x: dataSources.webSearch ? 22 : 2 }}
                                                                className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                                                            />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
                                                                <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-4 h-4" alt="Drive" />
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-700">Google 云端硬盘</span>
                                                        </div>
                                                        <button
                                                            onClick={() => setDataSources(prev => ({ ...prev, googleDrive: !prev.googleDrive }))}
                                                            className={`w-10 h-5 rounded-full transition-colors relative ${dataSources.googleDrive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                                        >
                                                            <motion.div
                                                                animate={{ x: dataSources.googleDrive ? 22 : 2 }}
                                                                className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                                                            />
                                                        </button>
                                                    </div>

                                                </div>

                                                <div className="h-[1px] bg-slate-100 my-2" />

                                                <div className="space-y-1">
                                                    <button
                                                        onClick={() => {
                                                            setIsAddConnectorModalOpen(true);
                                                            setIsDataSourceMenuOpen(false);
                                                        }}
                                                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
                                                            <Plus size={16} />
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">添加连接器</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-300 hover:text-slate-500 transition-all">
                                <Mic size={20} />
                            </button>
                            <button
                                onClick={() => inputText.trim() && onStart(inputText, undefined, agentMode)}
                                disabled={!inputText.trim()}
                                className={`p-2 rounded-xl transition-all ${inputText.trim() ? 'bg-brand-600 hover:bg-brand-500 active:scale-95 shadow-lg shadow-brand-500/20 text-white' : 'bg-slate-100 text-slate-300'}`}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
                <AddConnectorModal
                    isOpen={isAddConnectorModalOpen}
                    onClose={() => setIsAddConnectorModalOpen(false)}
                />

                {/* Quick Actions / Templates */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-4"
                >
                    {[
                        { title: '数据集构建', desc: '自动化清理、打标与增强', icon: <Database className="text-blue-500" />, color: 'bg-blue-50', prompt: '帮我构建一个专门用于中文学术论文润色的 SFT 数据集' },
                        { title: '模型微调', desc: '一键启动多机多卡训练任务', icon: <Zap className="text-amber-500" />, color: 'bg-amber-50', prompt: '使用 Llama-3-8B 基础模型，在我刚上传的文档上进行 LoRA 微调' },
                        { title: '部署与评测', desc: '可观测推理服务与质量对齐', icon: <Cpu className="text-emerald-500" />, color: 'bg-emerald-50', prompt: '将微调后的模型部署为 API 服务，并进行自动 Eval 评测' },
                    ].map((card, idx) => (
                        <button
                            key={idx}
                            onClick={() => setInputText(card.prompt)}
                            className="flex flex-col items-start p-5 rounded-3xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group text-left"
                        >
                            <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                {card.icon}
                            </div>
                            <h3 className="text-base font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-wider">{card.title}</h3>
                            <p className="text-xs text-slate-400 font-medium mb-4">{card.desc}</p>
                            <div className="flex items-center gap-1 text-[11px] font-black text-indigo-500 uppercase tracking-widest mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                立即开始 <ChevronRight size={12} />
                            </div>
                        </button>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default HomePage;
