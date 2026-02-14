import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sessionService } from '../api/sessions';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal, Activity, Circle, Check, X, Maximize2
} from 'lucide-react';

interface LogItem {
    id?: string;
    type: string;
    title: string;
    content?: string;
    status: 'active' | 'complete' | 'error';
    timestamp: Date;
    toolName?: string;
    url?: string;
}

interface AgentConsoleProps {
    isOpen: boolean;
    onClose: () => void;
    currentSessionId?: string;
    onLogsUpdate?: (logs: LogItem[]) => void;
    logs?: LogItem[];
    files?: any[];
    todos?: any[];
    onTodosUpdate?: (todos: any[]) => void;
    activeTab?: 'session' | 'terminal';
}

const AgentConsole: React.FC<AgentConsoleProps> = ({
    isOpen,
    onClose,
    currentSessionId,
    logs = [],
    onLogsUpdate,
    activeTab: initialTab
}) => {
    const [activeTab, setActiveTab] = useState<'session' | 'terminal'>(initialTab || 'session');
    const [isExpanded, setIsExpanded] = useState(false);
    const [width, setWidth] = useState(500);
    const [isResizing, setIsResizing] = useState(false);

    const [updatingLogId, setUpdatingLogId] = useState<string | null>(null);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    useEffect(() => {
        if (activeTab === 'terminal' && terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeTab, logs]);

    const handleToggleLogStatus = async (log: LogItem) => {
        if (!log.id || !currentSessionId) return;

        setUpdatingLogId(log.id);
        try {
            const newStatus = (log.status === 'complete' ? 'active' : 'complete') as 'active' | 'complete' | 'error';
            await sessionService.updateLog(currentSessionId, log.id, { status: newStatus });

            if (onLogsUpdate) {
                const updatedLogs = logs.map(l =>
                    l.id === log.id ? { ...l, status: newStatus } : l
                );
                onLogsUpdate(updatedLogs as LogItem[]);
            }
        } catch (error) {
            console.error('Failed to update log status:', error);
        } finally {
            setUpdatingLogId(null);
        }
    };

    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);
    const resize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth > 350 && newWidth < 1200) {
                setWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    if (!isOpen) return null;

    const tabs = [
        { id: 'session', label: '会话日志', icon: <Activity size={14} /> },
        { id: 'terminal', label: '终端', icon: <Terminal size={14} /> },
    ];

    return (
        <motion.aside
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            style={{ width: isExpanded ? 'calc(100% - 32px)' : `${width}px` }}
            className={`${isExpanded ? 'fixed inset-4 z-50' : 'relative'} border-l border-slate-200 flex flex-col h-full bg-white shadow-2xl transition-all duration-300 ${isResizing ? 'select-none transition-none' : ''}`}
        >
            {!isExpanded && (
                <div
                    onMouseDown={startResizing}
                    className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-brand-500/20 active:bg-brand-500/40 z-50 transition-colors"
                />
            )}

            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">uTrainerCenter</span>
                    <div className="px-1.5 py-0.5 bg-brand-50 text-brand-600 rounded text-[9px] font-black">Live</div>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                        title={isExpanded ? "收起" : "展开"}
                    >
                        <Maximize2 size={16} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="flex items-center border-b border-slate-100 bg-white sticky top-0 z-10 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-3 text-[11px] font-black transition-all relative whitespace-nowrap uppercase tracking-widest ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabCenter"
                                className="absolute bottom-0 left-4 right-4 h-0.5 bg-slate-900"
                            />
                        )}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                <AnimatePresence mode="wait">
                    {activeTab === 'session' && (
                        <motion.div
                            key="session"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-5 space-y-4"
                        >
                            {logs.length === 0 ? (
                                <div className="text-center py-20 text-slate-300">
                                    <Terminal size={32} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-[11px] font-black uppercase tracking-widest">No Activity Logs</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full w-fit">
                                        <div className={`w-1.5 h-1.5 rounded-full ${logs.some(l => l.status === 'active') ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                        <span>{logs.some(l => l.status === 'active') ? 'Executing...' : `Finished (${logs.length})`}</span>
                                    </div>

                                    <div className="space-y-2">
                                        {logs.map((log, i) => (
                                            <div
                                                key={i}
                                                onClick={() => handleToggleLogStatus(log)}
                                                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${log.status === 'active' ? 'bg-amber-50/30 border-amber-100 shadow-sm shadow-amber-100/50' :
                                                    log.status === 'error' ? 'bg-red-50/30 border-red-100' :
                                                        'bg-white border-slate-100 hover:border-indigo-100'
                                                    } ${updatingLogId === log.id ? 'opacity-50' : ''}`}
                                            >
                                                <div className={`mt-0.5 p-2 rounded-xl ${log.status === 'active' ? 'bg-amber-100 text-amber-600' :
                                                    log.status === 'error' ? 'bg-red-100 text-red-600' :
                                                        'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {log.type === 'tool' ? <Terminal size={14} /> : log.type === 'step' ? <Circle size={14} /> : <Activity size={14} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{log.title}</span>
                                                        {log.status === 'complete' && <Check size={12} className="text-emerald-500 shrink-0" />}
                                                    </div>
                                                    {log.content && <p className="text-[10px] text-slate-400 mt-1 truncate" title={log.content}>{log.content}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}


                    {activeTab === 'terminal' && (
                        <motion.div
                            key="terminal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 h-full flex flex-col"
                        >
                            <div className="bg-[#0f1117] rounded-3xl border border-slate-800 flex-1 flex flex-col overflow-hidden shadow-2xl">
                                <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500/50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
                                        </div>
                                        <span className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest ml-2">sandbox-shell</span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-5 font-mono text-[11px] custom-scrollbar selection:bg-brand-500/30 text-left">
                                    {logs.filter(l => ['bash', 'ls', 'grep', 'ast_grep', 'glob_search', 'file_read', 'file_write', 'edit'].includes(l.toolName || '') || l.type === 'terminal').length === 0 ? (
                                        <div className="text-slate-600 italic flex items-center gap-2">
                                            <span className="text-emerald-500">➜</span>
                                            Waiting for shell activity...
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {logs.filter(l => ['bash', 'ls', 'grep', 'ast_grep', 'glob_search', 'file_read', 'file_write', 'edit'].includes(l.toolName || '') || l.type === 'terminal').map((log, i) => (
                                                <div key={i} className="group">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-emerald-400 font-bold opacity-70">agent@utrainer</span>
                                                        <span className="text-slate-400">:</span>
                                                        <span className="text-indigo-400">~</span>
                                                        <span className="text-emerald-400 font-bold">$</span>
                                                        <span className="text-slate-200 flex-1 break-all">
                                                            {log.toolName ? (log.toolName === 'bash' ? log.title : `${log.toolName} ${log.content?.slice(0, 50) || ''}`) : log.title}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 ml-4 text-slate-400 whitespace-pre-wrap break-words border-l border-slate-800 pl-4 py-1.5 bg-white/5 rounded-r-2xl">
                                                        {log.status === 'active' ? (
                                                            <div className="flex items-center gap-2 text-indigo-400 italic">
                                                                <div className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" />
                                                                Running...
                                                            </div>
                                                        ) : (
                                                            log.content || '(output empty)'
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-400 font-bold opacity-70">agent@utrainer</span>
                                                <span className="text-slate-400">:</span>
                                                <span className="text-indigo-400">~</span>
                                                <span className="text-emerald-400 font-bold">$</span>
                                                <span className="w-1.5 h-3.5 bg-brand-500 animate-pulse inline-block" />
                                            </div>
                                            <div ref={terminalEndRef} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2 text-emerald-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                    <span>Sandbox Online</span>
                </div>
                <div className="flex gap-4 text-slate-400 font-mono">
                    <span>CPU: 14%</span>
                    <span>RAM: 2.1GB</span>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </motion.aside>
    );
};

export default AgentConsole;
