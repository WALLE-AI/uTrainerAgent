import React, { useState } from 'react';
import { X, Folder, Server, Globe, Shield, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fileService } from '../api/files';
import { workspaceApi, type CreateWorkspaceDto } from '../api/workspaces';
import { toast } from 'react-hot-toast';

interface CreateWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (workspace: any) => void;
}

type WorkspaceType = 'local' | 'remote';

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose, onCreated }) => {
    const [activeTab, setActiveTab] = useState<WorkspaceType>('local');
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        path: '',
        host: '',
        port: '22',
        username: '',
        authType: 'password' as 'password' | 'key',
        password: '',
        sshKey: '',
        remotePath: ''
    });

    const handlePickDirectory = async () => {
        try {
            const response = await fileService.pickDirectory();
            if (response.success && response.data) {
                setFormData(prev => ({ ...prev, path: response.data || '' }));
            }
        } catch (error) {
            console.error('Failed to pick directory:', error);
            toast.error('无法打开目录选择器');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data: CreateWorkspaceDto = {
                name: formData.name,
                type: activeTab,
                path: activeTab === 'local' ? formData.path : formData.remotePath,
            };

            // Add SSH config for remote workspaces
            if (activeTab === 'remote') {
                data.sshConfig = {
                    host: formData.host,
                    port: parseInt(formData.port),
                    username: formData.username,
                    authType: formData.authType as 'password' | 'key',
                    password: formData.authType === 'password' ? formData.password : undefined,
                    sshKey: formData.authType === 'key' ? formData.sshKey : undefined,
                };
            }

            const response = await workspaceApi.create(data);
            if (response.success) {
                toast.success('工作空间创建成功!');
                onCreated(response.data);
                onClose();
            } else {
                toast.error('创建失败');
            }
        } catch (error) {
            console.error('Failed to create workspace:', error);
            toast.error('创建工作空间失败');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400";
    const labelClasses = "block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-8 pt-8 pb-6 flex items-center justify-between bg-gradient-to-b from-slate-50/50 to-transparent">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">新建工作空间</h2>
                                <p className="text-slate-400 text-sm mt-1">关联本地目录或远程 SSH 服务器</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all transform hover:rotate-90"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="px-8 flex p-1 mx-8 bg-slate-100/50 rounded-2xl mb-8">
                            <button
                                onClick={() => setActiveTab('local')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'local' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Folder size={18} />
                                <span>本地工作空间</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('remote')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'remote' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Server size={18} />
                                <span>远程工作空间 (SSH)</span>
                            </button>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
                            <section>
                                <label className={labelClasses}>空间名称</label>
                                <input
                                    type="text"
                                    placeholder="例如: 我的个人项目"
                                    required
                                    className={inputClasses}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </section>

                            {activeTab === 'local' ? (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <section>
                                        <label className={labelClasses}>本地目录路径</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="/Users/username/projects/project-a"
                                                required
                                                className={inputClasses}
                                                value={formData.path}
                                                onChange={e => setFormData({ ...formData, path: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={handlePickDirectory}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-lg text-slate-400 hover:text-brand-600 transition-all border border-transparent hover:border-slate-100"
                                            >
                                                <Folder size={16} />
                                            </button>
                                        </div>
                                    </section>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-3 gap-4">
                                        <section className="col-span-2">
                                            <label className={labelClasses}>主机地址 (Host)</label>
                                            <input
                                                type="text"
                                                placeholder="192.168.1.1"
                                                required
                                                className={inputClasses}
                                                value={formData.host}
                                                onChange={e => setFormData({ ...formData, host: e.target.value })}
                                            />
                                        </section>
                                        <section>
                                            <label className={labelClasses}>端口 (Port)</label>
                                            <input
                                                type="text"
                                                placeholder="22"
                                                className={inputClasses}
                                                value={formData.port}
                                                onChange={e => setFormData({ ...formData, port: e.target.value })}
                                            />
                                        </section>
                                    </div>

                                    <section>
                                        <label className={labelClasses}>用户名 (Username)</label>
                                        <input
                                            type="text"
                                            placeholder="root"
                                            required
                                            className={inputClasses}
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </section>

                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, authType: 'password' })}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all ${formData.authType === 'password' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                            >
                                                <Globe size={14} />
                                                <span>密码验证</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, authType: 'key' })}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all ${formData.authType === 'key' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                            >
                                                <Shield size={14} />
                                                <span>私钥验证</span>
                                            </button>
                                        </div>

                                        {formData.authType === 'password' ? (
                                            <section>
                                                <label className={labelClasses}>密码</label>
                                                <input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    required
                                                    className={inputClasses}
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </section>
                                        ) : (
                                            <section>
                                                <label className={labelClasses}>SSH 私钥 (Private Key)</label>
                                                <textarea
                                                    placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                                                    required
                                                    rows={4}
                                                    className={`${inputClasses} font-mono text-[12px] resize-none`}
                                                    value={formData.sshKey}
                                                    onChange={e => setFormData({ ...formData, sshKey: e.target.value })}
                                                />
                                            </section>
                                        )}
                                    </div>

                                    <section>
                                        <label className={labelClasses}>远程目录路径</label>
                                        <input
                                            type="text"
                                            placeholder="/home/user/project-x"
                                            required
                                            className={inputClasses}
                                            value={formData.remotePath}
                                            onChange={e => setFormData({ ...formData, remotePath: e.target.value })}
                                        />
                                    </section>
                                </motion.div>
                            )}

                            {/* Actions */}
                            <div className="pt-4 flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-[2] py-3 bg-brand-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-700 shadow-lg shadow-brand-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>正在创建...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            <span>创建工作空间</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateWorkspaceModal;
