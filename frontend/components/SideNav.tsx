/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Icon, ICONS } from './shared';

export const SideNav = ({ activeView, setActiveView, isCollapsed, setIsCollapsed }) => {
    const navItems = [
        { name: '看板', icon: 'dashboard' },
        { name: '数据平台', icon: 'data' },
        { name: '模型训练', icon: 'training' },
        { name: '模型部署', icon: 'inference' },
        { name: '模型评测', icon: 'beaker' },
        { name: '观测性平台', icon: 'observability' },
    ];

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 bg-white/80 border-r border-gray-200 flex flex-col backdrop-blur-lg transition-all duration-300 ease-in-out`}>
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 overflow-hidden">
                {!isCollapsed && (
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-lg shadow-gray-200 group-hover:rotate-6 transition-transform">
                            <Icon path={ICONS.utrainer} className="w-5 h-5 text-indigo-400" />
                        </div>
                        <span className="text-xl font-black text-gray-900 tracking-tighter animate-in fade-in slide-in-from-left-4 duration-500">
                            uTrainer
                        </span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="w-full flex justify-center">
                        <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-lg shadow-gray-200">
                            <Icon path={ICONS.utrainer} className="w-5 h-5 text-indigo-400" />
                        </div>
                    </div>
                )}
                {!isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all ml-auto"
                    >
                        <Icon path={ICONS.panelLeft} className="w-5 h-5" />
                    </button>
                )}
            </div>

            {isCollapsed && (
                <div className="flex justify-center py-4 border-b border-gray-50/50">
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="p-2 rounded-xl text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    >
                        <Icon path={ICONS.panelLeft} className="w-5 h-5 rotate-180" />
                    </button>
                </div>
            )}

            <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} py-6 space-y-2 overflow-y-auto custom-scrollbar`}>
                {navItems.map(item => {
                    const isDataPlatform = item.name === '数据平台';
                    const subViews = ['数据集中心', '数据处理', '数据集构建'];
                    const isActive = activeView === item.name || (isDataPlatform && subViews.includes(activeView));

                    return (
                        <div key={item.name} className="relative group/nav">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); setActiveView(isDataPlatform ? '数据集中心' : item.name); }}
                                className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'px-4 py-2.5'} text-sm font-black rounded-xl transition-all duration-300 group ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-lg transition-colors ${isCollapsed ? '' : 'mr-3'} ${isActive
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                                    }`}>
                                    <Icon path={ICONS[item.icon]} className="w-4 h-4" />
                                </div>
                                {!isCollapsed && (
                                    <span className="flex-1 tracking-tight truncate animate-in fade-in slide-in-from-left-2 duration-300">
                                        {item.name}
                                    </span>
                                )}
                            </a>

                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover/nav:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
                                    {item.name}
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
};