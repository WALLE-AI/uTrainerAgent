import React from 'react';
import { Sparkles, Zap, Database, Globe, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
    onStart: (text: string, prefill?: string) => void;
}

const features = [
    {
        icon: <Zap className="text-amber-500" size={24} />,
        title: "多场景智能生成",
        description: "支持学术论文、工作报告、会议纪要、技术文档、代码等多种创作类型，一站式满足您的创作需求。",
        color: "bg-amber-50"
    },
    {
        icon: <Database className="text-emerald-500" size={24} />,
        title: "智能知识库",
        description: "整合多源数据，精准检索与深度解析，为您的创作提供坚实的知识支撑。",
        color: "bg-emerald-50"
    },
    {
        icon: <Globe className="text-blue-500" size={24} />,
        title: "Agent 架构",
        description: "基于先进的智能 Agent 系统，理解意图、规划任务、自主执行，真正的 AI 协作体验。",
        color: "bg-blue-50"
    }
];

const pipelineSteps = [
    { label: "语义搜索", icon: <Database size={16} /> },
    { label: "内容解析", icon: <Database size={16} /> },
    { label: "逻辑重组", icon: <Database size={16} /> },
    { label: "学术写作", icon: <Sparkles size={16} /> }
];

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    return (
        <div className="flex-1 bg-[#fcfcfd] flex flex-col items-center w-full overflow-y-auto overflow-x-hidden font-inter relative">
            {/* Standalone Portal Header */}
            <header className="absolute top-0 left-0 w-full h-20 z-50 px-8 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                        <Sparkles size={20} />
                    </div>
                    <span className="text-xl font-bold text-slate-900 font-crimson tracking-tight">uGen</span>
                </div>
                <div className="flex items-center gap-4 pointer-events-auto" />
            </header>

            {/* Hero Section */}
            <section className="w-full min-h-[70vh] flex flex-col items-center justify-center px-8 relative overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500 blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500 blur-[120px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center z-10 max-w-4xl"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-widest uppercase mb-6 border border-slate-200">
                        <Sparkles size={12} className="text-brand-500" />
                        AI 驱动的通用创作平台
                    </div>
                    <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 leading-tight mb-8 font-crimson">
                        释放创造力
                        <span className="block italic text-emerald-600">AI 赋能每一次表达</span>
                    </h1>
                    <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                        uGen 是您的全能 AI 创作伙伴。无论是学术论文、工作报告、技术文档、代码生成还是数据分析，我们提供全流程的智能辅助，让专业与效率在每一次创作中完美结合。
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onStart("")}
                        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-slate-200 flex items-center gap-3 group transition-all"
                    >
                        开始您的研究
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </motion.div>
            </section>

            {/* Feature Showcase */}
            <section className="w-full max-w-6xl px-8 py-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-100 transition-all group cursor-default"
                        >
                            <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 font-crimson">{feature.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* AI Workflow Pipeline */}
            <section className="w-full bg-slate-50 py-24 flex flex-col items-center">
                <div className="text-center mb-16 px-8">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4 font-crimson">智能研究工作流</h2>
                    <p className="text-slate-500 max-w-lg mx-auto font-medium">看 AI 如何在幕后全速运转，将您的想法转化为严谨的论文结构</p>
                </div>

                <div className="relative flex flex-wrap justify-center gap-4 md:gap-0 px-8 w-full max-w-4xl">
                    {pipelineSteps.map((step, idx) => (
                        <div key={idx} className="relative flex flex-col items-center flex-1 min-w-[150px]">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.15 }}
                                className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-600 mb-4 relative z-10 shadow-sm"
                            >
                                {step.icon}
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0, 0.2, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-[-4px] rounded-full bg-brand-500"
                                />
                            </motion.div>
                            <span className="text-sm font-bold text-slate-700">{step.label}</span>

                            {idx < pipelineSteps.length - 1 && (
                                <div className="hidden md:block absolute top-8 left-[50%] w-full h-[2px] bg-slate-200 z-0 overflow-hidden">
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '100%' }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="h-full w-1/2 bg-gradient-to-r from-transparent via-brand-500 to-transparent"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer / Contact Suggestion */}
            <footer className="w-full py-12 px-8 flex flex-col items-center justify-center border-t border-slate-50 opacity-40 hover:opacity-100 transition-opacity">
                <p className="text-slate-400 text-sm font-medium">© 2026 uGen Intelligence Labs. Powered by Next-Gen AI.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
