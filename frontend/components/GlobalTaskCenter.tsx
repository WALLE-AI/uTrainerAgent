import React from 'react';
import { Icon, ICONS } from './shared';

interface Task {
    id: string;
    name: string;
    status: 'Running' | 'Completed' | 'Failed';
    progress: number;
    type: 'training' | 'deployment' | 'data';
}

const mockTasks: Task[] = [
    { id: '1', name: 'Alpaca SFT 训练', status: 'Running', progress: 45, type: 'training' },
    { id: '2', name: 'Qwen-7B 部署', status: 'Running', progress: 80, type: 'deployment' },
    { id: '3', name: '金融数据集预处理', status: 'Completed', progress: 100, type: 'data' },
];

export const GlobalTaskCenter = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 animate-slide-in-right border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <Icon path={ICONS.tasks} className="w-5 h-5 text-indigo-600" />
                    任务中心
                </h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                    <Icon path={ICONS.close} className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mockTasks.map(task => (
                    <div key={task.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:border-indigo-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700 truncate">{task.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${task.status === 'Running' ? 'bg-blue-100 text-blue-600' :
                                task.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                    'bg-red-100 text-red-600'
                                }`}>
                                {task.status === 'Running' ? '进行中' : task.status === 'Completed' ? '完成' : '失败'}
                            </span>
                        </div>

                        <div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`absolute h-full transition-all duration-500 ${task.status === 'Running' ? 'bg-indigo-500' :
                                    task.status === 'Completed' ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${task.progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-medium">
                            <span>{task.type === 'training' ? '训练任务' : task.type === 'deployment' ? '推理部署' : '数据处理'}</span>
                            <span>{task.progress}%</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <button className="w-full py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors">
                    查看全部任务历史
                </button>
            </div>
        </div>
    );
};
