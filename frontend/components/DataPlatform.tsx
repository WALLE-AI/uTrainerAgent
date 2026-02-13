/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { DatasetDetail } from './DatasetDetail';
import { DatasetCenter } from './DatasetCenter';
import { DataProcessing } from './DataProcessing';
import { DatasetConstruction } from './DatasetConstruction';
import { Icon, ICONS } from './shared';
const { useState, useEffect } = React;

const initialDatasets = [
    { name: 'alpaca-gpt4-zh', version: 'v1.2', samples: '52k', size: '102 MB', tags: ['SFT', '中文'], quality: 95, lastEval: '2024-07-28', status: 'Published', creator: 'team-a', modality: 'Text' },
    { name: 'internal-image-qa', version: 'v1.0', samples: '15k', size: '2.3 GB', tags: ['Visual-QA', '图片'], quality: 92, lastEval: '2024-07-25', status: 'Published', creator: 'team-b', modality: 'Image', thumbnail: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=300' },
    { name: 'traffic-video-events', version: 'v0.1-draft', samples: '500', size: '12 GB', tags: ['时序分析', '交通'], quality: 78, lastEval: 'N/A', status: 'Draft', creator: 'team-a', modality: 'Video' },
    { name: 'medical-dialogue-en', version: 'v1.0', samples: '250k', size: '450 MB', tags: ['SFT', '医疗'], quality: 88, lastEval: '2024-07-22', status: 'Archived', creator: 'team-c', modality: 'Text' },
];

export const DataPlatform = ({ params, onNavigate }) => {
    const [datasets, setDatasets] = useState(initialDatasets);
    const [viewMode, setViewMode] = useState(params?.initialView || '数据集中心');
    const [selectedDataset, setSelectedDataset] = useState(null);

    useEffect(() => {
        if (params?.initialView) {
            setViewMode(params.initialView);
            setSelectedDataset(null);
        }
    }, [params?.initialView]);

    const handleUpdateDataset = (updatedDataset) => {
        setDatasets(datasets.map(d => d.name === updatedDataset.name ? updatedDataset : d));
        if (selectedDataset && selectedDataset.name === updatedDataset.name) {
            setSelectedDataset(updatedDataset);
        }
    };

    const renderContent = () => {
        if (selectedDataset) {
            return (
                <DatasetDetail
                    dataset={selectedDataset}
                    onBack={() => setSelectedDataset(null)}
                    onUpdate={handleUpdateDataset}
                    onNavigate={onNavigate}
                    onRecycle={() => setViewMode('数据集构建')}
                />
            );
        }

        switch (viewMode) {
            case '数据集中心':
                return <DatasetCenter datasets={datasets} onSelectDataset={setSelectedDataset} />;
            case '数据处理':
                return <DataProcessing />;
            case '数据集构建':
                return <DatasetConstruction />;
            default:
                return <DatasetCenter datasets={datasets} onSelectDataset={setSelectedDataset} />;
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header: Cockpit Switcher centered */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-6 relative min-h-[64px]">
                {/* Placeholder for left side to keep switcher centered */}
                <div className="w-64 hidden xl:block"></div>

                <div className="flex-1 flex justify-center">
                    <div className="flex items-center p-1 bg-gray-100/80 rounded-2xl border border-gray-100 shadow-sm">
                        {['数据集中心', '数据处理', '数据集构建'].map(view => (
                            <button
                                key={view}
                                onClick={() => { setViewMode(view); onNavigate(view); }}
                                className={`text-[15px] font-black tracking-tight px-9 py-2.5 rounded-xl transition-all ${viewMode === view ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {view}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-6 px-6 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm text-xs">
                    <div className="flex flex-col">
                        <span className="text-gray-400 font-bold uppercase tracking-tighter">存储量</span>
                        <span className="font-mono text-gray-900 font-bold">12.4 / 50 GB</span>
                    </div>
                    <div className="w-px h-8 bg-gray-100"></div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 font-bold uppercase tracking-tighter">进行中任务</span>
                        <span className="font-mono text-indigo-600 font-bold">4 运行中</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {renderContent()}
            </div>
        </div>
    );
};