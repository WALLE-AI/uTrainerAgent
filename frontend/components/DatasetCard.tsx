/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Icon, ICONS, Tag, tagColors, statusColors } from './shared';

type DatasetCardProps = { dataset: any, onSelect: (dataset: any) => void; };

export const DatasetCard: React.FC<DatasetCardProps> = ({ dataset, onSelect }) => {
    const renderModalityIcon = () => {
        switch (dataset.modality) {
            case 'Image': return <Icon path={ICONS.observability} className="w-5 h-5" />; // Replace with Image icon if available
            case 'Video': return <Icon path={ICONS.play} className="w-5 h-5" />;
            default: return <Icon path={ICONS.data} className="w-5 h-5" />;
        }
    };

    const getModalityGlow = () => {
        switch (dataset.modality) {
            case 'Image': return 'shadow-[0_0_15px_-3px_rgba(236,72,153,0.3)] border-pink-100';
            case 'Video': return 'shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)] border-green-100';
            default: return 'shadow-[0_0_15px_-3px_rgba(79,70,229,0.3)] border-indigo-100';
        }
    };

    return (
        <div
            onClick={() => onSelect(dataset)}
            className={`group glass border transition-all duration-500 rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-95 flex flex-col h-full relative ${getModalityGlow()}`}
        >
            <div className="relative h-28 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-50/50">
                {dataset.thumbnail ? (
                    <img src={dataset.thumbnail} alt={dataset.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
                ) : (
                    <div className="flex flex-col items-center opacity-30 group-hover:opacity-100 transition-opacity">
                        {renderModalityIcon()}
                        <span className="text-[8px] mt-1 font-black uppercase tracking-tighter">{dataset.modality}</span>
                    </div>
                )}

                {/* Overlay Action */}
                <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <span className="bg-white text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        VIEW DATA SPACE
                    </span>
                </div>

                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white px-2 py-0.5 rounded text-[9px] font-bold">
                    {dataset.samples} SAMPLES
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-gray-800 group-hover:text-indigo-600 truncate flex-1 uppercase tracking-tight text-sm">{dataset.name}</h3>
                    <span className="text-[9px] font-mono bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-600 font-bold ml-2">{dataset.version}</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-1">
                    {dataset.tags.slice(0, 2).map(t => <Tag key={t} color={tagColors[t] || 'bg-gray-100 text-gray-600'} text={t} />)}
                </div>

                <div className="mt-auto pt-4 flex justify-between items-center text-[10px] text-gray-400 font-bold border-t border-gray-50 uppercase tracking-tighter">
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${dataset.status === 'Published' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`}></span>
                        <span>{dataset.status}</span>
                    </div>
                    <span>{dataset.size}</span>
                </div>
            </div>
        </div>
    );
};
