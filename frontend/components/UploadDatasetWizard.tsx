/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Icon, ICONS, FormSection, InputField, Tag, tagColors, SelectField } from './shared';
const { useState, useEffect, useRef } = React;

const steps = [
    { id: 1, name: '上传文件' },
    { id: 2, name: '填写详情' },
    { id: 3, name: '预览与确认' },
];

const StepIndicator = ({ currentStep, onStepClick }) => (
    <nav aria-label="Progress">
        <ol role="list" className="flex items-center">
            {steps.map((step, stepIdx) => (
                <li key={step.name} className={`flex-1 ${stepIdx < steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                    {step.id < currentStep ? (
                        <>
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="h-0.5 w-full bg-indigo-600" />
                            </div>
                            <button
                                onClick={() => onStepClick(step.id)}
                                className="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-900 transition-colors z-10"
                            >
                                <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg>
                            </button>
                        </>
                    ) : step.id === currentStep ? (
                        <>
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="h-0.5 w-full bg-gray-200" />
                            </div>
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white z-10" aria-current="step">
                                <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="h-0.5 w-full bg-gray-200" />
                            </div>
                            <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white z-10">
                                <span className="h-2.5 w-2.5 rounded-full bg-transparent" aria-hidden="true" />
                            </div>
                        </>
                    )}
                    <div className="absolute top-10 w-max text-center">
                        <p className={`text-sm font-medium ${step.id <= currentStep ? 'text-indigo-600' : 'text-gray-500'}`}>{step.name}</p>
                    </div>
                </li>
            ))}
        </ol>
    </nav>
);

const Step1_Upload = ({ onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        let timer;
        if (uploading) {
            timer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(timer);
                        setTimeout(onUploadComplete, 500); // Wait half a second before proceeding
                        return 100;
                    }
                    return prev + 10;
                });
            }, 100);
        }
        return () => clearInterval(timer);
    }, [uploading, onUploadComplete]);

    const handleFileSelect = (files) => {
        if (files && files[0]) {
            setFileName(files[0].name);
            setUploading(true);
        }
    };

    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e) => {
        e.preventDefault();
        handleFileSelect(e.dataTransfer.files);
    };

    return (
        <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">上传数据集文件</h3>
            <p className="text-sm text-gray-500 mb-6">选择或拖拽单个文件进行上传。</p>

            <div
                className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="text-center">
                    <Icon path={ICONS.upload} className="mx-auto h-12 w-12 text-gray-300" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                            <span>选择一个文件</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files)} />
                        </label>
                        <p className="pl-1">或拖拽到此处</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">JSON, JSONL, CSV, Parquet up to 5GB</p>
                </div>
            </div>

            {uploading && (
                <div className="mt-6 w-full">
                    <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>{fileName}</span>
                        <span className="text-gray-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Step2_Details = ({ formData, setFormData }) => {
    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.value) {
            e.preventDefault();
            const newTag = e.target.value.trim();
            if (newTag && !formData.tags.includes(newTag)) {
                setFormData(f => ({ ...f, tags: [...f.tags, newTag] }));
            }
            e.target.value = '';
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(f => ({ ...f, tags: f.tags.filter(tag => tag !== tagToRemove) }));
    }

    const handleTaskTypeChange = (e) => {
        const newTaskType = e.target.value;
        setFormData(f => {
            const oldTaskType = f.taskType;
            const newTags = f.tags.filter(tag => tag !== oldTaskType);
            if (!newTags.includes(newTaskType)) {
                newTags.push(newTaskType);
            }
            return { ...f, taskType: newTaskType, tags: newTags };
        });
    };

    return (
        <>
            <FormSection title="基础信息">
                <InputField label="数据集名称" placeholder="e.g., my-financial-chat-data" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                <InputField label="版本" placeholder="e.g., v1.0-alpha" value={formData.version} onChange={e => setFormData(f => ({ ...f, version: e.target.value }))} />
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-2">描述</label>
                    <textarea
                        // FIX: Changed the 'rows' prop on the textarea from a string to a number to match the expected type and resolve the TypeScript error.
                        rows={4}
                        placeholder="数据集内容的简要描述..."
                        value={formData.description}
                        onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800"
                    />
                </div>
            </FormSection>
            <FormSection title="元数据">
                <SelectField label="领域" options={['通用', '金融', '法律', '医学', '教育', '电商']} value={formData.domain} onChange={e => setFormData(f => ({ ...f, domain: e.target.value }))} />
                <SelectField label="数据格式" options={['Alpaca', 'ShareGPT', '多模态']} value={formData.dataFormat} onChange={e => setFormData(f => ({ ...f, dataFormat: e.target.value }))} />
                <SelectField label="任务类型" options={['SFT', 'Pre-training', 'DPO', 'KTO', 'RLHF', 'ORPO']} value={formData.taskType} onChange={handleTaskTypeChange} />
                <InputField label="创建者" placeholder="e.g., team-a" value={formData.creator} onChange={e => setFormData(f => ({ ...f, creator: e.target.value }))} />
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-2">标签 (回车添加)</label>
                    <div className="flex flex-wrap gap-2 items-center bg-gray-50 border border-gray-300 rounded-md p-2">
                        {formData.tags.map(tag => (
                            <span key={tag} className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                {tag}
                                <button onClick={() => removeTag(tag)} className="text-indigo-600 hover:text-indigo-900">
                                    <Icon path={ICONS.close} className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                        <input onKeyDown={handleTagKeyDown} type="text" placeholder="添加更多标签..." className="flex-1 bg-transparent outline-none text-sm p-1" />
                    </div>
                </div>
            </FormSection>
        </>
    );
};


const Step3_Preview = ({ formData, onEdit }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-gray-900">确认信息</h3>
                <p className="text-sm text-gray-500">请检查数据集详情和预览，确认无误后完成上传。</p>
            </div>
            <button
                onClick={onEdit}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-900 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-xl transition-all"
            >
                <Icon path={ICONS.pencil} className="w-4 h-4" />
                修改详情
            </button>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm group hover:border-indigo-200 transition-all cursor-pointer" onClick={onEdit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 text-sm">
                <div className="md:col-span-2"><p className="text-gray-500 font-bold uppercase text-[10px]">数据集名称</p><p className="font-bold text-gray-800 mt-1">{formData.name || '-'}</p></div>
                <div><p className="text-gray-500 font-bold uppercase text-[10px]">版本</p><p className="font-bold text-gray-800 mt-1">{formData.version || '-'}</p></div>
                <div className="md:col-span-3"><p className="text-gray-500 font-bold uppercase text-[10px]">描述</p><p className="font-medium text-gray-800 mt-1 break-words leading-relaxed">{formData.description || '-'}</p></div>

                <div><p className="text-gray-500 font-bold uppercase text-[10px]">领域</p><p className="font-bold text-gray-800 mt-1">{formData.domain}</p></div>
                <div><p className="text-gray-500 font-bold uppercase text-[10px]">数据格式</p><p className="font-bold text-gray-800 mt-1">{formData.dataFormat}</p></div>
                <div><p className="text-gray-500 font-bold uppercase text-[10px]">任务类型</p><p className="font-bold text-gray-800 mt-1">{formData.taskType}</p></div>

                <div><p className="text-gray-500 font-bold uppercase text-[10px]">创建者</p><p className="font-bold text-gray-800 mt-1">{formData.creator || '-'}</p></div>
                <div className="md:col-span-2">
                    <p className="text-gray-500 font-bold uppercase text-[10px]">标签</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {formData.tags.length > 0 ? formData.tags.map(t => <Tag key={t} color={tagColors[t] || 'bg-indigo-100 text-indigo-800'} text={t} />) : <span className="text-gray-400">无</span>}
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-[10px] text-indigo-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon path={ICONS.pencil} className="w-3 h-3" />
                点击任意位置快速返回修改
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="font-black text-gray-900 uppercase tracking-tight mb-4 text-sm">数据预览 (前 3 条)</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase">
                        <tr>
                            <th className="p-4">instruction</th>
                            <th className="p-4">input</th>
                            <th className="p-4">output</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        <tr className="hover:bg-gray-50 transition-colors"><td className="p-4 font-medium text-gray-800">"天空为什么是蓝色的？"</td><td className="p-4">""</td><td className="p-4 text-gray-500">"因为瑞利散射..."</td></tr>
                        <tr className="hover:bg-gray-50 transition-colors"><td className="p-4 font-medium text-gray-800">"写一首关于春天的诗"</td><td className="p-4">""</td><td className="p-4 text-gray-500">"春风拂面绿意浓..."</td></tr>
                        <tr className="hover:bg-gray-50 transition-colors"><td className="p-4 font-medium text-gray-800">"如何制作巧克力蛋糕？"</td><td className="p-4">""</td><td className="p-4 text-gray-500">"首先，你需要准备..."</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);


export const UploadDatasetWizard = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        version: '',
        description: '',
        domain: '通用',
        dataFormat: 'Alpaca',
        taskType: 'SFT',
        tags: ['SFT', '中文'],
        creator: 'team-a',
    });

    const handleNext = () => setStep(s => Math.min(s + 1, steps.length));
    const handleBack = () => setStep(s => Math.max(s - 1, 1));

    const isNextDisabled = step === 2 && (!formData.name || !formData.version);

    const renderStepContent = () => {
        switch (step) {
            case 1: return <Step1_Upload onUploadComplete={handleNext} />;
            case 2: return <Step2_Details formData={formData} setFormData={setFormData} />;
            case 3: return <Step3_Preview formData={formData} onEdit={() => setStep(2)} />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Datasets <span className="text-indigo-600">Wizard</span></h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1 italic">Industrial Data Ingestion Flow</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:rotate-90 transition-all duration-300">
                        <Icon path={ICONS.close} className="w-6 h-6" />
                    </button>
                </header>
                <div className="px-8 py-10 border-b border-gray-50 bg-white shadow-sm relative z-20">
                    <StepIndicator currentStep={step} onStepClick={(s) => s < step && setStep(s)} />
                </div>
                <main className="flex-1 overflow-y-auto p-10 bg-gray-50/30">
                    {renderStepContent()}
                </main>
                <footer className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <button onClick={onClose} className="text-sm font-semibold text-gray-600 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100">取消</button>
                    <div className="flex items-center gap-3">
                        {step > 1 && <button onClick={handleBack} className="text-sm font-semibold text-gray-600 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100">上一步</button>}
                        {step < steps.length ? (
                            <button
                                onClick={handleNext}
                                disabled={isNextDisabled}
                                className="text-sm font-semibold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm disabled:bg-indigo-300 disabled:cursor-not-allowed"
                            >
                                下一步
                            </button>
                        ) : (
                            <button onClick={onClose} className="text-sm font-semibold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm">完成上传</button>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
};