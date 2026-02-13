/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Icon, ICONS, Toggle } from './shared';

export const UserProfile = ({ user, onLogout }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header: Personal Cockpit */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">个人驾驶舱</h1>
                    <p className="text-gray-500 font-medium text-xs">管理您的身份、安全以及个人计算资源。</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Side: Identity & Stats */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* User Profile Card */}
                    <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm hover:shadow-xl transition-all duration-500">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative group mb-6">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                                <div className="relative w-32 h-32 bg-gray-900 rounded-full flex items-center justify-center text-5xl font-black text-white shadow-2xl">
                                    {user.name[0]}
                                </div>
                                <button className="absolute bottom-1 right-1 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white hover:scale-110 transition-transform">
                                    <Icon path={ICONS.pencil} className="w-4 h-4" />
                                </button>
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{user.name}</h2>
                            <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-6">资深 AI 工程师 / Senior AI Engineer</p>

                            <div className="w-full grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">所属组织 / Organization</p>
                                    <p className="text-xs font-bold text-gray-800">WALLE-AI Studio</p>
                                </div>
                                <div className="text-left border-l border-gray-50 pl-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">加入时间 / Since</p>
                                    <p className="text-xs font-bold text-gray-800">2024年1月</p>
                                </div>
                            </div>

                            <button
                                onClick={onLogout}
                                className="w-full mt-8 flex items-center justify-center px-6 py-4 bg-red-50/50 text-red-600 rounded-3xl font-black text-xs uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95"
                            >
                                退出登录
                            </button>
                        </div>
                    </div>

                    {/* Stats Cockpit */}
                    <div className="bg-gray-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-8">概览 / Cockpit Overview</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">累计算力时长 / Compute Hours</p>
                                    <p className="text-2xl font-black tracking-tight font-mono">250.4<span className="text-xs ml-1 font-sans opacity-40">h</span></p>
                                </div>
                                <div className="w-16 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                                    <Icon path={ICONS.chartBar} className="w-4 h-4 text-indigo-400" />
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">已处理数据量 / Data Processed</p>
                                    <p className="text-2xl font-black tracking-tight font-mono">1.2<span className="text-xs ml-1 font-sans opacity-40">TB</span></p>
                                </div>
                                <div className="w-16 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <Icon path={ICONS.data} className="w-4 h-4 text-green-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Security & Settings */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* API Key Management */}
                    <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-1">API 密钥与安全性 / Keys & Security</h3>
                                <p className="text-gray-400 font-medium text-xs">管理 SDK 及外部集成的身份验证密钥。</p>
                            </div>
                            <button className="bg-indigo-600 text-white font-black px-6 py-2.5 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
                                生成新密钥 / New Key
                            </button>
                        </div>

                        <div className="space-y-4">
                            {[
                                { name: 'Production-SDK-Key', key: 'ut_sk_••••••••••••••••3a81', created: '2 天前', lastUsed: '2 分钟前' },
                                { name: 'Development-Local', key: 'ut_sk_••••••••••••••••f922', created: '1 个月前', lastUsed: '4 小时前' }
                            ].map((k, i) => (
                                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-indigo-100 transition-all group">
                                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-gray-400 group-hover:text-indigo-600 transition-colors">
                                            <Icon path={ICONS.shield} className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 mb-1">{k.name}</p>
                                            <p className="text-xs font-mono font-bold text-gray-400">{k.key}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">最后使用 / Last Used</p>
                                            <p className="text-xs font-bold text-gray-800">{k.lastUsed}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Icon path={ICONS.pencil} className="w-4 h-4" /></button>
                                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Icon path={ICONS.trash} className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notification Preferences */}
                    <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight mb-1">系统偏好设置 / System Preferences</h3>
                        <p className="text-gray-400 font-medium text-xs mb-8">配置您的个人工作空间体验。</p>

                        <div className="space-y-6">
                            {[
                                { label: '训练完成邮件通知', desc: 'SFT 或预训练任务完成时发送详细报告。', enabled: true },
                                { label: '节点状态预警', desc: '当部署实例进入异常状态时向您发送即时通知。', enabled: false },
                                { label: 'Beta 功能优先体验', desc: '开启实验性评测指标与模型引擎的抢先体验。', enabled: true }
                            ].map((pref, i) => (
                                <div key={i} className="flex justify-between items-center group">
                                    <div className="max-w-md">
                                        <p className="text-sm font-black text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">{pref.label}</p>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{pref.desc}</p>
                                    </div>
                                    <Toggle enabled={pref.enabled} setEnabled={() => { }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
