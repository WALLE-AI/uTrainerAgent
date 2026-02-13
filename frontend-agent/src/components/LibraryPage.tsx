import React, { useState, useRef, useEffect } from 'react';
import { Search, Grid, List, MoreHorizontal, FileText, FileSpreadsheet, Presentation, FileCode, ChevronRight, Filter, Globe, Image, BarChart2, ChevronDown, Loader2 } from 'lucide-react';
import { sessionService } from '../api/sessions';
import { fileService } from '../api/files';
import FilePreviewModal from './FilePreviewModal';

interface SessionWithFiles {
    id: string;
    title: string;
    createdAt: string;
    files: FileInfo[];
}

interface FileInfo {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    sessionId?: string;
    createdAt: string;
    // Backend API fields
    filename?: string;
    contentType?: string;
    storagePath?: string;
}

type FileType = 'pdf' | 'doc' | 'csv' | 'ppt' | 'md' | 'image' | 'video' | 'other';

const getFileTypeFromContentType = (contentType: string, filename: string): FileType => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    if (contentType.includes('pdf') || ext === 'pdf') return 'pdf';
    if (contentType.includes('word') || contentType.includes('document') || ['doc', 'docx'].includes(ext)) return 'doc';
    if (contentType.includes('csv') || ext === 'csv') return 'csv';
    if (contentType.includes('presentation') || contentType.includes('powerpoint') || ['ppt', 'pptx'].includes(ext)) return 'ppt';
    if (contentType.includes('markdown') || ['md', 'markdown'].includes(ext)) return 'md';
    if (contentType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (contentType.includes('video') || ['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video';

    return 'other';
};

const FileIcon = ({ type }: { type: FileType }) => {
    switch (type) {
        case 'pdf': return <div className="p-1.5 bg-red-50 rounded text-red-500"><FileText size={18} /></div>;
        case 'doc': return <div className="p-1.5 bg-brand-50 rounded text-brand-600"><FileText size={18} /></div>;
        case 'csv': return <div className="p-1.5 bg-green-50 rounded text-green-600"><FileSpreadsheet size={18} /></div>;
        case 'ppt': return <div className="p-1.5 bg-orange-50 rounded text-orange-500"><Presentation size={18} /></div>;
        case 'md': return <div className="p-1.5 bg-slate-50 rounded text-slate-600"><FileCode size={18} /></div>;
        case 'image': return <div className="p-1.5 bg-purple-50 rounded text-purple-500"><Image size={18} /></div>;
        case 'video': return <div className="p-1.5 bg-indigo-50 rounded text-indigo-500"><Globe size={18} /></div>;
        default: return <div className="p-1.5 bg-slate-50 rounded text-slate-400"><FileText size={18} /></div>;
    }
};

const LibraryPage: React.FC = () => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('所有类型');
    const [sessionsWithFiles, setSessionsWithFiles] = useState<SessionWithFiles[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    // 加载会话和文件
    useEffect(() => {
        loadSessionsAndFiles();
    }, []);

    const loadSessionsAndFiles = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. 获取所有会话
            const sessionsResponse = await sessionService.list({ page: 1, limit: 50 });

            if (!sessionsResponse.success || !sessionsResponse.data) {
                throw new Error('Failed to load sessions');
            }

            const sessions = sessionsResponse.data.items;

            // 2. 为每个会话获取文件列表
            const sessionsWithFilesData = await Promise.all(
                sessions.map(async (session) => {
                    try {
                        const filesResponse = await fileService.listBySession(session.id);
                        const files = filesResponse.success && filesResponse.data ? filesResponse.data : [];

                        return {
                            id: session.id,
                            title: session.title || '未命名会话',
                            createdAt: session.createdAt,
                            files: files.map(file => ({
                                id: file.id,
                                name: file.filename || file.name || 'unnamed',
                                type: file.contentType || file.type || 'application/octet-stream',
                                size: file.size,
                                url: file.storagePath || file.url || '',
                                sessionId: session.id,
                                createdAt: file.createdAt
                            }))
                        };
                    } catch (err) {
                        console.error(`Failed to load files for session ${session.id}:`, err);
                        return {
                            id: session.id,
                            title: session.title || '未命名会话',
                            createdAt: session.createdAt,
                            files: []
                        };
                    }
                })
            );

            // 3. 只保留有文件的会话
            const filteredSessions = sessionsWithFilesData.filter(s => s.files.length > 0);

            setSessionsWithFiles(filteredSessions);
        } catch (err) {
            console.error('Error loading sessions and files:', err);
            setError(err instanceof Error ? err.message : '加载任务管理中心失败');
        } finally {
            setIsLoading(false);
        }
    };

    // Close filter when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filterOptions = [
        { label: '所有类型', icon: <Filter size={16} /> },
        { label: '文档', icon: <FileText size={16} /> },
        { label: '幻灯片', icon: <Presentation size={16} /> },
        { label: '网页', icon: <Globe size={16} /> },
        { label: '图像与视频', icon: <Image size={16} /> },
        { label: '图表与表格', icon: <BarChart2 size={16} /> },
    ];

    // 根据筛选条件过滤文件
    const filterFiles = (files: FileInfo[]): FileInfo[] => {
        if (selectedFilter === '所有类型') return files;

        return files.filter(file => {
            const fileType = getFileTypeFromContentType(file.type, file.name);

            switch (selectedFilter) {
                case '文档':
                    return ['pdf', 'doc', 'md'].includes(fileType);
                case '幻灯片':
                    return fileType === 'ppt';
                case '网页':
                    return file.name.endsWith('.html') || file.name.endsWith('.htm');
                case '图像与视频':
                    return ['image', 'video'].includes(fileType);
                case '图表与表格':
                    return fileType === 'csv';
                default:
                    return true;
            }
        });
    };

    // 格式化日期
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4 relative" ref={filterRef}>
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 font-medium hover:bg-slate-50 transition-all"
                    >
                        {filterOptions.find(opt => opt.label === selectedFilter)?.icon || <Filter size={16} />}
                        {selectedFilter}
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Filter Dropdown */}
                    {isFilterOpen && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 z-[110] animate-in fade-in zoom-in-95 duration-200">
                            {filterOptions.map((option) => (
                                <button
                                    key={option.label}
                                    onClick={() => {
                                        setSelectedFilter(option.label);
                                        setIsFilterOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${selectedFilter === option.label ? 'bg-slate-50 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    <div className="text-slate-400">
                                        {option.icon}
                                    </div>
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="搜索"
                            className="w-full h-10 pl-10 pr-12 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-slate-400"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-bold text-slate-400 px-1.5 py-0.5 border border-slate-200 rounded uppercase">
                            ⌘K
                        </div>
                    </div>

                    <div className="flex items-center p-1 bg-slate-50 rounded-xl">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600">
                            <Grid size={18} />
                        </button>
                        <button className="p-1.5 bg-white shadow-sm rounded-lg text-slate-800">
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-12 pb-24">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={40} className="text-brand-500 animate-spin mb-4" />
                        <p className="text-sm text-slate-500">加载任务管理中心...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-red-500 mb-2">
                            <FileText size={40} />
                        </div>
                        <p className="text-sm text-slate-600">加载失败: {error}</p>
                        <button
                            onClick={loadSessionsAndFiles}
                            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                        >
                            重试
                        </button>
                    </div>
                ) : sessionsWithFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-slate-300 mb-4">
                            <FileText size={48} />
                        </div>
                        <p className="text-base font-medium text-slate-600">暂无文件</p>
                        <p className="text-sm text-slate-400 mt-2">开始对话并上传文件后，这里将显示所有资源</p>
                    </div>
                ) : (
                    sessionsWithFiles.map((group) => {
                        const filteredFiles = filterFiles(group.files);
                        if (filteredFiles.length === 0) return null;

                        return (
                            <section key={group.id} className="animate-slide-up">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[15px] font-bold text-slate-800 flex items-center gap-1 cursor-pointer hover:text-brand-600 transition-colors">
                                        {group.title}
                                        <ChevronRight size={16} />
                                    </h3>
                                    <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">
                                        {formatDate(group.createdAt)}
                                    </span>
                                </div>

                                <div className="space-y-px">
                                    {filteredFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                                            onClick={() => {
                                                setPreviewFile(file);
                                            }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <FileIcon type={getFileTypeFromContentType(file.type, file.name)} />
                                                <span className="text-[14px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                                                    {file.name}
                                                </span>
                                            </div>
                                            <button className="p-2 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })
                )}
            </div>

            {/* File Preview Modal */}
            {previewFile && (
                <FilePreviewModal
                    file={previewFile}
                    onClose={() => setPreviewFile(null)}
                />
            )}
        </div>
    );
};

export default LibraryPage;
