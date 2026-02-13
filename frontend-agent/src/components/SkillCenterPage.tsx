import React, { useState, useRef, useEffect } from 'react';
import {
    Search, FlaskConical,
    Code2, PenTool, ChevronRight,
    Filter, Zap, Plus, Cpu,
    ChevronDown, Sliders, Info,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { skillApi, type Skill } from '../api/skillApi';
import { toast } from 'react-hot-toast';

const CategoryBadge = ({ category }: { category: string | null }) => {
    const styles: Record<string, string> = {
        research: "bg-blue-50 text-blue-600",
        writing: "bg-purple-50 text-purple-600",
        tech: "bg-emerald-50 text-emerald-600",
        workflow: "bg-orange-50 text-orange-600",
        default: "bg-slate-50 text-slate-600"
    };

    const labels: Record<string, string> = {
        research: "研究",
        writing: "写作",
        tech: "技术",
        workflow: "工作流"
    };

    const style = (category && styles[category]) || styles.default;
    const label = (category && labels[category]) || category || "未知";

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style}`}>
            {label}
        </span>
    );
};

// 工具函数：根据分类获取图标
const getCategoryIcon = (category: string | null, size: number = 20) => {
    switch (category) {
        case 'research': return <FlaskConical size={size} />;
        case 'writing': return <PenTool size={size} />;
        case 'tech': return <Code2 size={size} />;
        case 'workflow': return <Zap size={size} />;
        default: return <Cpu size={size} />;
    }
};

const SkillCenterPage: React.FC = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('所有技能');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const filterRef = useRef<HTMLDivElement>(null);

    const categories = [
        { label: '所有技能', icon: <Filter size={16} /> },
        { label: '研究', category: 'research', icon: <FlaskConical size={16} /> },
        { label: '写作', category: 'writing', icon: <PenTool size={16} /> },
        { label: '技术', category: 'tech', icon: <Code2 size={16} /> },
        { label: '工作流', category: 'workflow', icon: <Zap size={16} /> },
    ];

    const fetchSkills = async () => {
        setIsLoading(true);
        try {
            const data = await skillApi.listSkills();
            setSkills(data);
        } catch (error) {
            console.error('Failed to fetch skills:', error);
            toast.error('获取技能列表失败');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const handleToggleSkill = async (skill: Skill) => {
        try {
            if (skill.is_installed) {
                await skillApi.uninstallSkill(skill.id);
                toast.success(`已卸载技能: ${skill.display_name || skill.name}`);
            } else {
                await skillApi.installSkill(skill.id);
                toast.success(`已激活技能: ${skill.display_name || skill.name}`);
            }
            fetchSkills(); // 刷新列表
        } catch (error) {
            console.error('Failed to toggle skill:', error);
            toast.error('操作失败');
        }
    };

    const filteredSkills = skills.filter(skill => {
        const matchesCategory = selectedCategory === '所有技能' || skill.category === categories.find(c => c.label === selectedCategory)?.category;
        const matchesSearch = (skill.display_name || skill.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
            (skill.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex-1 bg-[#fcfcfd] flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4 relative" ref={filterRef}>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                            <Compass size={24} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800">技能中心</h1>
                    </div>

                    <div className="h-6 w-[1px] bg-slate-200 mx-2" />

                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 font-medium hover:bg-slate-50 transition-all"
                    >
                        {categories.find(opt => opt.label === selectedCategory)?.icon}
                        {selectedCategory}
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-[140px] mt-2 w-48 bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 z-[110]"
                            >
                                {categories.map((option) => (
                                    <button
                                        key={option.label}
                                        onClick={() => {
                                            setSelectedCategory(option.label || '');
                                            setIsFilterOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${selectedCategory === option.label ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <div className={selectedCategory === option.label ? 'text-brand-500' : 'text-slate-400'}>
                                            {option.icon}
                                        </div>
                                        {option.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="搜索技能..."
                            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:bg-white outline-none transition-all"
                        />
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95">
                        <Plus size={18} />
                        创建技能
                    </button>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                {/* Featured Banner */}
                <div className="mb-10 p-8 rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white relative overflow-hidden shadow-xl shadow-brand-100 animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative z-10 max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold uppercase tracking-widest mb-4">
                            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                            推荐技能
                        </div>
                        <h2 className="text-3xl font-bold mb-3">AI 审稿代理人</h2>
                        <p className="text-brand-50/80 mb-6 text-[15px] leading-relaxed">
                            深度模拟 CVPR/ICCV 审稿标准，为你的 CV 论文提供极具建设性的审稿意见与改进路径图。
                        </p>
                        <button className="px-6 py-2.5 bg-white text-brand-600 rounded-xl text-sm font-bold hover:bg-brand-50 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-black/10">
                            立即使用
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Abstract Decorations */}
                    <div className="absolute right-[-40px] top-[-20px] w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute right-10 bottom-[-60px] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
                    <Cpu className="absolute right-12 top-1/2 -translate-y-1/2 w-48 h-48 text-white/10" />
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">全部能力</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>显示 {filteredSkills.length} 个结果</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                        <p className="text-slate-400 text-sm">正在加载技能库...</p>
                    </div>
                ) : filteredSkills.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <Cpu size={32} />
                        </div>
                        <p className="text-slate-400 text-sm">没有找到相关技能</p>
                    </div>
                ) : (
                    /* Skills Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSkills.map((skill, idx) => (
                            <motion.div
                                key={skill.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -5 }}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
                            >
                                {/* Skill Icon */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl transition-colors ${skill.is_installed ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400'}`}>
                                        {getCategoryIcon(skill.category)}
                                    </div>
                                    <CategoryBadge category={skill.category} />
                                </div>

                                <h4 className="font-bold text-slate-800 mb-2 truncate group-hover:text-brand-600 transition-colors">
                                    {skill.display_name || skill.name}
                                </h4>
                                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 h-10 mb-6">
                                    {skill.description || '暂无描述'}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Info size={10} className="text-slate-400" />
                                        </div>
                                        <span className="text-[11px] font-medium text-slate-400 underline decoration-slate-200">详情</span>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleSkill(skill);
                                        }}
                                        className={`flex items-center gap-1.5 text-xs font-bold transition-all ${skill.is_installed ? 'text-emerald-500' : 'text-slate-400 group-hover:text-brand-500'}`}
                                    >
                                        {skill.is_installed ? (
                                            <>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                已激活
                                            </>
                                        ) : (
                                            <>
                                                <Sliders size={14} />
                                                配置并激活
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
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
        </div>
    );
};

// Placeholder for Compass since it might not be in the current Lucide version/project
const Compass = ({ size, className }: { size?: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
);

export default SkillCenterPage;
