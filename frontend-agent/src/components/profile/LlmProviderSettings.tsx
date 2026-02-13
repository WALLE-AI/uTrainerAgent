import React, { useState, useEffect } from 'react';
import { Cpu, Key, Layers, RefreshCw } from 'lucide-react';
import { userService } from '../../api';
import toast from 'react-hot-toast';

interface LlmSettings {
    provider_type: string;
    api_key: string;
    base_url: string;
    model: string;
}

interface LlmProviderSettingsProps {
    settings: LlmSettings | null;
    onSave: (settings: LlmSettings) => Promise<void>;
}

const PROVIDER_TYPES = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'bailian', label: '阿里云百炼' },
    { value: 'siliconflow', label: 'SiliconFlow' },
    { value: 'openrouter', label: 'OpenRouter' },
    { value: 'vllm', label: 'vLLM (Local)' },
    { value: 'sglang', label: 'SGLang (Local)' },
    { value: 'ollama', label: 'Ollama (Local)' },
    { value: 'custom', label: 'Custom Compatible' },
];

const STORAGE_KEY = 'upapergen_llm_settings';

const LlmProviderSettings: React.FC<LlmProviderSettingsProps> = ({ settings: initialSettings, onSave }) => {
    const [settings, setSettings] = useState<LlmSettings>(() => {
        // 优先尝试从 localStorage 加载缓存
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                console.error('Failed to parse cached settings', e);
            }
        }
        return {
            provider_type: 'openai',
            api_key: '',
            base_url: '',
            model: '',
        };
    });
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [models, setModels] = useState<string[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);

    // 当初始设置（来自后端）变化时更新，但如果本地有更新的缓存，这里需要权衡
    // 这里我们选择：如果后端有值，则以后端为准
    useEffect(() => {
        if (initialSettings && Object.values(initialSettings).some(v => !!v)) {
            setSettings({
                provider_type: initialSettings.provider_type || 'openai',
                api_key: initialSettings.api_key || '',
                base_url: initialSettings.base_url || '',
                model: initialSettings.model || '',
            });
        }
    }, [initialSettings]);

    // 缓存 settings 到 localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    // 自动获取模型列表
    useEffect(() => {
        const fetchModels = async () => {
            // 对于需要 key 的提供商，如果没有 key 则不获取
            const needsKey = !['vllm', 'sglang', 'ollama'].includes(settings.provider_type);
            if (needsKey && !settings.api_key) {
                setModels([]);
                return;
            }

            setIsLoadingModels(true);
            try {
                const res = await userService.listModels({
                    provider_type: settings.provider_type,
                    api_key: settings.api_key,
                    base_url: settings.base_url || undefined,
                });
                if (res.success && res.data) {
                    setModels(res.data);
                } else {
                    setModels([]);
                }
            } catch (error) {
                setModels([]);
            } finally {
                setIsLoadingModels(false);
            }
        };

        const timer = setTimeout(fetchModels, 800);
        return () => clearTimeout(timer);
    }, [settings.provider_type, settings.api_key]);

    const handleTest = async () => {
        if (!settings.api_key && !['vllm', 'sglang', 'ollama'].includes(settings.provider_type)) {
            toast.error('请输入 API Key');
            return;
        }

        setIsTesting(true);
        try {
            const res = await userService.listModels({
                provider_type: settings.provider_type,
                api_key: settings.api_key,
                base_url: settings.base_url || undefined,
            });

            if (res.success && res.data) {
                setModels(res.data);
                if (res.data.length > 0) {
                    toast.success(`连接成功！已获取 ${res.data.length} 个模型`);
                    // 自动选择第一个模型
                    if (!settings.model || !res.data.includes(settings.model)) {
                        setSettings(prev => ({ ...prev, model: res.data![0] }));
                    }
                } else {
                    toast.success('连接成功，但未发现可用模型');
                }
                setShowCustomInput(false);
            } else {
                toast.error(res.error?.message || '连接失败，请检查配置');
            }
        } catch (error) {
            toast.error('连接失败，请检查网络 and 配置');
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(settings);
            toast.success('配置已保存');
        } catch (error) {
            toast.error('保存失败');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200/60">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                    <Cpu className="h-6 w-6 text-brand-600" />
                    LLM 提供商配置
                </h3>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
                            <Layers size={12} /> 提供商类型
                        </label>
                        <select
                            value={settings.provider_type}
                            onChange={(e) => setSettings({ ...settings, provider_type: e.target.value, model: '' })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 outline-none focus:border-brand-500 focus:bg-white transition-all font-medium appearance-none"
                        >
                            {PROVIDER_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
                            <Cpu size={12} /> 模型名称
                            {isLoadingModels && <RefreshCw className="h-3 w-3 animate-spin text-brand-500" />}
                        </label>
                        <div className="relative">
                            {models.length > 0 && !showCustomInput ? (
                                <select
                                    value={settings.model}
                                    onChange={(e) => {
                                        if (e.target.value === 'custom-input') {
                                            setShowCustomInput(true);
                                            setSettings({ ...settings, model: '' });
                                        } else {
                                            setSettings({ ...settings, model: e.target.value });
                                        }
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 outline-none focus:border-brand-500 focus:bg-white transition-all font-medium appearance-none"
                                >
                                    <option value="" disabled>请选择模型</option>
                                    {models.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                    <option value="custom-input">--- 手动输入 ---</option>
                                </select>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={settings.model}
                                        onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                                        placeholder={isLoadingModels ? "获取模型中..." : "输入模型名称"}
                                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 p-3 outline-none focus:border-brand-500 focus:bg-white transition-all font-medium"
                                    />
                                    {models.length > 0 && (
                                        <button
                                            onClick={() => setShowCustomInput(false)}
                                            className="px-3 text-xs font-bold text-brand-600 hover:text-brand-700"
                                        >
                                            返回选择
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
                        <Key size={12} /> API 密钥 (API Key)
                    </label>
                    <input
                        type="password"
                        value={settings.api_key}
                        onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                        placeholder="sk-..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 outline-none focus:border-brand-500 focus:bg-white transition-all font-medium"
                    />
                </div>

                <div className="flex items-center justify-between pt-4 gap-4">
                    <button
                        onClick={handleTest}
                        disabled={isTesting}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                        {isTesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        测试连接
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 rounded-xl bg-brand-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-200 transition-all hover:bg-brand-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSaving ? '保存中...' : '保存配置'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LlmProviderSettings;
