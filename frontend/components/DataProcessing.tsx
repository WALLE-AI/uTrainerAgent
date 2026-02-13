import React from 'react';
import { Icon, ICONS } from './shared';

const { useState } = React;

const ProcessingTaskCard = ({ task }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${task.color} bg-opacity-10 ${task.textColor}`}>
                <Icon path={task.icon} className="w-6 h-6" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${task.status === 'Running' ? 'bg-green-50 text-green-600 animate-pulse' : 'bg-gray-50 text-gray-500'}`}>
                {task.status}
            </span>
        </div>
        <h3 className="font-bold text-gray-800 mb-1">{task.name}</h3>
        <p className="text-xs text-gray-500 mb-4">{task.description}</p>
        <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-gray-400">进度</span>
                <span className="text-gray-900">{task.progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${task.color} transition-all duration-500`}
                    style={{ width: `${task.progress}%` }}
                ></div>
            </div>
        </div>
        <button className="mt-6 w-full py-2.5 rounded-xl border border-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            查看详情
            <Icon path={ICONS.arrowLeft} className="w-3 h-3 rotate-180" />
        </button>
    </div>
);

export const DataProcessing = () => {
    const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'tools'

    const tasks = [
        { id: 1, name: '金融语料清洗', description: '删除HTML标签、修复断句、识别实体。', progress: 65, status: 'Running', icon: ICONS.shield, color: 'bg-indigo-500', textColor: 'text-indigo-500' },
        { id: 2, name: '多模态数据聚类', description: '基于语义向量对10万张图片进行聚类分析。', progress: 100, status: 'Completed', icon: ICONS.beaker, color: 'bg-pink-500', textColor: 'text-pink-500' },
        { id: 3, name: '敏感词过滤', description: '针对通用大模型合规性要求的规则过滤。', progress: 0, status: 'Pending', icon: ICONS.shield, color: 'bg-orange-500', textColor: 'text-orange-500' },
    ];

    const processingTools = [
        { name: '格式转换', icon: ICONS.data, desc: 'JSONL, Parquet, CSV 互转' },
        { name: '精准过滤', icon: ICONS.search, desc: '基于规则或特征的样本筛选' },
        { name: '语义去重', icon: ICONS.deduplicate, desc: '高维度向量近邻搜索去重' },
        { name: '自动聚类', icon: ICONS.dashboard, desc: 'K-Means / DBSCAN 自动分类' },
    ];

    return (
        <div className="space-y-6 pt-4 animate-slide-in-right pb-10">
            <div className="flex justify-between items-center">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        任务列表
                    </button>
                    <button
                        onClick={() => setActiveTab('tools')}
                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'tools' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        处理工具箱
                    </button>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-xl shadow-indigo-100 transition-all flex items-center gap-2">
                    <Icon path={ICONS.plus} className="w-4 h-4" />
                    新建处理任务
                </button>
            </div>

            {activeTab === 'tasks' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tasks.map(task => (
                        <ProcessingTaskCard key={task.id} task={task} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {processingTools.map(tool => (
                        <div key={tool.name} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-all cursor-pointer group">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                <Icon path={tool.icon} className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">{tool.name}</h3>
                            <p className="text-sm text-gray-500 mt-2 font-medium">{tool.desc}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
