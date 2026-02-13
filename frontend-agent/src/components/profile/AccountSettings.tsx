import React from 'react';
import { Shield } from 'lucide-react';
import LlmProviderSettings from './LlmProviderSettings';
import { userService } from '../../api';

interface AccountSettingsProps {
    user: {
        name: string;
        email: string;
        avatar: string;
        settings?: any;
    };
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user }) => {
    const handleSaveLlmSettings = async (llmSettings: any) => {
        // 过滤掉 api_key，不保存到数据库
        const { api_key, ...safeSettings } = llmSettings;
        const res = await userService.updateProfile({
            settings: { ...user.settings, llm: safeSettings }
        });
        if (res.success) {
            // Optional: update local user state if needed
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200/60">
                <h3 className="mb-6 text-xl font-bold text-slate-900">基本信息</h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">用户名</label>
                            <input
                                type="text"
                                defaultValue={user.name}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 outline-none focus:border-brand-500 focus:bg-white transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">电子邮箱</label>
                            <input
                                type="email"
                                defaultValue={user.email}
                                className="w-full rounded-xl border border-slate-200 bg-slate-100/50 p-3 text-slate-400 outline-none cursor-not-allowed font-medium"
                                disabled
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">个人简介</label>
                        <textarea
                            rows={4}
                            placeholder="介绍一下你自己..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 outline-none focus:border-brand-500 focus:bg-white transition-all font-medium"
                        ></textarea>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button className="rounded-xl bg-brand-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-700 hover:scale-[1.02] active:scale-[0.98]">
                            保存更改
                        </button>
                    </div>
                </div>
            </div>

            {/* LLM Provider Settings */}
            <LlmProviderSettings
                settings={user.settings?.llm || null}
                onSave={handleSaveLlmSettings}
            />

            {/* Account Security - Moved here as requested */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                    <Shield className="h-5 w-5 text-emerald-500" />
                    账号安全
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                        <span className="text-sm font-medium text-slate-600">双重验证</span>
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">未开启</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-3">
                        <span className="text-sm font-medium text-emerald-700">邮箱已验证</span>
                        <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Shield className="h-2.5 w-2.5 text-white" />
                        </div>
                    </div>
                </div>
                <button className="mt-4 w-full text-center text-xs font-bold text-brand-600 hover:underline">
                    管理安全设置
                </button>
            </div>
        </div>
    );
};

export default AccountSettings;
