import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Github, Chrome, ShieldCheck } from 'lucide-react';
import { apiClient } from '../api/client';

interface AuthPageProps {
    onLoginSuccess: (user: any) => void;
    onBack: () => void;
}

const AuthPage = ({ onLoginSuccess, onBack }: AuthPageProps) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
            const payload = mode === 'login'
                ? { email, password }
                : { email, password, username };

            const response = await apiClient.post<any>(endpoint, payload);

            if (!response.success || !response.data) {
                throw new Error(response.error?.message || (mode === 'login' ? '登录失败' : '注册失败'));
            }

            if (mode === 'register') {
                setSuccessMessage('注册成功！请使用您的账号登录。');
                setMode('login');
                setPassword(''); // 清空密码以提示重新输入
                return;
            }

            // 登录成功处理
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('refresh_token', response.data.refresh_token);

            // 直接使用邮箱前缀作为临时用户名，除非是刚注册完的后续流程
            const displayName = email.split('@')[0];
            const userData = {
                name: displayName,
                email,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`
            };

            onLoginSuccess(userData);
        } catch (err) {
            setError(err instanceof Error ? err.message : '操作失败，请重试');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestLogin = () => {
        setIsLoading(true);
        setTimeout(() => {
            // 设置模拟 Token
            localStorage.setItem('auth_token', 'mock_token_for_dev_bypass');
            localStorage.setItem('refresh_token', 'mock_refresh_token_for_dev_bypass');

            const userData = {
                name: 'uTrainer Admin',
                email: 'admin@utrainer.ai',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=uTrainer`
            };

            onLoginSuccess(userData);
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-50 p-4 font-inter overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-brand-200/30 blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-brand-300/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-md animate-slide-up">
                {/* Logo / Brand Area */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-soft ring-1 ring-slate-200">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">U</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {mode === 'login' ? '欢迎回来' : '开启学术之旅'}
                    </h1>
                    <p className="mt-2 text-slate-500">
                        {mode === 'login' ? '登录您的账号以继续' : '几秒钟即可完成注册'}
                    </p>
                </div>

                {/* Auth Card */}
                <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-2xl backdrop-blur-xl">
                    <div className="p-8">
                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm">
                                {successMessage}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {mode === 'register' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">用户名</label>
                                    <div className="group relative transition-all">
                                        <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="您的姓名"
                                            className="w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-12 pr-4 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 placeholder:text-slate-400"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">电子邮箱</label>
                                <div className="group relative transition-all">
                                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@example.com"
                                        className="w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-12 pr-4 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 placeholder:text-slate-400"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-sm font-semibold text-slate-700">密码</label>
                                    {mode === 'login' && (
                                        <button type="button" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                                            忘记密码？
                                        </button>
                                    )}
                                </div>
                                <div className="group relative transition-all">
                                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-12 pr-4 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 placeholder:text-slate-400"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-brand-600 py-3 text-sm font-bold text-white transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                ) : (
                                    <>
                                        <span>{mode === 'login' ? '立即登录' : '创建账号'}</span>
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>

                            {mode === 'login' && (
                                <button
                                    type="button"
                                    onClick={handleGuestLogin}
                                    disabled={isLoading}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-70"
                                >
                                    <ShieldCheck className="h-4 w-4 text-brand-400" />
                                    <span>无需认证，直接登录</span>
                                </button>
                            )}
                        </form>

                        <div className="mt-8">
                            <div className="relative mb-6 text-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <span className="relative bg-white/70 px-4 text-xs font-medium uppercase tracking-wider text-slate-500">
                                    或者使用以下方式
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:shadow-sm">
                                    <Chrome className="h-5 w-5 text-red-500" />
                                    <span>Google</span>
                                </button>
                                <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:shadow-sm">
                                    <Github className="h-5 w-5" />
                                    <span>GitHub</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer Area */}
                    <div className="bg-slate-50/50 p-6 text-center border-t border-slate-100">
                        <p className="text-sm text-slate-600">
                            {mode === 'login' ? '还没有账号？' : '已经有账号了？'}{' '}
                            <button
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className="font-bold text-brand-600 hover:text-brand-700 hover:underline transition-all"
                            >
                                {mode === 'login' ? '免费注册' : '返回登录'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Trust Badge */}
                <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-medium">100% 安全加密传输</span>
                </div>

                <button
                    onClick={onBack}
                    className="mt-6 w-full text-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-all"
                >
                    暂时不登录，返回首页
                </button>
            </div>
        </div>
    );
};

export default AuthPage;
