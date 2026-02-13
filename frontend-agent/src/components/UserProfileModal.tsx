import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import UserOverview from './profile/UserOverview';
import AccountSettings from './profile/AccountSettings';
import BillingSubscription from './profile/BillingSubscription';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: 'overview' | 'settings' | 'billing';
    user: {
        name: string;
        email: string;
        avatar: string;
        role?: string;
    };
    onLogout: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, activeTab, user, onLogout }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
        } else {
            const timer = setTimeout(() => setIsAnimating(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !isAnimating) return null;

    const titles = {
        overview: '用户概览',
        settings: '账号设置',
        billing: '订阅与账单'
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content - Dynamic Width based on content if needed, but keeping consistent max-width for now */}
            <div className={`relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white z-10">
                    <h2 className="text-xl font-bold text-slate-800">{titles[activeTab]}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50/30 p-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
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

export default UserProfileModal;
