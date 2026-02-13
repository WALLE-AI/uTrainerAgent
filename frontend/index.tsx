/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ReactDOM from 'react-dom/client';

import { SideNav } from './components/SideNav';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { DataPlatform } from './components/DataPlatform';
import { ModelDeployment } from './components/ModelDeployment';
import { Training } from './components/Training';
import { ObservabilityPlatform } from './components/ObservabilityPlatform';
import { ModelEvaluation } from './components/ModelEvaluation';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { UserProfile } from './components/UserProfile';

const { useState } = React;

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authPage, setAuthPage] = useState('login'); // 'login' | 'register'
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [activeView, setActiveView] = useState('看板');
    const [navigationParams, setNavigationParams] = useState<any>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleLogin = (user) => {
        setCurrentUser(user);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setActiveView('看板');
    };

    const handleNavigate = (view: string, params: any = null) => {
        setActiveView(view);
        setNavigationParams(params);
    };

    const renderContent = () => {
        switch (activeView) {
            case '看板':
                return <Dashboard onNavigate={handleNavigate} />;
            case '数据平台':
            case '数据集中心':
                return <DataPlatform params={{ ...navigationParams, initialView: '数据集中心' }} onNavigate={handleNavigate} />;
            case '数据处理':
                return <DataPlatform params={{ ...navigationParams, initialView: '数据处理' }} onNavigate={handleNavigate} />;
            case '数据集构建':
                return <DataPlatform params={{ ...navigationParams, initialView: '数据集构建' }} onNavigate={handleNavigate} />;
            case '模型训练':
                return <Training params={navigationParams} onNavigate={handleNavigate} />;
            case '模型部署':
                return <ModelDeployment />;
            case '模型评测':
                return <ModelEvaluation />;
            case '观测性平台':
                return <ObservabilityPlatform />;
            case '用户详情':
                return <UserProfile user={currentUser} onLogout={handleLogout} />;
            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">敬请期待</h1>
                            <p className="text-gray-500">正在建设【{activeView}】页面。</p>
                        </div>
                    </div>
                );
        }
    };

    if (!isLoggedIn) {
        return authPage === 'login'
            ? <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setAuthPage('register')} />
            : <RegisterPage onRegister={handleLogin} onSwitchToLogin={() => setAuthPage('login')} />;
    }

    return (
        <div
            className="flex h-screen bg-gray-100 text-gray-800 font-sans"
        >
            <SideNav
                activeView={activeView}
                setActiveView={(view: string) => handleNavigate(view)}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar isSidebarCollapsed={isSidebarCollapsed} onNavigate={handleNavigate} user={currentUser} />
                <main className="flex-1 overflow-y-auto p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

// --- Mount App ---
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<React.StrictMode><App /></React.StrictMode>);