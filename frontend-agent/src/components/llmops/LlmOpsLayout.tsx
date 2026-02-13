/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

export const LlmOpsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex-1 h-screen overflow-y-auto bg-white p-8 lg:p-12 custom-scrollbar">
            <div className="max-w-7xl mx-auto pb-20">
                {children}
            </div>
        </div>
    );
};
