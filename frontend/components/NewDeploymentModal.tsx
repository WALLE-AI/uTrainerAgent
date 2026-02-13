/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Icon, ICONS, Toggle, FormSection, InputField, SelectField, ToggleField } from './shared';
const { useState } = React;

export const NewDeploymentModal = ({ isOpen, onClose, onDeploy }) => {
    if (!isOpen) return null;

    const [name, setName] = useState('');
    const [modelRepo, setModelRepo] = useState('');
    const [engine, setEngine] = useState('vLLM');
    const [modelSource, setModelSource] = useState('Hugging Face');
    const [gpuMemory, setGpuMemory] = useState(0.9);
    const [speculativeDecoding, setSpeculativeDecoding] = useState(true);

    const EngineCard = ({ name, description, selected, onSelect, disabled = false }) => (
        <div onClick={() => !disabled && onSelect(name)}
            className={`p-5 rounded-2xl cursor-pointer transition-all relative border flex flex-col gap-2 ${selected
                ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-lg shadow-indigo-100/50'
                : 'border-gray-100 bg-gray-50/50 hover:border-gray-300 hover:bg-white'
                } ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
        >
            <div className="flex justify-between items-start">
                <h4 className="font-black text-gray-900 uppercase tracking-tight">{name}</h4>
                {selected && <div className="w-5 h-5 bg-indigo-600 rounded-lg text-white flex items-center justify-center shadow-lg shadow-indigo-200"><Icon path={ICONS.check} className="w-3.5 h-3.5" /></div>}
            </div>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{description}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20" onClick={e => e.stopPropagation()}>
                <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">新建服务部署 <span className="text-indigo-600">Provision</span></h2>
                        <p className="text-gray-400 text-xs font-medium mt-1 uppercase tracking-widest">Create a new inference endpoint on the infrastructure.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><Icon path={ICONS.close} className="w-5 h-5" /></button>
                </header>
                <main className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* FIX: Wrapped content inside FormSection component */}
                    <FormSection title="基础信息">
                        <div className="space-y-4 col-span-2">
                            <InputField
                                label="服务名称"
                                placeholder="例如: qwen-1.8b-chat-demo"
                                colSpan="col-span-2"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">模型来源</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Hugging Face', '模型库', '自定义路径'].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setModelSource(opt)}
                                            className={`p-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${modelSource === opt
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-600 ring-1 ring-indigo-600 shadow-md'
                                                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-white'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 space-y-4">
                                    {modelSource === 'Hugging Face' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField
                                                label="Hugging Face repo ID"
                                                placeholder="例如: Qwen/Qwen1.5-1.8B-Chat"
                                                colSpan="col-span-2"
                                                value={modelRepo}
                                                onChange={e => setModelRepo(e.target.value)}
                                            />
                                            <InputField
                                                label="Access Token (可选)"
                                                placeholder="HF_TOKEN..."
                                                description="访问私有模型时使用"
                                                type="password"
                                            />
                                        </div>
                                    )}
                                    {modelSource === '模型库' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <SelectField
                                                label="选择模型"
                                                options={['Llama-3-8B-Instruct', 'Qwen-72B-Chat', 'DeepSeek-V3']}
                                                colSpan="col-span-2"
                                            />
                                            <SelectField
                                                label="版本 Tag"
                                                options={['v1.2 (Latest)', 'v1.1', 'v1.0']}
                                            />
                                        </div>
                                    )}
                                    {modelSource === '自定义路径' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField
                                                label="模型挂载路径 (Absolute Path)"
                                                placeholder="/mnt/models/my-custom-model"
                                                colSpan="col-span-2"
                                            />
                                            <InputField
                                                label="自定义配置文件 (Optional)"
                                                placeholder="config.json"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </FormSection>

                    {/* FIX: Wrapped content inside FormSection component */}
                    <FormSection title="推理引擎">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
                            <EngineCard name="vLLM" description="高吞吐、内存优化的推理服务" selected={engine === 'vLLM'} onSelect={setEngine} />
                            <EngineCard name="SGLang" description="面向复杂 LLM 项目的高效推理引擎" selected={engine === 'SGLang'} onSelect={setEngine} />
                            <EngineCard name="TRT-LLM" description="NVIDIA TensorRT-LLM" selected={false} onSelect={() => { }} disabled />
                            <EngineCard name="Ollama" description="本地运行 Llama 3, Mistral 等模型" selected={false} onSelect={() => { }} disabled />
                        </div>
                    </FormSection>

                    {/* FIX: Wrapped content inside FormSection component */}
                    <FormSection title="实例参数">
                        <SelectField label="量化" options={['None', 'AWQ', 'GPTQ', 'FP8']} />
                        <InputField label="最大模型长度" placeholder="例如: 8192" />
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">GPU 内存利用率</label>
                            <div className="flex items-center gap-4">
                                <input type="range" min="0.1" max="1.0" step="0.05" value={gpuMemory} onChange={e => setGpuMemory(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                <span className="font-mono text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-md">{gpuMemory.toFixed(2)}</span>
                            </div>
                        </div>
                        <ToggleField label="启用推测解码" description="使用小模型草稿加速大模型解码过程，以少量显存换取更高吞吐。" enabled={speculativeDecoding} setEnabled={setSpeculativeDecoding} />
                    </FormSection>

                    {/* FIX: Wrapped content inside FormSection component */}
                    <FormSection title="资源配置">
                        <SelectField label="GPU 类型" options={['NVIDIA A100-80G', 'NVIDIA H800-80G', 'NVIDIA RTX 4090']} description="选择用于部署的硬件资源。" />
                        <SelectField label="Tensor Parallel" options={[1, 2, 4, 8]} description="模型并行度，加速大模型推理。" />
                        <InputField label="最小实例数" placeholder="0" description="服务自动伸缩的最小副本数。" />
                        <InputField label="最大实例数" placeholder="1" description="服务自动伸缩的最大副本数。" />
                    </FormSection>
                </main>
                <footer className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
                    <button onClick={onClose} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 px-6 py-3 rounded-xl transition-colors">取消</button>
                    <button
                        onClick={() => onDeploy({ name, model: modelRepo || 'Qwen/Qwen1.5-7B', engine })}
                        className="text-xs font-black uppercase tracking-widest text-white bg-indigo-600 px-10 py-3 rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95"
                    >
                        部署服务
                    </button>
                </footer>
            </div>
        </div>
    );
};