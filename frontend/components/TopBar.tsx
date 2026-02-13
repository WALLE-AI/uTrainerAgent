/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Icon, ICONS } from './shared';
import { GlobalTaskCenter } from './GlobalTaskCenter';

const { useState } = React;

export const TopBar = ({ isSidebarCollapsed = false, onNavigate, user }: { isSidebarCollapsed?: boolean, onNavigate?: (view: string) => void, user?: any }) => {
    const [isTaskCenterOpen, setIsTaskCenterOpen] = useState(false);

    return (
        <header className="h-16 bg-white/80 border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 backdrop-blur-lg z-10">
            <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-sm font-medium p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700">
                    <span>My Project</span>
                    <Icon path={ICONS.chevronDown} className="w-4 h-4" />
                </button>
                <div className="relative">
                    <Icon path={ICONS.search} className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="全局搜索..." className="bg-gray-100 border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800" />
                </div>
            </div>
            <div className="flex items-center space-x-5">
                <button
                    onClick={() => setIsTaskCenterOpen(true)}
                    className={`p-2 rounded-lg transition-all ${isTaskCenterOpen ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                    <Icon path={ICONS.tasks} />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors hover:bg-gray-100 rounded-lg"><Icon path={ICONS.bell} /></button>
                <button
                    onClick={() => onNavigate && onNavigate('用户详情')}
                    className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg hover:scale-110 active:scale-95 transition-all outline-none"
                >
                    {user?.name?.[0] || 'U'}
                </button>
            </div>

            <GlobalTaskCenter isOpen={isTaskCenterOpen} onClose={() => setIsTaskCenterOpen(false)} />
        </header>
    );
};
