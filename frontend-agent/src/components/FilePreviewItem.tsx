import React from 'react';
import { X, FileText, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    progress: number;
    status: 'uploading' | 'complete' | 'error';
    type: string;
}

interface FilePreviewItemProps {
    file: UploadedFile;
    onRemove: (id: string) => void;
}

const FilePreviewItem: React.FC<FilePreviewItemProps> = ({ file, onRemove }) => {
    const isImage = file.type.startsWith('image/');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="flex items-center gap-3 p-2.5 bg-white/60 backdrop-blur-md border border-white/80 shadow-sm rounded-2xl min-w-[200px] max-w-[260px] group relative"
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isImage ? 'bg-orange-100/50 text-orange-600' : 'bg-blue-100/50 text-blue-600'}`}>
                {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
            </div>

            <div className="flex-1 min-w-0 pr-6">
                <div className="text-[13px] font-bold text-slate-800 truncate mb-1">
                    {file.name}
                </div>
                <div className="flex items-center gap-2">
                    {file.status === 'uploading' ? (
                        <>
                            <div className="flex-1 h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${file.progress}%` }}
                                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                    className="h-full bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                />
                            </div>
                            <span className="text-[10px] font-black text-brand-600 tabular-nums w-8">{file.progress}%</span>
                        </>
                    ) : file.status === 'complete' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                            <CheckCircle2 size={10} />
                            <span className="text-[9px] font-black uppercase tracking-wider">Ready</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-fit">
                            <AlertCircle size={10} />
                            <span className="text-[9px] font-black uppercase tracking-wider">Error</span>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={() => onRemove(file.id)}
                className="absolute top-1.5 right-1.5 p-1 bg-white shadow-sm border border-slate-100 rounded-full text-slate-400 hover:text-red-500 hover:border-red-100 transition-all opacity-0 group-hover:opacity-100"
            >
                <X size={10} />
            </button>
        </motion.div>
    );
};

export default FilePreviewItem;
