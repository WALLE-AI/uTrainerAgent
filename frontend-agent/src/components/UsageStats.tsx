import { useEffect } from 'react';
import { MessageSquare, BookOpen, CheckCircle } from 'lucide-react';

const UsageStats = () => {
    // const [stats, setStats] = useState<UserOverviewStats | null>(null);
    // const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // const data = await userStatsApi.getUserOverview();
                // setStats(data);
            } catch (err) {
                console.error('Failed to fetch usage stats:', err);
            }
        };

        fetchStats();
    }, []);


    const statsConfig = [
        {
            label: '智能体交互',
            innerLabel: 'Agent Interactions',
            value: '2.4k 次',
            trend: '+15%',
            icon: <MessageSquare size={18} className="text-indigo-500" />,
            color: 'bg-indigo-50'
        },
        {
            label: '知识库扩充',
            innerLabel: 'KB Items Added',
            value: '128 篇',
            trend: '+8.4%',
            icon: <BookOpen size={18} className="text-amber-500" />,
            color: 'bg-amber-50'
        },
        {
            label: '任务成功率',
            innerLabel: 'Task Success Rate',
            value: '98.2%',
            trend: 'Optimized',
            icon: <CheckCircle size={18} className="text-emerald-500" />,
            color: 'bg-emerald-50'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {statsConfig.map((stat, index) => (
                    <div
                        key={index}
                        className="group relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-soft transition-all hover:shadow-premium hover:-translate-y-1 cursor-default"
                    >
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color} border border-white shadow-soft transition-all group-hover:scale-110 group-hover:rotate-3`}>
                                    {stat.icon}
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">
                                    {stat.trend}
                                </span>
                            </div>
                            <div className="text-3xl font-black text-slate-900 mb-1 tracking-tight">
                                {stat.value}
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 opacity-60">
                                {stat.innerLabel}
                            </div>
                            <div className="text-xs font-black text-indigo-700/80 uppercase tracking-widest">
                                {stat.label}
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 h-32 w-32 translate-x-16 translate-y-[-2rem] rounded-full bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px] mb-2">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">周期剩余额度 (Cycle Remaining)</span>
                        <span className="text-slate-600 font-black text-base">∞</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden p-[2px] border border-slate-100">
                        <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full shadow-sm" style={{ width: '100%' }} />
                    </div>
                </div>
                <div className="md:w-64">
                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                        您正在使用 <span className="text-brand-600 font-black">无限额度</span> 版本。尽情创作吧！
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UsageStats;
