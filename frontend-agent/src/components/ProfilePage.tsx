import { useState, useRef } from 'react';
import { User, Settings, CreditCard, LogOut, ChevronRight, Maximize2 } from 'lucide-react';
import UserOverview from './profile/UserOverview';
import AccountSettings from './profile/AccountSettings';
import BillingSubscription from './profile/BillingSubscription';

interface ProfilePageProps {
    user: {
        name: string;
        email: string;
        avatar: string;
        role?: string;
    };
    onLogout: () => void;
}

const ProfilePage = ({ user, onLogout }: ProfilePageProps) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'billing'>('overview');
    const contentRef = useRef<HTMLDivElement>(null);

    const menuItems = [
        { id: 'overview', label: '用户概览', icon: User },
        { id: 'settings', label: '账号设置', icon: Settings },
        { id: 'billing', label: '订阅与账单', icon: CreditCard },
    ];

    const toggleFullscreen = () => {
        if (!contentRef.current) return;

        if (!document.fullscreenElement) {
            contentRef.current.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleTabClick = (id: string) => {
        setActiveTab(id as any);
        if (id === 'overview') {
            // Use setTimeout to ensure the DOM is ready if it wasn't rendered yet
            setTimeout(toggleFullscreen, 0);
        }
    };

    return (
        <div className="flex h-full bg-slate-50/50 font-inter animate-slide-up w-full overflow-hidden">
            {/* Sidebar / Navigation */}
            <div className="w-64 flex-shrink-0 border-r border-slate-200 bg-white p-6 flex flex-col justify-between h-full">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-8 px-2">个人中心</h2>
                    <nav className="space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleTabClick(item.id)}
                                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all group ${activeTab === item.id
                                    ? 'bg-brand-50 text-brand-600 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-brand-600' : 'text-slate-400'}`} />
                                    {item.label}
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeTab === item.id && item.id === 'overview' && (
                                        <Maximize2 className="h-4 w-4 text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                    {activeTab === item.id && <ChevronRight className="h-4 w-4 text-brand-400" />}
                                </div>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-50 hover:shadow-sm"
                    >
                        <LogOut className="h-5 w-5" />
                        退出登录
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div ref={contentRef} className="flex-1 overflow-y-auto p-6 lg:p-10 xl:p-12 bg-slate-50/50">
                <div className="mx-auto max-w-full">
                    {/* Breadcrumbs / Page Title (Optional) */}
                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-2xl font-extrabold text-slate-900">
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h1>
                        {activeTab === 'overview' && (
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 rounded-lg hover:bg-slate-200/50 transition-colors text-slate-400 hover:text-slate-600 md:hidden"
                                title="全屏"
                            >
                                <Maximize2 size={20} />
                            </button>
                        )}
                    </div>

                    {/* Content Rendering */}
                    <div className="animate-fade-in">
                        {activeTab === 'overview' && (
                            <UserOverview user={user} onLogout={onLogout} />
                        )}
                        {activeTab === 'settings' && (
                            <AccountSettings user={user} />
                        )}
                        {activeTab === 'billing' && (
                            <BillingSubscription />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
