/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Icon, ICONS } from './shared';

const { useState } = React;

export const LoginPage = ({ onLogin, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate login
        onLogin({ name: 'Admin User', email });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-indigo-50 blur-[100px] rounded-full opacity-50"></div>
            <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-purple-50 blur-[100px] rounded-full opacity-50"></div>

            <div className="w-full max-w-[440px] z-10 animate-in fade-in zoom-in duration-700">
                <div className="bg-white border border-gray-100 rounded-[40px] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-200 mb-6 group hover:rotate-6 transition-transform">
                            <Icon path={ICONS.utrainer} className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">uTrainer</h1>
                        <p className="text-gray-500 font-medium text-sm">全维度大模型工业级开发平台</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">电子邮箱 / Email Address</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Icon path={ICONS.search} className="w-4 h-4" />
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">登录密码 / Password</label>
                                <a href="#" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">忘记密码?</a>
                            </div>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Icon path={ICONS.cog} className="w-4 h-4" />
                                </span>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-900/20 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
                        >
                            立即登录 / Sign In
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-50 flex flex-col items-center gap-4">
                        <p className="text-gray-500 text-xs font-medium">还没有 uTrainer 账号?</p>
                        <button
                            onClick={onSwitchToRegister}
                            className="text-gray-900 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-all"
                        >
                            提交注册 / Create Account
                        </button>
                    </div>
                </div>

                <p className="text-center mt-8 text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
                    &copy; 2024 WALLE-AI. All Rights Reserved.
                </p>
            </div>
        </div>
    );
};
