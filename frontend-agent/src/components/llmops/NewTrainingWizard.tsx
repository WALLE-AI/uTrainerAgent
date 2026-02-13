/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { Icon, ICONS, FormSection, InputField, SelectField } from './shared';

const steps = [
    { id: 1, name: '引擎' },
    { id: 2, name: '数据' },
    { id: 3, name: '参数组' },
    { id: 4, name: '资源' },
    { id: 5, name: '追踪' },
];

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <nav className="flex items-center justify-center p-6 bg-slate-50/50 rounded-3xl border border-slate-100/50" aria-label="Progress">
        <ol role="list" className="flex items-center space-x-6">
            {steps.map((step, stepIdx) => (
                <li key={step.name} className="flex items-center">
                    {step.id < currentStep ? (
                        <div className="flex flex-col items-center gap-2">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                                <Icon path={ICONS.check} className="h-6 w-6" />
                            </span>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">{step.name}</span>
                        </div>
                    ) : step.id === currentStep ? (
                        <div className="flex flex-col items-center gap-2">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-300">
                                <span className="text-sm font-black">{step.id}</span>
                            </span>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none underline underline-offset-4">{step.name}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-slate-100 bg-white text-slate-300">
                                <span className="text-sm font-black">{step.id}</span>
                            </span>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">{step.name}</span>
                        </div>
                    )}
                    {stepIdx !== steps.length - 1 && (
                        <div className="w-12 h-[2px] bg-slate-100 mx-2 mt-[-18px]"></div>
                    )}
                </li>
            ))}
        </ol>
    </nav>
);

const Card: React.FC<{
    title: string;
    description: string;
    selected: boolean;
    onSelect: (title: string) => void;
    children?: React.ReactNode;
    colSpan?: string;
}> = ({ title, description, selected, onSelect, children = null, colSpan = 'col-span-1' }) => (
    <div onClick={() => onSelect(title)} className={`p-5 rounded-3xl border transition-all relative flex flex-col gap-2 ${colSpan} ${selected
        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-lg shadow-indigo-100/50'
        : 'border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
        }`}>
        <div className="flex justify-between items-start">
            <h4 className="font-black text-slate-900 uppercase tracking-tight">{title}</h4>
            {selected && <div className="w-5 h-5 bg-indigo-600 rounded-lg text-white flex items-center justify-center shadow-lg shadow-indigo-200"><Icon path={ICONS.check} className="w-3.5 h-3.5" /></div>}
        </div>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{description}</p>
        {children && <div className="mt-2 text-left">{children}</div>}
    </div>
);

const Step1_Engine: React.FC<any> = ({ formData, setFormData }) => {
    const { engine, trlMethod } = formData;
    return (
        <FormSection title="选择训练引擎">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
                <Card title="LlamaFactory" description="All-in-one LLM fine-tuning framework." selected={engine === 'LlamaFactory'} onSelect={(val) => setFormData((f: any) => ({ ...f, engine: val }))} />
                <Card title="Unsloth" description="High-performance fine-tuning with 2x speed." selected={engine === 'Unsloth'} onSelect={(val) => setFormData((f: any) => ({ ...f, engine: val }))} />
                <Card title="TRL" description="Transformer Reinforcement Learning for DPO, PPO etc." selected={engine === 'TRL'} onSelect={(val) => setFormData((f: any) => ({ ...f, engine: val }))}>
                    {engine === 'TRL' && (
                        <SelectField label="" options={['DPO', 'PPO', 'KTO', 'ORPO', 'GRPO']} value={trlMethod} onChange={e => setFormData((f: any) => ({ ...f, trlMethod: e.target.value }))} />
                    )}
                </Card>
                <Card title="VERL" description="Vector-based Environment for RL." selected={engine === 'VERL'} onSelect={(val) => setFormData((f: any) => ({ ...f, engine: val }))} />
            </div>
        </FormSection>
    );
};

const Step2_Data: React.FC<any> = ({ formData, setFormData }) => {
    const datasetVersions = ['alpaca-gpt4-zh/v1.2', 'dolly-v2-15k/v2.0', 'internal-customer-qa/v0.1-draft', 'medical-dialogue-en/v1.0'];
    const { engine, trlMethod, datasets } = formData;

    const handleDatasetChange = (id: number, field: string, value: string) => {
        setFormData((f: any) => {
            const newDatasets = f.datasets.map((d: any) => {
                if (d.id === id) {
                    const updatedDataset = { ...d, [field]: value };
                    if (field === 'type' && value === 'Validation') {
                        updatedDataset.ratio = '0.0';
                    }
                    return updatedDataset;
                }
                return d;
            });
            return { ...f, datasets: newDatasets };
        });
    };

    const handleAddDataset = () => {
        setFormData((f: any) => ({ ...f, datasets: [...f.datasets, { id: Date.now(), name: datasetVersions[0], type: 'SFT', ratio: '0.0' }] }));
    };

    const handleRemoveDataset = (id: number) => {
        if (datasets.length <= 1) return;
        setFormData((f: any) => ({ ...f, datasets: f.datasets.filter((d: any) => d.id !== id) }));
    };

    const renderSFTConfig = () => {
        const sftPretrainRatioSum = datasets
            .filter((d: any) => d.type === 'SFT' || d.type === 'Pre-training')
            .reduce((sum: number, d: any) => sum + (parseFloat(d.ratio) || 0), 0);
        const isRatioInvalid = sftPretrainRatioSum > 1.0;

        return (
            <div className="col-span-2 space-y-4">
                <label className="block text-sm font-medium text-slate-600 text-left">数据集配比</label>
                {datasets.map((dataset: any) => (
                    <div key={dataset.id} className="grid grid-cols-12 gap-x-4 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <div className="col-span-5">
                            <SelectField label="" options={datasetVersions} value={dataset.name} onChange={e => handleDatasetChange(dataset.id, 'name', e.target.value)} />
                        </div>
                        <div className="col-span-3">
                            <SelectField label="" options={['SFT', 'Pre-training', 'Validation']} value={dataset.type} onChange={e => handleDatasetChange(dataset.id, 'type', e.target.value)} />
                        </div>
                        <div className="col-span-3">
                            <InputField
                                label=""
                                placeholder="Ratio"
                                type="number"
                                value={dataset.ratio}
                                onChange={e => handleDatasetChange(dataset.id, 'ratio', e.target.value)}
                                disabled={dataset.type === 'Validation'}
                                description={dataset.type === 'Validation' ? 'N/A' : (dataset.type === 'SFT' ? 'e.g., 0.8' : 'e.g., 0.2')}
                            />
                        </div>
                        <div className="col-span-1 text-right">
                            {datasets.length > 1 && (
                                <button onClick={() => handleRemoveDataset(dataset.id)} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500">
                                    <Icon path={ICONS.close} className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                <button onClick={handleAddDataset} className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 w-fit">
                    <Icon path={ICONS.plus} className="w-4 h-4" />
                    添加数据集
                </button>
                <div className="col-span-2 mt-4 pt-4 border-t border-slate-200 text-right">
                    <p className="text-sm font-medium text-slate-700">
                        SFT/Pre-training Ratio Sum:
                        <span className={`font-bold ml-2 ${isRatioInvalid ? 'text-red-600' : 'text-slate-900'}`}>
                            {sftPretrainRatioSum.toFixed(2)} / 1.00
                        </span>
                    </p>
                </div>
            </div>
        );
    };

    const renderRLHFConfig = () => (
        <>
            <SelectField label="数据集版本" options={datasetVersions} colSpan="col-span-2" description={`选择包含 'prompt', 'chosen', 'rejected' 列的数据集用于 ${trlMethod} 训练。`} />
            <InputField label="Prompt 列名" placeholder="prompt" />
            <InputField label="Chosen 列名" placeholder="chosen" />
            <InputField label="Rejected 列名" placeholder="rejected" />
            <InputField label="验证集比例" placeholder="0.01" description="用于评估的验证集数据占比。" />
        </>
    );

    const getConfigComponent = () => {
        switch (engine) {
            case 'LlamaFactory':
            case 'Unsloth':
                return renderSFTConfig();
            case 'TRL':
                return renderRLHFConfig();
            default:
                return renderSFTConfig();
        }
    };

    return (
        <FormSection title="数据配置">
            {getConfigComponent()}
        </FormSection>
    );
};

const Step3_Parameters: React.FC<any> = ({ formData, setFormData }) => {
    const { params } = formData;
    const handleParamChange = (field: string, value: any) => {
        setFormData((f: any) => ({ ...f, params: { ...f.params, [field]: value } }));
    };

    const renderSFTParameters = () => (
        <div className="col-span-2 space-y-6 text-left">
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-4">微调方法</label>
                <div className="grid grid-cols-3 gap-4">
                    <Card title="全量微调 (Full)" description="训练所有模型参数" selected={params.tuningMethod === 'Full'} onSelect={() => handleParamChange('tuningMethod', 'Full')} />
                    <Card title="LoRA" description="Low-Rank Adaptation" selected={params.tuningMethod === 'LoRA'} onSelect={() => handleParamChange('tuningMethod', 'LoRA')} />
                    <Card title="QLoRA" description="Quantized LoRA" selected={params.tuningMethod === 'QLoRA'} onSelect={() => handleParamChange('tuningMethod', 'QLoRA')} />
                </div>
            </div>

            {(params.tuningMethod === 'LoRA' || params.tuningMethod === 'QLoRA') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <InputField label="LoRA Rank (r)" value={params.lora_r} onChange={e => handleParamChange('lora_r', e.target.value)} />
                    <InputField label="LoRA Alpha" value={params.lora_alpha} onChange={e => handleParamChange('lora_alpha', e.target.value)} />
                    <InputField label="LoRA Dropout" value={params.lora_dropout} onChange={e => handleParamChange('lora_dropout', e.target.value)} />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-slate-200">
                <InputField label="Learning Rate" placeholder="e.g., 2e-5" value={params.learning_rate} onChange={e => handleParamChange('learning_rate', e.target.value)} />
                <InputField label="Batch Size" placeholder="e.g., 4" value={params.batch_size} onChange={e => handleParamChange('batch_size', e.target.value)} />
                <InputField label="Gradient Accumulation" placeholder="e.g., 8" value={params.grad_accum} onChange={e => handleParamChange('grad_accum', e.target.value)} />
                <InputField label="Cutoff Length" placeholder="e.g., 2048" value={params.cutoff_len} onChange={e => handleParamChange('cutoff_len', e.target.value)} />
            </div>
        </div>
    );

    const renderRLHFParameters = () => (
        <div className="col-span-2 space-y-6 text-left">
            <h4 className="text-sm font-bold text-slate-700">{formData.trlMethod} 参数配置</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <InputField label="Learning Rate" placeholder="e.g., 5e-7" value={params.learning_rate} onChange={e => handleParamChange('learning_rate', e.target.value)} />
                <InputField label="Batch Size" placeholder="e.g., 2" value={params.batch_size} onChange={e => handleParamChange('batch_size', e.target.value)} />
                <InputField label="Beta (β)" placeholder="0.1" description="The KL divergence regularization strength." value={params.dpo_beta} onChange={e => handleParamChange('dpo_beta', e.target.value)} />
                <SelectField label="Loss Type" options={['sigmoid', 'hinge', 'ipo', 'kto_pair']} value={params.dpo_loss_type} onChange={e => handleParamChange('dpo_loss_type', e.target.value)} />
            </div>
        </div>
    );

    return (
        <FormSection title="参数组">
            {formData.engine === 'TRL' ? renderRLHFParameters() : renderSFTParameters()}
        </FormSection>
    );
};

export const NewTrainingWizard: React.FC<{ isOpen: boolean; onClose: () => void; initialDatasetName?: string | null }> = ({ isOpen, onClose, initialDatasetName = null }) => {
    if (!isOpen) return null;

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        engine: 'LlamaFactory',
        trlMethod: 'DPO',
        datasets: [{ id: Date.now(), name: initialDatasetName || 'alpaca-gpt4-zh/v1.2', type: 'SFT', ratio: '1.0' }],
        params: {
            tuningMethod: 'LoRA',
            learning_rate: '2e-5',
            batch_size: 4,
            grad_accum: 8,
            cutoff_len: 2048,
            save_every: 100,
            lora_r: 8,
            lora_alpha: 16,
            lora_dropout: 0.05,
            dpo_beta: 0.1,
            dpo_loss_type: 'sigmoid',
        },
    });

    useEffect(() => {
        if (initialDatasetName) {
            setFormData(f => ({
                ...f,
                datasets: [{ id: Date.now(), name: initialDatasetName, type: 'SFT', ratio: '1.0' }]
            }));
        }
    }, [initialDatasetName]);

    const handleNext = () => setStep(s => Math.min(s + 1, steps.length));
    const handleBack = () => setStep(s => Math.max(s - 1, 1));

    const renderStepContent = () => {
        switch (step) {
            case 1: return <Step1_Engine formData={formData} setFormData={setFormData} />;
            case 2: return <Step2_Data formData={formData} setFormData={setFormData} />;
            case 3: return <Step3_Parameters formData={formData} setFormData={setFormData} />;
            case 4: return (
                <FormSection title="资源配置">
                    <SelectField label="GPU 型号" options={['Any', 'NVIDIA A100-80G', 'NVIDIA H800-80G', 'NVIDIA RTX 4090']} />
                    <InputField label="GPU 数量" placeholder="1" type="number" />
                    <SelectField label="并行策略" options={['DP', 'TP', 'PP', 'MoE']} description="Select parallelism strategy." />
                </FormSection>
            );
            case 5: return (
                <FormSection title="追踪与产物">
                    <SelectField label="实验追踪" options={['SwanLab', 'W&B', 'None']} />
                    <InputField label="任务名称" placeholder="e.g., llama3-sft-v1" colSpan="col-span-2" />
                </FormSection>
            );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20" onClick={e => e.stopPropagation()}>
                <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="text-left">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">启动新训练实验 <span className="text-indigo-600">Factory</span></h2>
                        <p className="text-slate-400 text-[10px] font-black mt-1 uppercase tracking-widest leading-none">Configure Hyperparameters, Data Ratios, and Hardware Resources.</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 rounded-2xl hover:bg-slate-100 text-slate-400 transition-colors"><Icon path={ICONS.close} className="w-5 h-5" /></button>
                </header>
                <div className="p-8 border-b border-slate-100">
                    <StepIndicator currentStep={step} />
                </div>
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {renderStepContent()}
                </main>
                <footer className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <button onClick={onClose} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-6 py-3 rounded-xl transition-colors">取消</button>
                    <div className="flex items-center gap-4">
                        {step > 1 && (
                            <button onClick={handleBack} className="text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200 px-6 py-3 rounded-2xl hover:bg-white transition-all">上一步</button>
                        )}
                        {step < steps.length ? (
                            <button onClick={handleNext} className="text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 px-10 py-3 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">下一步</button>
                        ) : (
                            <button onClick={onClose} className="text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 px-12 py-3 rounded-2xl hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95">创建实验 Experiment</button>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
};
