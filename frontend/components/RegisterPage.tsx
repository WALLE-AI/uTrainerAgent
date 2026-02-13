/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Icon, ICONS } from './shared';

const { useState } = React;

export const RegisterPage = ({ onRegister, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate registration
        onRegister({ name: formData.name, email: formData.email });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-indigo-50 blur-[100px] rounded-full opacity-50"></div>
            <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-purple-50 blur-[100px] rounded-full opacity-50"></div>

            <div className="w-full max-w-[440px] z-10 animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="bg-white border border-gray-100 rounded-[40px] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-200 mb-6 group hover:-rotate-6 transition-transform">
                            <Icon path={ICONS.utrainer} className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">加入 uTrainer</h1>
                        <p className="text-gray-500 font-medium text-sm text-center">开启工业级 AI 训练新纪元</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">真实姓名 / Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="请输入您的姓名"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all placeholder:text-gray-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">工作邮箱 / Work Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@company.com"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all placeholder:text-gray-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">设置密码 / Password</label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="请设置登录密码"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all placeholder:text-gray-400"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white hover:bg-indigo-500 font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs mt-4"
                        >
                            立即注册 / Create Account
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-50 flex flex-col items-center gap-4">
                        <p className="text-gray-500 text-xs font-medium">已有账户?</p>
                        <button
                            onClick={onSwitchToLogin}
                            className="text-gray-900 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-all"
                        >
                            返回登录 / Sign In Instead
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
