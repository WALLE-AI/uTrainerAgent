import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FileInfo {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    sessionId?: string;
    createdAt: string;
}

interface FilePreviewModalProps {
    file: FileInfo;
    onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
    const [fileContent, setFileContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    // 根据文件类型和名称确定预览方式
    const getFileType = () => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const contentType = file.type.toLowerCase();

        if (contentType.includes('pdf') || ext === 'pdf') return 'pdf';
        if (contentType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
        if (contentType.includes('video') || ['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video';
        if (['md', 'markdown'].includes(ext)) return 'markdown';
        if (['html', 'htm'].includes(ext)) return 'html';
        if (contentType.includes('word') || ['doc', 'docx'].includes(ext)) return 'document';
        if (contentType.includes('presentation') || contentType.includes('powerpoint') || ['ppt', 'pptx'].includes(ext)) return 'presentation';

        return 'other';
    };

    const fileType = getFileType();

    // 格式化文件大小
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // 获取文件内容（用于 Markdown 和 HTML）
    useEffect(() => {
        const fetchFileContent = async () => {
            if (!file.url || fileType !== 'markdown') return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(file.url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const text = await response.text();
                setFileContent(text);
            } catch (err) {
                console.error('Failed to fetch file content:', err);
                setError(err instanceof Error ? err.message : '加载文件失败');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFileContent();
    }, [file.url, fileType]);

    // 处理文件下载
    const handleDownload = async () => {
        setIsDownloading(true);
        setDownloadProgress(0);

        try {
            const { fileService } = await import('../api/files');
            await fileService.download(
                file.id,
                file.name,
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
            setError(err instanceof Error ? err.message : '下载失败');
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    // 渲染预览内容
    const renderPreview = () => {
        if (!file.url) {
            return (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                        <ExternalLink size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="text-sm">文件 URL 不可用</p>
                    </div>
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 size={48} className="mx-auto mb-4 text-brand-600 animate-spin" />
                        <p className="text-sm text-slate-600">加载中...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex-1 flex items-center justify-center text-red-500">
                    <div className="text-center max-w-md">
                        <p className="text-sm mb-4">加载失败: {error}</p>
                        <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
                        >
                            <ExternalLink size={16} />
                            在新标签页打开
                        </a>
                    </div>
                </div>
            );
        }

        switch (fileType) {
            case 'pdf':
                return (
                    <div className="w-full h-full overflow-auto">
                        <iframe
                            src={file.url}
                            className="w-full h-full border-0"
                            title={file.name}
                        />
                    </div>
                );

            case 'image':
                return (
                    <div className="w-full h-full flex items-center justify-center p-8 bg-slate-50 overflow-auto">
                        <img
                            src={file.url}
                            alt={file.name}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        />
                    </div>
                );

            case 'video':
                return (
                    <div className="w-full h-full flex items-center justify-center p-8 bg-slate-900 overflow-auto">
                        <video
                            src={file.url}
                            controls
                            className="max-w-full max-h-full rounded-lg shadow-2xl"
                        >
                            您的浏览器不支持视频播放。
                        </video>
                    </div>
                );

            case 'markdown':
                return (
                    <div className="w-full h-full overflow-y-auto p-8 bg-white">
                        <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {fileContent}
                            </ReactMarkdown>
                        </div>
                    </div>
                );

            case 'html':
                return (
                    <div className="w-full h-full overflow-hidden">
                        <iframe
                            src={file.url}
                            className="w-full h-full border-0"
                            title={file.name}
                            sandbox="allow-scripts allow-same-origin"
                        />
                    </div>
                );

            case 'document':
            case 'presentation':
                // Office 文档使用 Office Online Viewer
                const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`;
                return (
                    <iframe
                        src={viewerUrl}
                        className="w-full h-full border-0"
                        title={file.name}
                    />
                );

            default:
                return (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        <div className="text-center max-w-md">
                            <ExternalLink size={48} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-sm mb-4">此文件类型暂不支持预览</p>
                            <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
                            >
                                <Download size={16} />
                                下载文件
                            </a>
                        </div>
                    </div>
                );
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md shrink-0">
                        <div className="flex-1 min-w-0 mr-4">
                            <h2 className="text-lg font-bold text-slate-800 truncate">{file.name}</h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {formatSize(file.size)} • {new Date(file.createdAt).toLocaleString('zh-CN')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {file.url && (
                                <>
                                    <button
                                        onClick={handleDownload}
                                        disabled={isDownloading}
                                        className="relative p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={isDownloading ? `下载中... ${downloadProgress}%` : "下载"}
                                    >
                                        {isDownloading ? (
                                            <div className="relative">
                                                <Loader2 size={20} className="animate-spin" />
                                                {downloadProgress > 0 && (
                                                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-brand-600 whitespace-nowrap">
                                                        {downloadProgress}%
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <Download size={20} />
                                        )}
                                    </button>
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-brand-600 transition-colors"
                                        title="在新标签页打开"
                                    >
                                        <ExternalLink size={20} />
                                    </a>
                                </>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                title="关闭"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Preview Content */}
                    <div className="flex-1 overflow-hidden min-h-0">
                        {renderPreview()}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default FilePreviewModal;
