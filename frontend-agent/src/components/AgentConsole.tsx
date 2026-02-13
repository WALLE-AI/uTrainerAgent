import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Maximize2, FileText, Circle, Check, Terminal, Activity, Eye, Download, ExternalLink, Globe, FileCode, Info, AlertCircle, Loader2, Database } from 'lucide-react';
import { sessionService } from '../api/sessions';
import { todoService } from '../api/todos';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TodoItem {
    id: string;
    content: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    priority: number;
    output?: string;  // 中间输出结果
}

interface FileItem {
    id?: string;    // 文件ID，用于下载
    path: string;
    name: string;
    action: string;
    size: number;
    timestamp: Date;
    url?: string;
}

interface LogItem {
    id?: string;  // 用于更新状态
    type: string;
    title: string;
    content?: string;
    status: 'active' | 'complete' | 'error';
    timestamp: Date;
    toolName?: string;
}

interface AgentConsoleProps {
    isOpen: boolean;
    onClose: () => void;
    todos?: TodoItem[];
    files?: FileItem[];
    logs?: LogItem[];
    currentSessionId?: string;  // 用于更新状态
    onLogsUpdate?: (logs: LogItem[]) => void;  // 回调更新
    onTodosUpdate?: (todos: TodoItem[]) => void;  // 回调更新
}

const AgentConsole: React.FC<AgentConsoleProps> = ({
    isOpen,
    onClose,
    todos = [],
    files = [],
    logs = [],
    currentSessionId,
    onLogsUpdate,
    onTodosUpdate,
}) => {
    const [activeTab, setActiveTab] = useState<'session' | 'files' | 'datasets' | 'training' | 'evaluation' | 'terminal'>('session');
    const [isExpanded, setIsExpanded] = useState(false);
    const [width, setWidth] = useState(500);
    const [isResizing, setIsResizing] = useState(false);

    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [updatingLogId, setUpdatingLogId] = useState<string | null>(null);
    const [updatingTodoId, setUpdatingTodoId] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadFileId, setDownloadFileId] = useState<string | null>(null);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeTab === 'terminal') {
            terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeTab, logs]);

    // 🔍 Debug: Log todos prop changes
    useEffect(() => {
        console.log('[AgentConsole] 🔍 Todos prop updated:', todos);
        console.log('[AgentConsole] 🔍 Todos count:', todos.length);
        if (todos.length > 0) {
            console.log('[AgentConsole] 🔍 First todo:', todos[0]);
        }
    }, [todos]);

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

    // 处理待办状态切换
    const handleToggleTodoStatus = async (todo: TodoItem) => {
        if (!currentSessionId) return;

        setUpdatingTodoId(todo.id);
        try {
            const newStatus = (todo.status === 'completed' ? 'pending' : 'completed') as 'pending' | 'in_progress' | 'completed' | 'failed';
            await todoService.update(currentSessionId, todo.id, { status: newStatus });

            // 更新本地状态
            if (onTodosUpdate) {
                const updatedTodos = todos.map(t =>
                    t.id === todo.id ? { ...t, status: newStatus } : t
                );
                onTodosUpdate(updatedTodos as TodoItem[]);
            }
        } catch (error) {
            console.error('Failed to update todo status:', error);
        } finally {
            setUpdatingTodoId(null);
        }
    };

    // 处理文件下载
    const handleDownload = async (fileId: string, fileName: string) => {
        setIsDownloading(true);
        setDownloadFileId(fileId);
        setDownloadProgress(0);

        try {
            const { fileService } = await import('../api/files');
            await fileService.download(
                fileId,
                fileName,
                (progress) => {
                    setDownloadProgress(progress);
                }
            );

            // 下载成功后可以刷新用户统计
            // 但这里不需要等待，让它在后台执行
            import('../api/userStats').then(({ default: userStatsApi }) => {
                userStatsApi.getUserOverview().catch(console.error);
            });
        } catch (err) {
            console.error('Download failed:', err);
            // 可以在这里添加错误提示
        } finally {
            setIsDownloading(false);
            setDownloadFileId(null);
            setDownloadProgress(0);
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
                    { id: 'datasets', label: '数据集' },
                    { id: 'training', label: '训练监控' },
                    { id: 'evaluation', label: '模型评测' },
                    { id: 'files', label: '成果文件' },
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

                    {activeTab === 'files' && (
                        <motion.div
                            key="files"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-6 space-y-4"
                        >
                            {files.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <FileText size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">暂无生成文件</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {files.map((file, i) => {
                                        const formatSize = (bytes: number) => {
                                            if (bytes < 1024) return `${bytes} B`;
                                            if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
                                            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
                                        };
                                        const getFileType = (name: string) => {
                                            const ext = name.split('.').pop()?.toUpperCase() || 'FILE';
                                            return ext;
                                        };
                                        return (
                                            <div
                                                key={file.path || i}
                                                onClick={() => setSelectedFile(file)}
                                                className="p-4 border border-slate-100 rounded-xl hover:border-brand-200 hover:bg-brand-50/10 cursor-pointer transition-all group relative overflow-hidden"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="text-slate-400 group-hover:text-brand-500 transition-colors" size={20} />
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${file.action === 'created' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                            {file.action === 'created' ? '新建' : '更新'}
                                                        </span>
                                                    </div>
                                                    <Eye size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="text-[13px] font-medium text-slate-700 truncate mb-1" title={file.path}>{file.name}</div>
                                                <div className="text-[11px] text-slate-400">{formatSize(file.size)} • {getFileType(file.name)}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'datasets' && (
                        <motion.div
                            key="datasets"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-6 space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database size={18} className="text-indigo-500" />
                                    <h3 className="text-sm font-bold text-slate-800">数据集构建进度</h3>
                                </div>
                                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Collecting</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total samples</p>
                                    <p className="text-xl font-bold text-slate-900">12,450</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Processed</p>
                                    <p className="text-xl font-bold text-slate-900">8,200</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500">数据集合成 (Distillation)</span>
                                        <span className="text-slate-900 font-bold">65%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '65%' }}
                                            className="h-full bg-indigo-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-3">Recent Activities</h4>
                                <div className="space-y-3">
                                    {[
                                        { action: 'Deduplication', status: 'Done', detail: 'Removed 450 duplicates' },
                                        { action: 'Filtering', status: 'Active', detail: 'Quality score > 0.8' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <span className="text-[12px] font-medium text-slate-700">{item.action}</span>
                                                    <span className="text-[10px] text-slate-400">{item.status}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400">{item.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'training' && (
                        <motion.div
                            key="training"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-6 space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity size={18} className="text-emerald-500" />
                                    <h3 className="text-sm font-bold text-slate-800">训练实时观测</h3>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    EPOCH 1 / 3
                                </div>
                            </div>

                            <div className="p-4 bg-slate-900 rounded-2xl shadow-xl overflow-hidden relative group">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Loss Curve</span>
                                    <span className="text-[18px] font-bold text-emerald-400 font-mono">0.0245</span>
                                </div>
                                {/* Placeholder for specialized chart - later we use Recharts */}
                                <div className="h-40 flex items-end gap-1 px-1">
                                    {[40, 35, 30, 32, 28, 25, 22, 20, 18, 15, 12, 14, 10, 8, 6, 7, 5, 4, 3, 2].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h * 2}%` }}
                                            className="flex-1 bg-gradient-to-t from-emerald-500/80 to-emerald-400/40 rounded-t-sm"
                                        />
                                    ))}
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1 px-2 rounded-md bg-white/10 text-white text-[9px] font-bold">SWANLAB STYLE</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                                    <p className="text-[10px] font-bold text-emerald-600/70 uppercase mb-1">Accuracy</p>
                                    <p className="text-xl font-bold text-emerald-700">98.4%</p>
                                </div>
                                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                                    <p className="text-[10px] font-bold text-amber-600/70 uppercase mb-1">Learning Rate</p>
                                    <p className="text-xl font-bold text-amber-700">2e-5</p>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle size={14} className="text-amber-500" />
                                    <span className="text-[11px] font-bold text-slate-700">智能监控预警</span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    检测到 Gradient Norm 出现小幅波动，当前 FP16 动态损失缩放正常，无需人工干预。
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'evaluation' && (
                        <motion.div
                            key="evaluation"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-6 space-y-6"
                        >
                            <div className="flex items-center gap-2">
                                <Eye size={18} className="text-amber-500" />
                                <h3 className="text-sm font-bold text-slate-800">基准评测对比</h3>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { name: 'GSM8K (Math)', current: 85.4, baseline: 82.1 },
                                    { name: 'MMLU (Reasoning)', current: 74.2, baseline: 71.5 },
                                    { name: 'HumanEval (Coding)', current: 62.8, baseline: 58.4 }
                                ].map((item, i) => (
                                    <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[13px] font-bold text-slate-800">{item.name}</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[14px] font-bold text-emerald-600">+{((item.current - item.baseline) / item.baseline * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                        <div className="relative h-4 bg-slate-50 rounded-full overflow-hidden flex">
                                            <div className="h-full bg-slate-200" style={{ width: `${item.baseline}%` }} />
                                            <div className="h-full bg-amber-500" style={{ width: `${item.current - item.baseline}%` }} />
                                        </div>
                                        <div className="flex justify-between mt-2 text-[10px] font-bold uppercase">
                                            <span className="text-slate-400">Baseline (LLaMA3)</span>
                                            <span className="text-amber-600">uTrainer Fine-tuned</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
            {/* File Preview Modal */}
            <AnimatePresence>
                {selectedFile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md transition-all duration-300"
                        onClick={() => setSelectedFile(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] w-[95vw] lg:w-[85vw] h-[90vh] flex flex-col overflow-hidden border border-white/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header - Modern Glassmorphism style */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${getFileTypeColor(selectedFile.name)}`}>
                                        {getFileIcon(selectedFile.name, 24)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-bold text-slate-900">{selectedFile.name}</h3>
                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                {selectedFile.name.split('.').pop()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium truncate max-w-[400px]">
                                            {selectedFile.path}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedFile.url && (
                                        <div className="flex items-center bg-slate-50 rounded-xl p-1 mr-2 border border-slate-100">
                                            <a
                                                href={selectedFile.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-white hover:text-brand-600 rounded-lg text-slate-400 transition-all hover:shadow-sm group"
                                                title="新窗口打开"
                                            >
                                                <ExternalLink size={18} className="group-hover:scale-110 transition-transform" />
                                            </a>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const fileId = selectedFile.id || selectedFile.name;
                                                    handleDownload(fileId, selectedFile.name);
                                                }}
                                                disabled={isDownloading && downloadFileId === (selectedFile.id || selectedFile.name)}
                                                className="p-2 hover:bg-white hover:text-brand-600 rounded-lg text-slate-400 transition-all hover:shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed relative"
                                                title={isDownloading && downloadFileId === (selectedFile.id || selectedFile.name)
                                                    ? `下载中... ${downloadProgress}%`
                                                    : "下载该文件"}
                                            >
                                                {isDownloading && downloadFileId === (selectedFile.id || selectedFile.name) ? (
                                                    <div className="relative">
                                                        <Loader2 size={18} className="animate-spin" />
                                                        {downloadProgress > 0 && (
                                                            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-brand-600 whitespace-nowrap">
                                                                {downloadProgress}%
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Download size={18} className="group-hover:scale-110 transition-transform" />
                                                )}
                                            </button>

                                        </div>
                                    )}
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="p-2.5 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all active:scale-95"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                {/* Main Content Area */}
                                <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 lg:p-8 custom-scrollbar">
                                    <div className="max-w-5xl mx-auto h-full">
                                        {!selectedFile.url ? (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                                                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                                    <AlertCircle size={32} className="text-red-500" />
                                                </div>
                                                <div className="text-center max-w-md">
                                                    <p className="text-base font-bold text-slate-600">文件 URL 不可用</p>
                                                    <p className="text-sm mt-1 mb-4">
                                                        该文件的访问链接已过期或不存在。这可能是因为文件是从历史会话加载的。
                                                    </p>
                                                    <div className="flex gap-3 justify-center">
                                                        <button
                                                            onClick={() => {
                                                                // 刷新文件列表
                                                                window.location.reload();
                                                            }}
                                                            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all"
                                                        >
                                                            刷新页面
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedFile(null)}
                                                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all"
                                                        >
                                                            关闭
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full animate-in fade-in zoom-in-95 duration-500">
                                                <FileContentRenderer file={selectedFile} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sidebar - Details (Hidden on small screens) */}
                                <div className="hidden lg:flex w-72 flex-col border-l border-slate-100 bg-white p-6 space-y-8 overflow-y-auto">
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                            <Info size={16} className="text-brand-500" />
                                            <span>文件信息</span>
                                        </div>
                                        <div className="space-y-3">
                                            <DetailItem label="文件名称" value={selectedFile.name} />
                                            <DetailItem label="文件大小" value={formatFileSize(selectedFile.size)} />
                                            <DetailItem label="最后修改" value={selectedFile.timestamp.toLocaleString()} />
                                            <DetailItem label="操作类型" value={selectedFile.action === 'created' ? '新建' : '更新'} badge />
                                        </div>
                                    </section>

                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                            <Activity size={16} className="text-brand-500" />
                                            <span>智能体备注</span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 leading-relaxed border border-slate-100">
                                            该文件是由智能体在执行任务过程中生成的。你可以点击顶部操作栏的外部链接图标在独立页面中查看或分享。
                                        </div>
                                    </section>

                                    <div className="mt-auto pt-4">
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                                        >
                                            关闭预览
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.aside>
    );
};

const DetailItem: React.FC<{ label: string; value: string; badge?: boolean }> = ({ label, value, badge }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        {badge ? (
            <span className={`w-fit px-2 py-0.5 rounded-lg text-[10px] font-bold ${value === '新建' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {value}
            </span>
        ) : (
            <span className="text-xs text-slate-600 font-medium break-all">{value}</span>
        )}
    </div>
);

const getFileIcon = (filename: string, size = 18) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText size={size} className="text-red-500" />;
    if (['md', 'markdown', 'txt'].includes(ext || '')) return <FileText size={size} className="text-blue-500" />;
    if (['html', 'htm'].includes(ext || '')) return <FileCode size={size} className="text-orange-500" />;
    return <FileText size={size} className="text-slate-400" />;
};

const getFileTypeColor = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'bg-red-50 text-red-600';
    if (['md', 'markdown', 'txt'].includes(ext || '')) return 'bg-blue-50 text-blue-600';
    if (['html', 'htm'].includes(ext || '')) return 'bg-orange-50 text-orange-600';
    return 'bg-slate-50 text-slate-600';
};

const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileContentRenderer: React.FC<{ file: FileItem }> = ({ file }) => {
    const [error, setError] = useState<string | null>(null);
    const url = file.url || '';
    const name = file.name.toLowerCase();

    // Validate URL
    useEffect(() => {
        if (!file.url) {
            setError('文件 URL 不可用');
            return;
        }

        // Validate URL format
        try {
            new URL(file.url);
            setError(null); // Clear error if URL is valid
        } catch {
            setError('文件 URL 格式无效');
        }
    }, [file.url]);

    // Display error state if URL validation fails
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center">
                    <AlertCircle size={40} className="text-red-500" />
                </div>
                <div className="text-center max-w-md">
                    <p className="text-lg font-bold text-slate-600">{error}</p>
                    <p className="text-sm text-slate-400 mt-2">
                        请尝试刷新页面或联系管理员
                    </p>
                </div>
            </div>
        );
    }

    // Notion/Feishu links detection
    const isNotion = url.includes('notion.so') || name.includes('notion');
    const isFeishu = url.includes('feishu.cn') || url.includes('larksuite.com') || name.includes('feishu') || name.includes('lark');

    if (isNotion || isFeishu) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${isNotion ? 'bg-slate-900' : 'bg-blue-600'}`}>
                    <Globe size={40} className="text-white" />
                </div>
                <div className="text-center max-w-md">
                    <h4 className="text-xl font-bold text-slate-800 mb-2">检测到外部协作文档</h4>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                        该内容来自于 {isNotion ? 'Notion' : '飞书'}。由于第三方平台的安全策略限制，我们建议你在独立窗口中打开。
                    </p>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-white font-bold transition-all shadow-xl hover:scale-105 active:scale-95 ${isNotion ? 'bg-slate-900 shadow-slate-200' : 'bg-blue-600 shadow-blue-200'}`}
                    >
                        <span>预览 {isNotion ? 'Notion' : '飞书'} 文档</span>
                        <ExternalLink size={18} />
                    </a>
                </div>
            </div>
        );
    }

    if (name.endsWith('.pdf')) {
        return (
            <div className="w-full h-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-inner group relative">
                <iframe
                    src={`${url}#toolbar=0`}
                    className="w-full h-full border-none"
                    title="PDF Preview"
                />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                        Browser Native Viewer
                    </div>
                </div>
            </div>
        );
    }

    if (name.endsWith('.html') || name.endsWith('.htm')) {
        return (
            <div className="w-full h-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                <iframe
                    src={url}
                    className="w-full h-full border-none"
                    title="HTML Preview"
                    sandbox="allow-scripts allow-same-origin"
                />
            </div>
        );
    }

    if (name.endsWith('.md') || name.endsWith('.markdown') || name.endsWith('.txt')) {
        return <MarkdownPreview url={url} />;
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center">
                <FileText size={40} className="opacity-20" />
            </div>
            <div className="text-center">
                <p className="text-lg font-bold text-slate-600">无法直接预览此文件</p>
                <p className="text-sm mt-1 mb-8">该文件格式可能不受支持或属于二进制数据</p>
                <a
                    href={url}
                    download
                    className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                    <Download size={18} />
                    <span>立即下载文件</span>
                </a>
            </div>
        </div>
    );
};

const MarkdownPreview: React.FC<{ url: string }> = ({ url }) => {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch content');
                const text = await response.text();
                setContent(text);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [url]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 space-y-6">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-500 rounded-full animate-spin transition-all" />
            <p className="text-sm font-medium text-slate-400">渲染文档中...</p>
        </div>
    );

    if (error) return (
        <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-sm font-medium flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
                <X size={20} />
            </div>
            <span>加载预览失败: {error}</span>
        </div>
    );

    return (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-10 lg:p-14 shadow-sm prose prose-slate max-w-none 
                        prose-headings:text-slate-900 prose-headings:font-bold 
                        prose-p:text-slate-600 prose-p:leading-relaxed
                        prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-100 prose-pre:rounded-2xl
                        prose-a:text-brand-600 prose-blockquote:border-l-4 prose-blockquote:border-brand-200
                        prose-img:rounded-2xl prose-img:shadow-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default AgentConsole;
