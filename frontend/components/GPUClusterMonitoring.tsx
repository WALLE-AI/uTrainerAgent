import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Icon, ICONS, Tag } from './shared';
import { KpiCard } from './KpiCard';
import { mockGPUCluster } from '../api/mockData';

const GPUStatusIndicator = ({ util }) => {
    let color = 'bg-green-500 shadow-green-500/50';
    if (util > 80) color = 'bg-red-500 shadow-red-500/50';
    else if (util > 40) color = 'bg-yellow-500 shadow-yellow-500/50';
    else if (util === 0) color = 'bg-gray-300 shadow-gray-300/50';

    return (
        <div className={`w-3 h-3 rounded-sm ${color} shadow-lg transition-all duration-500`}></div>
    );
};

const GPUCard = ({ gpu }) => (
    <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 p-2 rounded-lg hover:bg-white/10 transition-all cursor-help">
        <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono text-gray-400">{gpu.id.split('-').pop()}</span>
            <GPUStatusIndicator util={gpu.util} />
        </div>
        <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Util</span>
                <span className={`font-bold ${gpu.util > 80 ? 'text-red-400' : 'text-indigo-400'}`}>{gpu.util}%</span>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${gpu.util > 80 ? 'bg-red-500' : 'bg-indigo-500'}`}
                    style={{ width: `${gpu.util}%` }}
                ></div>
            </div>
        </div>

        {/* Tooltip Simulation */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-gray-900 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-white/10">
            <p className="text-[10px] font-black text-indigo-400 mb-1">{gpu.model}</p>
            <div className="grid grid-cols-2 gap-1 text-[8px] text-gray-400">
                <span>VRAM: {gpu.mem}%</span>
                <span>Temp: {gpu.temp}°C</span>
                <span>Power: {gpu.power}W</span>
            </div>
        </div>
    </div>
);

const NodeAccordion = ({ node, isExpanded, onToggle }) => {
    return (
        <div className={`border rounded-[24px] overflow-hidden transition-all duration-300 ${isExpanded ? 'bg-gray-50 border-indigo-200' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div
                onClick={onToggle}
                className="p-5 flex items-center justify-between cursor-pointer"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${node.status === 'Healthy' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        <Icon path={ICONS.building} className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-gray-900">{node.name}</h4>
                            <Tag
                                text={node.status === 'Healthy' ? '在线' : '告警'}
                                color={node.status === 'Healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 mt-1">
                            <span className="text-indigo-600">IP: {node.ip}</span> • {node.role}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex gap-4">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CPU</p>
                            <p className="text-sm font-mono font-black">{node.cpu}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RAM</p>
                            <p className="text-sm font-mono font-black">{node.memory.split(' / ')[0]}</p>
                        </div>
                    </div>
                    <Icon
                        path={isExpanded ? ICONS.chevronUp : ICONS.chevronDown}
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {isExpanded && (
                <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="h-px bg-gray-200 mb-5"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                        {node.gpus.map(gpu => <GPUCard key={gpu.id} gpu={gpu} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

export const GPUClusterMonitoring = () => {
    const [expandedNode, setExpandedNode] = useState(mockGPUCluster[0].id);

    const stats = useMemo(() => {
        const allGpus = mockGPUCluster.flatMap(n => n.gpus);
        const totalGpus = allGpus.length;
        const avgUtil = Math.round(allGpus.reduce((acc, g) => acc + g.util, 0) / totalGpus);
        const totalPower = allGpus.reduce((acc, g) => acc + g.power, 0);

        const onlineNodes = mockGPUCluster.filter(n => n.status === 'Healthy').length;
        const totalNodes = mockGPUCluster.length;

        return [
            { title: '节点在线状态', value: `${onlineNodes} / ${totalNodes}`, icon: ICONS.building, iconBgColor: 'bg-green-600' },
            { title: '集群 GPU 总数', value: totalGpus, icon: ICONS.cluster, iconBgColor: 'bg-indigo-600' },
            { title: '平均利用率', value: `${avgUtil}%`, icon: ICONS.chartBar, iconBgColor: 'bg-blue-500' },
            { title: '总实时功耗', value: `${(totalPower / 1000).toFixed(1)}kW`, icon: ICONS.cog, iconBgColor: 'bg-orange-500' },
        ];
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header / Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        集群资源拓扑
                    </h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">全集群 GPU 健康状态与实时指标</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                        刷新看板
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                        导出日志
                    </button>
                </div>
            </div>

            {/* KPI Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => <KpiCard key={stat.title} {...stat} />)}
            </div>

            {/* Topology Map (Aggregated View) */}
            <div className="bg-gray-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full -mr-48 -mt-48"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">全集群健康热力图</h3>
                            <p className="text-[10px] text-gray-500 mt-1">集群内 {mockGPUCluster.reduce((acc, n) => acc + n.gpus.length, 0)} 块 GPU 状态概览（分布于 {mockGPUCluster.length} 个节点）</p>
                        </div>
                        <div className="flex gap-4 text-[8px] font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> 运行中 / Active</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> 高负载 / High Load</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> 告警 / Warning</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-500"></div> 空闲 / Idle</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-24 gap-3">
                        {mockGPUCluster.flatMap(n => n.gpus).map(gpu => (
                            <div
                                key={gpu.id}
                                className={`aspect-square rounded-[4px] relative group cursor-pointer transition-all duration-500 hover:scale-125 hover:z-20
                                    ${gpu.util > 80 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
                                        gpu.util > 40 ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                                            gpu.util > 0 ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' :
                                                'bg-gray-700'}`}
                            >
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-24 p-2 bg-black/90 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-75 group-hover:scale-100 origin-bottom">
                                    <p className="text-[8px] font-black text-center">{gpu.id}</p>
                                    <p className="text-[10px] font-black text-center text-indigo-400">{gpu.util}% Util</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Node List / Detail View */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">计算节点详情</h3>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{mockGPUCluster.length} 个节点在线</span>
                </div>
                <div className="space-y-4">
                    {mockGPUCluster.map(node => (
                        <NodeAccordion
                            key={node.id}
                            node={node}
                            isExpanded={expandedNode === node.id}
                            onToggle={() => setExpandedNode(expandedNode === node.id ? null : node.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
