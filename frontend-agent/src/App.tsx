import { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LandingPage from './components/LandingPage';
import LibraryPage from './components/LibraryPage';
import SkillCenterPage from './components/SkillCenterPage';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import UserProfileModal from './components/UserProfileModal';
import UserOverview from './components/profile/UserOverview';
import HomePage from './components/HomePage';
import KnowledgeBasePage from './components/KnowledgeBasePage';
import { DatasetConstruction } from './components/llmops/DatasetConstruction';
import { ModelEvaluation } from './components/llmops/ModelEvaluation';
import { NewTrainingWizard } from './components/llmops/NewTrainingWizard';

import { ProcessManager } from './components/llmops/ProcessManager';
import { LlmOpsLayout } from './components/llmops/LlmOpsLayout';
import { ModelWeights } from './components/llmops/ModelWeights';

type ViewType = 'landing' | 'library' | 'session' | 'skills' | 'auth' | 'profile' | 'home' | 'knowledge' | 'overview' | 'datasets' | 'training' | 'evaluation' | 'processes';

interface User {
  name: string;
  email: string;
  avatar: string;
}

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [user, setUser] = useState<User | null>({
    name: 'uTrainer Admin',
    email: 'admin@utrainer.ai',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=uTrainer'
  });
  const [actionName, setActionName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionVersion, setSessionVersion] = useState(0); // 用于触发Sidebar刷新会话列表
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'settings' | 'billing' | null>(null);
  const [agentMode, setAgentMode] = useState<'build' | 'plan' | 'explore'>('build');
  const [isTrainingWizardOpen, setIsTrainingWizardOpen] = useState(false);

  // Initialize user from localStorage if exists (requires both user AND auth_token)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleStart = (text: string, activeTag?: string, selectedMode?: 'build' | 'plan' | 'explore') => {
    if (!user) {
      setCurrentView('auth');
      return;
    }

    if (!text && !activeTag) {
      setCurrentView('home');
      return;
    }

    // 新会话，不传入sessionId
    setCurrentSessionId(null);
    setPrompt(text);
    setActionName(activeTag || "");
    setAgentMode(selectedMode || 'build');
    setCurrentView('session');
  };

  // 会话创建完成后的回调
  const handleSessionCreated = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    // 触发侧边栏刷新会话列表
    setSessionVersion(v => v + 1);
  }, []);

  // 点击历史会话
  const handleSessionSelect = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setPrompt(""); // 从历史加载，不需要初始prompt
    setActionName("");
    setCurrentView('session');
  }, []);

  // 新建会话
  const handleNewSession = useCallback(() => {
    setCurrentSessionId(null);
    setCurrentView(user ? 'home' : 'landing');
  }, [user]);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('home');
  };

  const handleLogout = () => {
    console.log('Logout initiated');
    setCurrentView('auth');
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f9fafb]">
      <Toaster position="top-center" />
      {/* Sidebar is common across views, except auth and landing (portal) */}
      {currentView !== 'auth' && currentView !== 'landing' && (
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          currentView={currentView}
          onNavigate={setCurrentView}
          user={user}
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
          onNewSession={handleNewSession}
          sessionVersion={sessionVersion}
          onOpenProfile={(tab) => setActiveProfileTab(tab)}
          onLogout={handleLogout}
        />
      )}

      {user && (
        <UserProfileModal
          isOpen={!!activeProfileTab}
          onClose={() => setActiveProfileTab(null)}
          activeTab={activeProfileTab || 'overview'}
          user={user}
          onLogout={handleLogout}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {currentView === 'landing' && <LandingPage onStart={handleStart} />}
        {currentView === 'home' && <HomePage onStart={handleStart} />}
        {currentView === 'library' && <LibraryPage />}
        {currentView === 'knowledge' && <KnowledgeBasePage />}
        {currentView === 'skills' && <SkillCenterPage />}
        {currentView === 'auth' && (
          <AuthPage
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setCurrentView('landing')}
          />
        )}
        {currentView === 'datasets' && (
          <LlmOpsLayout>
            <DatasetConstruction />
          </LlmOpsLayout>
        )}
        {currentView === 'training' && (
          <LlmOpsLayout>
            <div className="space-y-8">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIsTrainingWizardOpen(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
                >
                  <span className="text-lg">+</span>
                  新建训练实验
                </button>
              </div>

              <ModelWeights />
            </div>

            <NewTrainingWizard
              isOpen={isTrainingWizardOpen}
              onClose={() => setIsTrainingWizardOpen(false)}
            />
          </LlmOpsLayout>
        )}
        {currentView === 'processes' && (
          <LlmOpsLayout>
            <ProcessManager />
          </LlmOpsLayout>
        )}
        {currentView === 'evaluation' && (
          <LlmOpsLayout>
            <ModelEvaluation />
          </LlmOpsLayout>
        )}
        {currentView === 'profile' && user && (
          <ProfilePage
            user={user}
            onLogout={handleLogout}
          />
        )}
        {currentView === 'overview' && user && (
          <UserOverview user={user} onLogout={handleLogout} />
        )}

        {currentView === 'session' && (
          <ChatArea
            actionName={actionName}
            initialPrompt={prompt}
            sessionId={currentSessionId}
            initialAgentMode={agentMode}
            onSessionCreated={handleSessionCreated}
            onBack={() => setCurrentView(user ? 'home' : 'landing')}
          />
        )}
      </div>

    </div>
  );
}

export default App;
