import React from 'react';
import { Zap, CreditCard, Check } from 'lucide-react';

const BillingSubscription: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">当前计划</h3>
                        <p className="text-slate-500 text-sm mt-1">您当前正在使用 Pro 计划</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 uppercase tracking-wider border border-brand-100">
                        Pro Member
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-900">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900">Visa ending in 4242</div>
                                <div className="text-xs text-slate-500">下次扣费: 2026/03/07</div>
                            </div>
                        </div>
                        <button className="text-sm font-bold text-brand-600 hover:text-brand-700">管理支付方式</button>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg shadow-brand-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={20} className="text-yellow-300 fill-yellow-300" />
                            <span className="font-bold">升级到 Business</span>
                        </div>
                        <p className="text-white/80 text-xs mb-4">解锁更多高级功能和团队协作能力</p>
                        <button className="w-full py-2 bg-white text-brand-600 rounded-lg text-xs font-bold hover:bg-white/90 transition-colors">
                            立即升级
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60">
                <h3 className="mb-4 text-lg font-bold text-slate-900">账单历史</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-xl">日期</th>
                                <th className="px-4 py-3">描述</th>
                                <th className="px-4 py-3">金额</th>
                                <th className="px-4 py-3 rounded-r-xl">状态</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[
                                { date: '2026/02/07', desc: 'Pro Plan Monthly', amount: '$19.00', status: 'Paid' },
                                { date: '2026/01/07', desc: 'Pro Plan Monthly', amount: '$19.00', status: 'Paid' },
                                { date: '2025/12/07', desc: 'Pro Plan Monthly', amount: '$19.00', status: 'Paid' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-900">{row.date}</td>
                                    <td className="px-4 py-3 text-slate-600">{row.desc}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{row.amount}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
                                            <Check size={10} />
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BillingSubscription;
