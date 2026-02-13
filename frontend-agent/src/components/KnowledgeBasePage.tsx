import React from 'react';
import { Database, Search, Plus } from 'lucide-react';

const KnowledgeBasePage: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                        <Database size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight">知识库</h1>
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">Knowledge Base</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group/search">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-brand-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="搜索知识库..."
                            className="bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all shadow-sm shadow-brand-200">
                        <Plus size={18} />
                        <span>新建知识库</span>
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
                    <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6">
                        <Database size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">知识库集成中</h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        知识库功能正在全力开发中，敬请期待！在这里您可以构建私有知识库，提升智能体的专业能力。
                    </p>
                </div>
            </main>
        </div>
    );
};

export default KnowledgeBasePage;
