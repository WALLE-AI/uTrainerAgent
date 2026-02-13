/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ModelCard } from './ModelCard';
import { Icon, ICONS } from './shared';
import { mockDeployments } from '../api/mockData';

export const EnginesAndInstances = ({ openCreationModal, deployments, onDelete }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-2">
                服务实例列表
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </h2>
            <button onClick={openCreationModal} className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-black px-6 py-2.5 rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-gray-200 transition-all active:scale-95">
                <Icon path={ICONS.plus} className="w-4 h-4" />
                新建部署服务
            </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
            {deployments.map(d => <ModelCard key={d.id} deployment={d} onDelete={() => onDelete(d.id)} />)}
        </div>
    </div>
);
