import React, { useState, useRef, useEffect } from 'react';
import { Plus, Database, Search, ChevronDown, CheckCircle2, PanelLeft, Clock, Compass, User, LogIn, Loader2, History, Layers, Folder, Activity } from 'lucide-react';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import { sessionService } from '../api/sessions';
import { workspaceApi, type Workspace } from '../api/workspaces';
import { toast } from 'react-hot-toast';

interface SessionItem {
    id: string;
    title: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    currentView: 'landing' | 'library' | 'session' | 'skills' | 'auth' | 'profile' | 'home' | 'knowledge' | 'overview' | 'datasets' | 'training' | 'evaluation' | 'processes';
    onNavigate: (view: any) => void;
    user: { name: string; avatar: string } | null;
    currentSessionId?: string | null;
    onSessionSelect: (sessionId: string) => void;
    onNewSession: () => void;
    sessionVersion?: number; // 用于触发刷新
    onOpenProfile: (tab: 'overview' | 'settings' | 'billing') => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = React.memo(({
    isCollapsed,
    onToggle,
    currentView,
    onNavigate,
    user,
    currentSessionId,
    onSessionSelect,
    onNewSession,
    sessionVersion = 0,
    onOpenProfile,
    onLogout
}) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const [showRecentPopup, setShowRecentPopup] = useState(false);
    const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
    const [isRecentExpanded, setIsRecentExpanded] = useState(true);
    const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
    const [isArchivesExpanded, setIsArchivesExpanded] = useState(true);
    const [width, setWidth] = React.useState(256);
    const [isResizing, setIsResizing] = React.useState(false);
    const timeoutRef = useRef<number | null>(null);

    // 会话列表状态
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 工作空间状态
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
    const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);

    // 加载会话列表
    const loadSessions = async () => {
        // 需要同时有user和auth_token才能加载
        if (!user) return;
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await sessionService.list({ page: 1, limit: 10 });
            if (response.success && response.data) {
                const items = response.data.items || [];

                // 去重：确保没有重复的会话ID
                const uniqueSessions = Array.from(
                    new Map(items.map(s => [s.id, s])).values()
                );

                setSessions(uniqueSessions);
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 加载工作空间列表
    const loadWorkspaces = async () => {
        if (!user) return;

        setIsLoadingWorkspaces(true);
        try {
            const [listRes, activeRes] = await Promise.all([
                workspaceApi.list(),
                workspaceApi.getActive()
            ]);

            if (listRes.success) setWorkspaces(listRes.data || []);
            if (activeRes.success) setActiveWorkspace(activeRes.data ?? null);
        } catch (error) {
            console.error('Failed to load workspaces:', error);
        } finally {
            setIsLoadingWorkspaces(false);
        }
    };

    // 激活工作空间
    const handleWorkspaceActivate = async (workspaceId: string) => {
        try {
            const response = await workspaceApi.activate(workspaceId);
            if (response.success) {
                setActiveWorkspace(response.data ?? null);
                toast.success('工作空间已切换');
            }
        } catch (error) {
            console.error('Failed to activate workspace:', error);
            toast.error('切换工作空间失败');
        }
    };

    // 初始加载和版本变化时刷新
    useEffect(() => {
        loadSessions();
        loadWorkspaces();
    }, [user, sessionVersion]);

    // 添加定期刷新机制，确保智能体执行完成后能看到新会话
    useEffect(() => {
        if (!user) return;

        // 每30秒刷新一次会话列表
        const intervalId = setInterval(() => {
            loadSessions();
        }, 30000); // 30秒

        return () => clearInterval(intervalId);
    }, [user]);


    const startResizing = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = React.useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = React.useCallback((e: MouseEvent) => {
        if (isResizing) {
            let newWidth = e.clientX;
            if (newWidth < 160) newWidth = 160;
            if (newWidth > 480) newWidth = 480;
            setWidth(newWidth);
        }
    }, [isResizing]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu]);

    React.useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    const handleMouseEnter = () => {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        setShowRecentPopup(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = window.setTimeout(() => {
            setShowRecentPopup(false);
        }, 300);
    };

    // 格式化时间
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return '刚刚';
        if (diffMins < 60) return `${diffMins}分钟前`;
        if (diffHours < 24) return `${diffHours}小时前`;
        if (diffDays < 7) return `${diffDays}天前`;
        return date.toLocaleDateString('zh-CN');
    };


    return (
        <aside
            style={{ width: isCollapsed ? '64px' : `${width}px` }}
            className={`border-r border-slate-200 flex flex-col h-full bg-white relative group/sidebar ${isResizing ? 'cursor-col-resize' : 'transition-all duration-300 ease-in-out'}`}
        >
            {/* Resizer Handle */}
            {!isCollapsed && (
                <div
                    onMouseDown={startResizing}
                    className="absolute top-0 right-[-2px] w-1 h-full cursor-col-resize z-50 hover:bg-brand-500/30 transition-colors"
                />
            )}
            {/* Brand & Toggle */}
            <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <div
                    className={`flex items-center gap-2 ${isCollapsed ? 'hidden' : 'flex'} cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => onNavigate('landing')}
                >
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                        <Layers size={14} className="text-white" />
                    </div>
                    <span className="font-bold text-slate-900 tracking-tight whitespace-nowrap text-base">uTrainerAgent</span>
                </div>
                <div className="flex items-center gap-1">
                    {!isCollapsed && (
                        <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 transition-colors">
                            <Search size={16} />
                        </button>
                    )}
                    <div className="relative group">
                        <button
                            onClick={onToggle}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-colors flex items-center gap-2"
                        >
                            <PanelLeft size={18} />
                            {!isCollapsed && (
                                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    收起侧边栏
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <nav className={`flex-1 px-3 py-4 ${isCollapsed ? 'space-y-0' : 'space-y-6'} overflow-y-auto`}>
                <div className={`flex flex-col ${isCollapsed ? 'items-center space-y-0' : 'space-y-1'}`}>
                    <button
                        onClick={() => {
                            onNewSession();
                            onNavigate(user ? 'home' : 'landing');
                        }}
                        className={`sidebar-item w-full font-medium ${isCollapsed ? 'w-10 h-10 justify-center p-0 rounded-xl' : ''} ${currentView === 'home' || currentView === 'landing' ? 'bg-brand-50 text-brand-700' : ''}`}
                        title={isCollapsed ? '新建' : undefined}
                    >
                        <Plus size={isCollapsed ? 20 : 18} />
                        {!isCollapsed && <span>新建</span>}
                    </button>
                    <button
                        onClick={() => onNavigate('skills')}
                        className={`sidebar-item w-full ${isCollapsed ? 'w-10 h-10 justify-center p-0 rounded-xl' : ''} ${currentView === 'skills' ? 'bg-brand-50 text-brand-700' : ''}`}
                        title={isCollapsed ? '技能中心' : undefined}
                    >
                        <Compass size={isCollapsed ? 20 : 18} />
                        {!isCollapsed && <span>技能中心</span>}
                    </button>
                    <button
                        onClick={() => onNavigate('processes')}
                        className={`sidebar-item w-full ${isCollapsed ? 'w-10 h-10 justify-center p-0 rounded-xl' : ''} ${currentView === 'processes' ? 'bg-brand-50 text-brand-700' : ''}`}
                        title={isCollapsed ? '后台任务监控' : undefined}
                    >
                        <Activity size={isCollapsed ? 20 : 18} />
                        {!isCollapsed && <span>后台任务监控</span>}
                    </button>
                </div>

                <div className={isCollapsed ? 'flex justify-center' : ''}>
                    {!isCollapsed ? (
                        <>
                            <button
                                onClick={() => setIsArchivesExpanded(!isArchivesExpanded)}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors group"
                            >
                                <div className="flex items-center gap-2">
                                    <span>数据资产</span>
                                </div>
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-200 ${isArchivesExpanded ? '' : '-rotate-90'}`}
                                />
                            </button>
                            <div className={`mt-1 overflow-hidden transition-all duration-300 ease-in-out ${isArchivesExpanded ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <button
                                    onClick={() => onNavigate('datasets')}
                                    className={`sidebar-item w-full pl-8 ${currentView === 'datasets' ? 'bg-brand-50 text-brand-700' : ''}`}
                                >
                                    数据集资产
                                </button>
                                <button
                                    onClick={() => onNavigate('training')}
                                    className={`sidebar-item w-full pl-8 ${currentView === 'training' ? 'bg-brand-50 text-brand-700' : ''}`}
                                >
                                    训练模型权重
                                </button>

                                <button
                                    onClick={() => onNavigate('evaluation')}
                                    className={`sidebar-item w-full pl-8 ${currentView === 'evaluation' ? 'bg-brand-50 text-brand-700' : ''}`}
                                >
                                    评测结果榜单
                                </button>
                                <button
                                    onClick={() => onNavigate('knowledge')}
                                    className={`sidebar-item w-full pl-8 ${currentView === 'knowledge' ? 'bg-brand-50 text-brand-700' : ''}`}
                                >
                                    知识库/语料集
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => onNavigate('datasets')}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${currentView === 'datasets' || currentView === 'training' || currentView === 'evaluation' || currentView === 'knowledge' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-100'}`}
                            title="数据资产"
                        >
                            <Database size={20} />
                        </button>
                    )}
                </div>

                {/* 工作空间 */}
                <div className={isCollapsed ? 'flex justify-center' : ''}>
                    {!isCollapsed ? (
                        <>
                            <button
                                onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors group"
                            >
                                <div className="flex items-center gap-2">
                                    <span>工作空间</span>
                                </div>
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-200 ${isProjectsExpanded ? '' : '-rotate-90'}`}
                                />
                            </button>
                            <div className={`mt-1 overflow-hidden transition-all duration-300 ease-in-out ${isProjectsExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="space-y-0.5 pl-5">
                                    {workspaces.length === 0 && !isLoadingWorkspaces ? (
                                        <div className="px-4 py-2 text-slate-400 text-xs italic">
                                            暂无工作空间
                                        </div>
                                    ) : (
                                        workspaces.map(workspace => (
                                            <button
                                                key={workspace.id}
                                                onClick={() => handleWorkspaceActivate(workspace.id)}
                                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-[13px] ${activeWorkspace?.id === workspace.id
                                                    ? 'bg-brand-50 text-brand-700'
                                                    : 'text-slate-500 hover:bg-slate-100'
                                                    }`}
                                            >
                                                <Folder size={14} />
                                                <span className="truncate flex-1 text-left">{workspace.name}</span>
                                                {activeWorkspace?.id === workspace.id && (
                                                    <CheckCircle2 size={12} className="text-brand-600" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                                <button
                                    className="sidebar-item w-full pl-8 mt-1 opacity-60 hover:opacity-100"
                                    onClick={() => setIsCreateWorkspaceOpen(true)}
                                >
                                    新建工作空间
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-all"
                            title="工作空间"
                            onClick={() => setIsCreateWorkspaceOpen(true)}
                        >
                            <Layers size={20} />
                        </button>
                    )}
                </div>

                {/* 最近 */}
                <div className={isCollapsed ? 'flex justify-center' : ''}>
                    {!isCollapsed ? (
                        <>
                            <button
                                onClick={() => setIsRecentExpanded(!isRecentExpanded)}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors group"
                            >
                                <div className="flex items-center gap-2">
                                    <span>最近</span>
                                </div>
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-200 ${isRecentExpanded ? '' : '-rotate-90'}`}
                                />
                            </button>
                            <div className={`mt-1 ${isRecentExpanded ? 'block' : 'hidden'}`}>
                                <div className="space-y-2 pl-5">
                                    {sessions.length === 0 && !isLoading ? (
                                        <div className="px-4 py-2 text-slate-400 text-xs italic">
                                            暂无历史
                                        </div>
                                    ) : (
                                        sessions.map(session => {
                                            const isActive = currentSessionId === session.id;
                                            const isCompleted = session.status === 'completed';
                                            const IconComponent = isCompleted ? CheckCircle2 : History;
                                            const iconClassName = isActive ? 'text-brand-600' : (isCompleted ? 'text-brand-400' : 'text-slate-300');

                                            return (
                                                <button
                                                    key={session.id}
                                                    onClick={() => onSessionSelect(session.id)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-[13px] text-left group
                                                        ${isActive
                                                            ? 'bg-brand-50 text-brand-700'
                                                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                                        }`}
                                                    data-session-id={session.id}
                                                >
                                                    <div className="w-4 h-4 flex items-center justify-center shrink-0" data-icon-container="true">
                                                        <IconComponent size={14} className={iconClassName} data-icon-type={isCompleted ? 'completed' : 'history'} />
                                                    </div>
                                                    <span className="truncate flex-1">{session.title || '未命名会话'}</span>
                                                    <span className="text-[10px] text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {formatTime(session.updatedAt)}
                                                    </span>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div
                            className="relative"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${showRecentPopup ? 'bg-slate-100 text-brand-600' : 'text-slate-500 hover:bg-slate-100'}`}
                                title="最近"
                            >
                                <Clock size={20} />
                            </button>
                            {showRecentPopup && (
                                <div
                                    className="absolute left-[calc(100%+8px)] bottom-0 w-72 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 transition-all z-[100] animate-in fade-in zoom-in-95 duration-200"
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <span className="text-sm font-bold text-slate-800">最近</span>
                                        {isLoading && <Loader2 size={14} className="text-slate-400 animate-spin" />}
                                    </div>
                                    <div className="space-y-1">
                                        {sessions.map(session => {
                                            const isActive = currentSessionId === session.id;
                                            const isCompleted = session.status === 'completed';
                                            const IconComponent = isCompleted ? CheckCircle2 : History;
                                            const iconClassName = isActive ? 'text-brand-600' : (isCompleted ? 'text-brand-400' : 'text-slate-300');

                                            return (
                                                <button
                                                    key={session.id}
                                                    onClick={() => onSessionSelect(session.id)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-[13px] text-left group
                                                        ${isActive
                                                            ? 'bg-brand-50 text-brand-700'
                                                            : 'text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                                        <IconComponent size={14} className={iconClassName} />
                                                    </div>
                                                    <span className="truncate flex-1">{session.title || '未命名会话'}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>


            </nav>

            {/* User Profile / Auth Button */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                {user ? (
                    <div className="relative" ref={profileMenuRef}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all hover:bg-white hover:shadow-sm border border-transparent ${showProfileMenu ? 'bg-white border-slate-200 shadow-sm' : ''}`}
                        >
                            <div className="h-9 w-9 overflow-hidden rounded-lg border border-slate-200 shadow-sm shrink-0">
                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 text-left min-w-0">
                                    <div className="text-sm font-bold text-slate-800 truncate">{user.name}</div>
                                    <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Pro Account</div>
                                </div>
                            )}
                        </button>

                        {/* Profile Popover Menu */}
                        {showProfileMenu && (
                            <div className="absolute bottom-[calc(100%+8px)] left-0 w-full min-w-[200px] bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200 slide-in-from-bottom-2">
                                <div className="p-2 border-b border-slate-100 mb-1 flex items-center gap-3">
                                    <div className="h-8 w-8 overflow-hidden rounded-lg border border-slate-200 shadow-sm shrink-0">
                                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">{user.name}</div>
                                        <div className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">PRO ACCOUNT</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        onNavigate('overview');
                                        setShowProfileMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                >
                                    <User size={16} />
                                    用户概览
                                </button>
                                <button
                                    onClick={() => {
                                        onOpenProfile('settings');
                                        setShowProfileMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                >
                                    <Compass size={16} />
                                    账号设置
                                </button>
                                <button
                                    onClick={() => {
                                        onOpenProfile('billing');
                                        setShowProfileMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                >
                                    <Clock size={16} />
                                    订阅与账单
                                </button>
                                <div className="my-1 border-t border-slate-100"></div>
                                <button
                                    onClick={() => {
                                        onLogout();
                                        setShowProfileMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogIn size={16} className="rotate-180" />
                                    退出登录
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => onNavigate('auth')}
                        className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-all font-bold text-sm ${isCollapsed ? 'justify-center text-brand-600 hover:bg-brand-50' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'}`}
                    >
                        {isCollapsed ? <LogIn size={20} /> : (
                            <>
                                <User size={18} />
                                <span>登录账号</span>
                            </>
                        )}
                    </button>
                )}
            </div>
            <CreateWorkspaceModal
                isOpen={isCreateWorkspaceOpen}
                onClose={() => setIsCreateWorkspaceOpen(false)}
                onCreated={(workspace: Workspace) => {
                    setWorkspaces(prev => [...prev, workspace]);
                    if (workspace.isActive) {
                        setActiveWorkspace(workspace);
                    }
                    console.log('Workspace created:', workspace.name);
                }}
            />
        </aside >
    );
}, (prevProps, nextProps) => {
    // 自定义比较函数：只在这些关键 props 变化时才重新渲染
    return (
        prevProps.isCollapsed === nextProps.isCollapsed &&
        prevProps.currentView === nextProps.currentView &&
        prevProps.user?.name === nextProps.user?.name &&
        prevProps.currentSessionId === nextProps.currentSessionId &&
        prevProps.sessionVersion === nextProps.sessionVersion
    );
});

export default Sidebar;
