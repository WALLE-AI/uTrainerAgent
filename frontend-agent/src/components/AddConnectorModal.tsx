import React, { useState } from 'react';
import { X, Globe, Database, Plus, Search, SlidersHorizontal, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectorCardProps {
    name: string;
    description: string;
    icon: React.ReactNode;
    status?: string;
    color: string;
}

const ConnectorCard: React.FC<ConnectorCardProps> = ({ name, description, icon, status, color }) => (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:border-brand-200 hover:shadow-md transition-all group cursor-pointer">
        <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${color}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-800 text-[15px] truncate">{name}</h3>
                    {status && (
                        <span className="text-[10px] font-bold text-slate-400 animate-pulse">{status}</span>
                    )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {description}
                </p>
            </div>
        </div>
    </div>
);

interface AddConnectorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddConnectorModal: React.FC<AddConnectorModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'recommended' | 'mcp'>('recommended');

    const recommended = [
        {
            name: 'Notion',
            description: '使用 Notion MCP 服务器在 OAuth 后访问并管理用户的 Notion 工作区。',
            icon: <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" className="w-6 h-6" alt="Notion" />,
            color: 'bg-white',
            status: '连接中'
        },
        {
            name: '飞书',
            description: '集成飞书文档与多维表格，实现企业内部知识的无缝检索。',
            icon: <img src="https://img.js.design/assets/static/813d33267d163777f985a952d7e90897" className="w-6 h-6" alt="Feishu" />,
            color: 'bg-white'
        }
    ];

    const databases = [
        {
            name: 'Supabase',
            description: '管理您的数据库、身份验证和存储。',
            icon: <Database size={24} className="text-emerald-500" />,
            color: 'bg-emerald-50'
        },
        {
            name: 'PostgreSQL',
            description: '连接标准关系型数据库，支持复杂的 SQL 查询与分析。',
            icon: <Database size={24} className="text-blue-500" />,
            color: 'bg-blue-50'
        },
        {
            name: 'MySQL',
            description: '广泛使用的开源关系型数据库，适用于各类应用场景。',
            icon: <Database size={24} className="text-blue-600" />,
            color: 'bg-blue-50'
        },
        {
            name: 'Elasticsearch',
            description: '高性能搜索引擎，支持海量文本数据的全文检索。',
            icon: <Search size={24} className="text-yellow-600" />,
            color: 'bg-yellow-50'
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-800">添加连接器</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs & Actions */}
                        <div className="px-8 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-8">
                                <button
                                    onClick={() => setActiveTab('recommended')}
                                    className={`py-4 text-[15px] font-bold border-b-2 transition-all relative ${activeTab === 'recommended' ? 'text-slate-900 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                                >
                                    推荐
                                </button>
                                <button
                                    onClick={() => setActiveTab('mcp')}
                                    className={`py-4 text-[15px] font-bold border-b-2 transition-all relative ${activeTab === 'mcp' ? 'text-slate-900 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                                >
                                    自定义 MCP
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600 hover:border-brand-200 hover:text-brand-600 transition-all text-xs font-bold shadow-sm">
                                    <Plus size={14} />
                                    添加自定义 MCP
                                </button>
                                <button className="p-2 bg-slate-50 rounded-full border border-slate-100 text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
                                    <SlidersHorizontal size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-white">
                            {activeTab === 'recommended' ? (
                                <div className="space-y-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-6 text-slate-400 group">
                                            <LayoutGrid size={16} />
                                            <span className="text-[11px] font-bold uppercase tracking-wider">默认推荐</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {recommended.map((item, idx) => (
                                                <ConnectorCard key={idx} {...item} />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-6 text-slate-400">
                                            <Database size={16} />
                                            <span className="text-[11px] font-bold uppercase tracking-wider">数据库集成</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {databases.map((item, idx) => (
                                                <ConnectorCard key={idx} {...item} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                                        <Globe size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">未找到自定义 MCP</h3>
                                    <p className="text-slate-400 text-sm max-w-sm mb-8">
                                        您还没有添加任何自定义模型上下文协议服务。点击上方按钮开始配置。
                                    </p>
                                    <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
                                        立即配置 MCP
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddConnectorModal;
