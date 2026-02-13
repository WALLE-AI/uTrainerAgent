import React from 'react';
import { DatasetCard } from './DatasetCard';
import { UploadDatasetWizard } from './UploadDatasetWizard';
import { Icon, ICONS } from './shared';

const { useState, useMemo } = React;

const modalities = ['全部', 'Text', 'Image', 'Video'];
const domains = ['全部', 'SFT', '中文', '英文', 'RLHF', '预训练', '金融', '医疗', '交通'];

export const DatasetCenter = ({ datasets, onSelectDataset }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDomain, setActiveDomain] = useState('全部');
    const [activeModality, setActiveModality] = useState('全部');
    const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);
    const [isModalityDropdownOpen, setIsModalityDropdownOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const filteredDatasets = useMemo(() => {
        return datasets.filter(dataset => {
            const nameMatch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase());
            const domainMatch = activeDomain === '全部' || dataset.tags.includes(activeDomain);
            const modalityMatch = activeModality === '全部' || dataset.modality === activeModality;
            return nameMatch && domainMatch && modalityMatch;
        });
    }, [datasets, searchTerm, activeDomain, activeModality]);

    return (
        <div className="space-y-6 pt-4 animate-slide-in-right">
            <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Icon path={ICONS.search} className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="搜索数据集..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsModalityDropdownOpen(!isModalityDropdownOpen)}
                            className="flex items-center space-x-2 text-sm px-4 py-2 rounded-xl hover:bg-gray-50 border border-gray-100 transition-all text-gray-600 bg-white min-w-[120px] font-bold"
                        >
                            <span>模态: {activeModality}</span>
                            <Icon path={ICONS.chevronDown} className="w-4 h-4" />
                        </button>
                        {isModalityDropdownOpen && (
                            <div className="absolute z-20 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                                {modalities.map(m => (
                                    <button key={m} onClick={() => { setActiveModality(m); setIsModalityDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium">
                                        {m}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsDomainDropdownOpen(!isDomainDropdownOpen)}
                            className="flex items-center space-x-2 text-sm px-4 py-2 rounded-xl hover:bg-gray-50 border border-gray-100 transition-all text-gray-600 bg-white min-w-[120px] font-bold"
                        >
                            <span>领域: {activeDomain}</span>
                            <Icon path={ICONS.chevronDown} className="w-4 h-4" />
                        </button>
                        {isDomainDropdownOpen && (
                            <div className="absolute z-20 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                {domains.map(domain => (
                                    <button key={domain} onClick={() => { setActiveDomain(domain); setIsDomainDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium">
                                        {domain}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setIsUploading(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-2.5 rounded-xl text-sm shadow-xl shadow-indigo-100 transition-all flex items-center gap-2"
                >
                    <Icon path={ICONS.plus} className="w-4 h-4" />
                    录入数据
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                {filteredDatasets.map(d => (
                    <DatasetCard key={d.name} dataset={d} onSelect={onSelectDataset} />
                ))}
            </div>
            <UploadDatasetWizard isOpen={isUploading} onClose={() => setIsUploading(false)} />
        </div>
    )
}
