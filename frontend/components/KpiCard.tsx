/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Icon } from './shared';

type KpiCardProps = { title: React.ReactNode, value: React.ReactNode, icon: string, iconBgColor: string };

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, iconBgColor }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm backdrop-blur-sm">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
            </div>
            <div className={`p-2 rounded-lg ${iconBgColor}`}>
                <Icon path={icon} className="w-5 h-5 text-white" />
            </div>
        </div>
    </div>
);
