import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Maximize2, Circle, Check, Terminal, Activity } from 'lucide-react';
import { sessionService } from '../api/sessions';
import { motion, AnimatePresence } from 'framer-motion';

interface LogItem {
    id?: string;  // 用于更新状态
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
    // Keeping these for compatibility with ChatArea.tsx
    files?: any[];
    todos?: any[];
    onTodosUpdate?: (todos: any[]) => void;
}

const AgentConsole: React.FC<AgentConsoleProps> = ({
    isOpen,
    onClose,
    currentSessionId,
    logs = [],
    onLogsUpdate,
}) => {
    const [activeTab, setActiveTab] = useState<'session' | 'terminal'>('session');
    const [isExpanded, setIsExpanded] = useState(false);
    const [width, setWidth] = useState(500);
    const [isResizing, setIsResizing] = useState(false);

    const [updatingLogId, setUpdatingLogId] = useState<string | null>(null);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeTab === 'terminal' && terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeTab, logs]);

    // 处理日志状态切换
    const handleToggleLogStatus = async (log: LogItem) => {
        if (!log.id || !currentSessionId) return;

        setUpdatingLogId(log.id);
        try {
            const newStatus = (log.status === 'complete' ? 'active' : 'complete') as 'active' | 'complete' | 'error';
            await sessionService.updateLog(currentSessionId, log.id, { status: newStatus });

            // 更新本地状态
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

    // 处理改变大小
    const startResizing = useCallback(() => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newWidth = window.innerWidth - e.clientX;
            // 设置最小和最大宽度
            if (newWidth > 300 && newWidth < 1000) {
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

    return (
        <motion.aside
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            style={{ width: isExpanded ? 'calc(100% - 32px)' : `${width}px` }}
            className={`${isExpanded ? 'fixed inset-4 z-50' : 'relative'} border-l border-slate-200 flex flex-col h-full bg-white shadow-2xl transition-all duration-300 ${isResizing ? 'select-none transition-none' : ''}`}
        >
            {/* Resize Handle */}
            {!isExpanded && (
                <div
                    onMouseDown={startResizing}
                    className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-brand-500/20 active:bg-brand-500/40 z-50 transition-colors"
                />
            )}
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">任务中心</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 hover:bg-slate-50 rounded text-slate-400 transition-colors"
                    >
                        <Maximize2 size={16} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-50 rounded text-slate-400 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center border-b border-slate-100 px-2 bg-white sticky top-0 z-10">
                {[
                    { id: 'session', label: '会话日志' },
                    { id: 'terminal', label: '终端' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-4 right-4 h-0.5 bg-slate-900"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                <AnimatePresence mode="wait">
                    {activeTab === 'session' && (
                        <motion.div
                            key="session"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-6 space-y-4"
                        >
                            {logs.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Terminal size={32} className="mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">暂无执行日志</p>
                                    <p className="text-xs mt-1">开始对话后，智能体执行过程将显示在这里</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Status Summary */}
                                    <div className="flex items-center gap-2 text-[13px] text-slate-500 bg-slate-50/50 p-2 rounded-lg w-fit">
                                        <div className={`w-2 h-2 rounded-full ${logs.some(l => l.status === 'active') ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                        <span>{logs.some(l => l.status === 'active') ? '正在执行...' : `已完成 ${logs.length} 个操作`}</span>
                                    </div>

                                    {/* Execution Timeline */}
                                    <div className="space-y-2">
                                        {logs.map((log, i) => {
                                            const getIcon = () => {
                                                if (log.type === 'tool') return <Terminal size={14} />;
                                                if (log.type === 'step') return <Circle size={14} />;
                                                return <Activity size={14} />;
                                            };
                                            const formatTime = (date: Date) => {
                                                return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                            };
                                            return (
                                                <div
                                                    key={i}
                                                    onClick={() => handleToggleLogStatus(log)}
                                                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${log.status === 'active' ? 'bg-amber-50/50 border-amber-200' :
                                                        log.status === 'error' ? 'bg-red-50/50 border-red-200' :
                                                            'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
                                                        } ${updatingLogId === log.id ? 'opacity-50 pointer-events-none' : ''
                                                        }`}
                                                >
                                                    <div className={`mt-0.5 p-1.5 rounded-lg ${log.status === 'active' ? 'bg-amber-100 text-amber-600' :
                                                        log.status === 'error' ? 'bg-red-100 text-red-600' :
                                                            'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {getIcon()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[13px] font-medium text-slate-700">{log.title}</span>
                                                            {log.status === 'active' && (
                                                                <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded font-medium">执行中</span>
                                                            )}
                                                            {log.status === 'complete' && (
                                                                <Check size={12} className="text-emerald-500" />
                                                            )}
                                                        </div>
                                                        {log.content && (
                                                            <p className="text-[11px] text-slate-400 mt-1 truncate" title={log.content}>
                                                                {log.content}
                                                            </p>
                                                        )}
                                                        <p className="text-[10px] text-slate-400 mt-1">{formatTime(log.timestamp)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
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
                            <div className="bg-[#1e1e1e] rounded-xl border border-slate-800 flex-1 flex flex-col overflow-hidden shadow-2xl">
                                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-[#252525]">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500 ml-2">bash — agent@sandbox</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-500">UTF-8</div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 font-mono text-[12px] custom-scrollbar selection:bg-brand-500/30 text-left">
                                    {logs.filter(l => ['bash', 'ls', 'grep', 'ast_grep', 'glob_search', 'file_read', 'file_write', 'edit'].includes(l.toolName || '') || l.type === 'terminal').length === 0 ? (
                                        <div className="text-slate-600 italic">
                                            <span className="text-emerald-500 mr-2">➜</span>
                                            等待命令执行...
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {logs.filter(l => ['bash', 'ls', 'grep', 'ast_grep', 'glob_search', 'file_read', 'file_write', 'edit'].includes(l.toolName || '') || l.type === 'terminal').map((log, i) => (
                                                <div key={i} className="group">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-emerald-400 font-bold">agent@sandbox</span>
                                                        <span className="text-slate-400">:</span>
                                                        <span className="text-blue-400">~</span>
                                                        <span className="text-emerald-500 font-bold">$</span>
                                                        <span className="text-slate-100 flex-1 break-all">
                                                            {log.toolName ? (log.toolName === 'bash' ? log.title : `${log.toolName} ${log.content?.slice(0, 50) || ''}`) : log.title}
                                                        </span>
                                                    </div>
                                                    {log.status === 'active' ? (
                                                        <div className="mt-1 flex items-center gap-2 text-slate-500 italic ml-4">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            Running...
                                                        </div>
                                                    ) : (
                                                        <div className="mt-1 ml-4 text-slate-300 whitespace-pre-wrap break-words border-l-2 border-slate-800 pl-3 py-1 bg-white/5 rounded-r-lg">
                                                            {log.content || (log.status === 'error' ? 'Execution failed' : '(no output)')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-400 font-bold">agent@sandbox</span>
                                                <span className="text-slate-400">:</span>
                                                <span className="text-blue-400">~</span>
                                                <span className="text-emerald-500 font-bold">$</span>
                                                <span className="w-2 h-4 bg-emerald-500/80 animate-pulse inline-block align-middle" />
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

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sandbox Active</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-[10px] text-slate-400 font-mono">CPU: 12%</span>
                    <span className="text-[10px] text-slate-400 font-mono">MEM: 1.4GB</span>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </motion.aside>
    );
};

export default AgentConsole;
