import { useState, useEffect, useCallback, useRef } from 'react';
import ThoughtProcess from './ThoughtProcess';
import type { ThoughtStep } from './ThoughtProcess';
import { Send, Sparkles, MessageSquare, ChevronLeft, Paperclip, Globe, ThumbsUp, ThumbsDown, RotateCcw, Copy, Presentation, Terminal, Plus, Puzzle, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AgentConsole from './AgentConsole';
import AddConnectorModal from './AddConnectorModal';
import FilePreviewItem from './FilePreviewItem';
import type { UploadedFile } from './FilePreviewItem';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sessionService } from '../api/sessions';
import { todoService } from '../api/todos';
import { sessionLogService } from '../api/logs';
import { fileService } from '../api/files';
import { MOCK_DEMO_PROMPT, MOCK_TRAINING_STEPS, MOCK_TERMINAL_LOGS, MOCK_FINAL_LOGS, MOCK_FINAL_CONTENT } from '../utils/mockTrainingData';

interface Message {
    id?: string;  // 添加ID字段用于React key
    role: 'user' | 'assistant';
    content: string;
    thoughtSteps?: ThoughtStep[];
    thinkingContent?: string;  // 独立的思考/推理内容
    isPPTResponse?: boolean;
}

interface ChatAreaProps {
    actionName?: string;
    initialPrompt?: string;
    sessionId?: string | null;  // 会话ID，null表示新会话
    initialAgentMode?: 'build' | 'plan' | 'explore';
    onSessionCreated?: (sessionId: string) => void; // 会话创建回调
    onBack?: () => void;
}


const ChatArea: React.FC<ChatAreaProps> = ({ actionName, initialPrompt, sessionId, initialAgentMode, onSessionCreated, onBack }) => {
    const hasInitialResponseRef = useRef(false);
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);
    const [sessionTitle, setSessionTitle] = useState<string>("");
    const [agentMode, setAgentMode] = useState<'build' | 'plan' | 'explore'>(initialAgentMode || 'build');
    // 用于未来显示历史加载状态
    const [, setIsLoadingHistory] = useState(false);

    const [isExecuting, setIsExecuting] = useState(false);
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);
    const [isDataSourceMenuOpen, setIsDataSourceMenuOpen] = useState(false);
    const [isAgentModeMenuOpen, setIsAgentModeMenuOpen] = useState(false);
    const [isAddConnectorModalOpen, setIsAddConnectorModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [dataSources, setDataSources] = useState({
        webSearch: true,
        googleDrive: false
    });
    const [todos, setTodos] = useState<Array<{ id: string; content: string; status: 'pending' | 'in_progress' | 'completed' | 'failed'; priority: number; output?: string }>>([]);
    const [generatedFiles, setGeneratedFiles] = useState<Array<{ path: string; name: string; action: string; size: number; timestamp: Date; url?: string }>>([]);
    const [sessionLogs, setSessionLogs] = useState<Array<{ id?: string; type: string; title: string; content?: string; status: 'active' | 'complete' | 'error'; timestamp: Date; toolName?: string }>>([]);
    const isNewExecutionRef = useRef(false); // 标记是否是新执行,防止状态累积

    // 加载历史消息或初始化
    const prevSessionIdRef = useRef<string | undefined>(undefined);
    // 标记是否正在进行新会话创建流程（防止加载历史覆盖当前消息）
    const isCreatingSessionRef = useRef(false);

    useEffect(() => {
        hasInitialResponseRef.current = false;

        const init = async () => {
            console.log('[ChatArea] useEffect triggered, sessionId:', sessionId, 'prevSessionId:', prevSessionIdRef.current);

            if (sessionId) {
                // 检测 sessionId 是否真的变化了
                const sessionChanged = prevSessionIdRef.current !== sessionId;
                console.log('[ChatArea] sessionChanged:', sessionChanged);

                if (sessionChanged) {
                    // 特殊逻辑：如果当前正处于新会话创建流程中，不要清除当前消息加载历史
                    // 因为 handleGetResponse 正在异步处理这些事
                    if (isCreatingSessionRef.current && currentSessionId === sessionId) {
                        console.log('[ChatArea] Skipping history load - creating new session');
                        prevSessionIdRef.current = sessionId;
                        isCreatingSessionRef.current = false;
                        return;
                    }

                    console.log('[ChatArea] Loading historical session data for:', sessionId);
                    prevSessionIdRef.current = sessionId;
                    setIsLoadingHistory(true);
                    setMessages([]); // 清空旧消息以显示新加载的
                    setSessionLogs([]); // 清空日志
                    setTodos([]); // 清空待办
                    setGeneratedFiles([]); // 清空生成的文件
                    try {
                        console.log('[ChatArea] Fetching messages, todos, logs, and files...');
                        const [messagesResponse, todosResponse, logsResponse, filesResponse] = await Promise.all([
                            sessionService.getMessages(sessionId),
                            todoService.list(sessionId),
                            sessionLogService.list(sessionId),
                            fileService.listBySession(sessionId)
                        ]);
                        console.log('[ChatArea] Messages response:', messagesResponse);
                        console.log('[ChatArea] Todos response:', todosResponse);
                        console.log('[ChatArea] Logs response:', logsResponse);
                        console.log('[ChatArea] Files response:', filesResponse);

                        // Load messages
                        if (messagesResponse.success && messagesResponse.data) {
                            const uniqueMessages = new Map<string, Message>();
                            messagesResponse.data.forEach((msg: any) => {
                                if (msg.role === 'user' || msg.role === 'assistant') {
                                    // 🔧 FIX: 跳过内容为空的 assistant 消息（后端重复保存导致）
                                    if (msg.role === 'assistant' && (!msg.content || msg.content.trim() === '' || msg.content === '\n')) {
                                        console.log('[ChatArea] Skipping empty assistant message:', msg.id);
                                        return;
                                    }

                                    if (!uniqueMessages.has(msg.id)) {
                                        uniqueMessages.set(msg.id, {
                                            id: msg.id, // 添加 id 字段
                                            role: msg.role as 'user' | 'assistant',
                                            content: msg.content || '',
                                            thoughtSteps: [] // Historical messages don't have thought steps
                                        });
                                    }
                                }
                            });
                            console.log('[ChatArea] Loaded', uniqueMessages.size, 'messages');
                            setMessages(Array.from(uniqueMessages.values()));
                        }

                        // Load todos
                        if (todosResponse.success && todosResponse.data) {
                            const mappedTodos = todosResponse.data.map((todo: any) => ({
                                id: todo.id,
                                content: todo.title,
                                status: todo.status,
                                priority: todo.order,
                                output: todo.result,
                            }));
                            console.log('[ChatArea] Loaded', mappedTodos.length, 'todos:', mappedTodos);
                            setTodos(mappedTodos);
                        } else {
                            console.log('[ChatArea] No todos data in response, data:', todosResponse.data);
                        }

                        // Load logs (映射到 AgentConsole 的 LogItem 格式)
                        if (logsResponse.success && logsResponse.data) {
                            const mappedLogs = logsResponse.data.map((log: any) => ({
                                type: log.logType,
                                title: log.title,
                                content: log.content,
                                status: log.status as 'active' | 'complete' | 'error',
                                timestamp: new Date(log.createdAt),
                                toolName: log.toolName,
                                id: log.id,
                            }));
                            console.log('[ChatArea] Loaded', mappedLogs.length, 'logs');
                            setSessionLogs(mappedLogs);
                        }

                        // Load files (映射到 AgentConsole 的 FileItem 格式)
                        if (filesResponse.success && filesResponse.data) {
                            const mappedFiles = filesResponse.data.map((file: any) => {
                                // 验证 storagePath 是否有效
                                const url = file.storagePath && file.storagePath.trim() !== ''
                                    ? file.storagePath
                                    : null;

                                // 如果 URL 无效，记录警告
                                if (!url) {
                                    console.warn(`[ChatArea] File ${file.filename} has no valid URL`);
                                }

                                return {
                                    id: file.id, // 添加文件ID用于下载
                                    path: file.storagePath || file.filename, // 回退到文件名
                                    name: file.filename,
                                    action: file.action,
                                    size: file.size,
                                    timestamp: new Date(file.createdAt),
                                    url: url, // 可能为 null
                                };
                            });

                            // 添加统计日志（总文件数和有效 URL 数量）
                            const validUrlCount = mappedFiles.filter(f => f.url).length;
                            console.log('[ChatArea] Loaded', mappedFiles.length, 'files, valid URLs:', validUrlCount);
                            setGeneratedFiles(mappedFiles);
                        }

                        // Fetch session details for title
                        const sessionResponse = await sessionService.get(sessionId);
                        if (sessionResponse.success && sessionResponse.data) {
                            setSessionTitle(sessionResponse.data.title);
                        }

                    } catch (error) {
                        console.error('[ChatArea] Failed to load session data:', error);
                    } finally {
                        setIsLoadingHistory(false);
                    }
                    setCurrentSessionId(sessionId);
                }
            } else if (initialPrompt && !sessionId && messages.length === 0) {
                // 只有在完全没有消息时才使用 initialPrompt 初始化
                setMessages([{ id: `user-${Date.now()}`, role: 'user', content: initialPrompt }]);
                setSessionTitle(""); // Clear title for new session
                prevSessionIdRef.current = undefined;
            } else if (!sessionId) {
                setSessionTitle(""); // Clear title when viewing new/empty session
            }
        };
        init();
    }, [sessionId]); // 去掉 initialPrompt 和 messages.length 依赖，靠内部逻辑判断

    // 创建新会话
    const createSession = useCallback(async (title?: string) => {
        try {
            // 标记正在创建会话，防止 useEffect 加载历史覆盖当前消息
            isCreatingSessionRef.current = true;
            const response = await sessionService.create({ title });
            if (response.success && response.data) {
                const newSessionId = response.data.id;
                if (response.data.title) {
                    setSessionTitle(response.data.title);
                }
                // 关键：立即同步 Ref，防止 useEffect 误判为外部切换会话
                prevSessionIdRef.current = newSessionId;
                setCurrentSessionId(newSessionId);
                onSessionCreated?.(newSessionId);
                return newSessionId;
            }
        } catch (error) {
            console.error('Failed to create session:', error);
            isCreatingSessionRef.current = false;
        }
        return null;
    }, [onSessionCreated]);

    const simulateMockTraining = useCallback(async (userMessage: string) => {
        setIsExecuting(true);
        isNewExecutionRef.current = true;
        setSessionLogs([]);
        setTodos([]);
        setGeneratedFiles([]);

        // 1. Initial Thinking
        const assistantResponse: Message = {
            id: `assistant-mock-${Date.now()}`,
            role: 'assistant',
            content: "",
            thoughtSteps: [
                { id: '1', title: '分析训练需求...', type: 'plan', status: 'active', reasoning: '正在分析 qwen3-4b-instruct 模型的 SFT 训练配置...' },
            ]
        };
        setMessages(prev => [...prev, assistantResponse]);

        // 2. Open Console and Start Steps
        setTimeout(() => setIsConsoleOpen(true), 1500);

        await new Promise(r => setTimeout(r, 2000));
        setSessionLogs([MOCK_TRAINING_STEPS[0]]);
        setMessages(prev => {
            const last = prev[prev.length - 1];
            return [...prev.slice(0, -1), {
                ...last,
                thoughtSteps: [
                    { id: '1', title: '分析训练需求', type: 'plan', status: 'complete', reasoning: '分析完成。准备环境并加载数据集。' },
                    { id: '2', title: '加载数据集', type: 'plan', status: 'active', reasoning: '' }
                ]
            }];
        });

        await new Promise(r => setTimeout(r, 2000));
        setSessionLogs([MOCK_TRAINING_STEPS[0], MOCK_TRAINING_STEPS[1]]);
        setMessages(prev => {
            const last = prev[prev.length - 1];
            const steps = [...(last.thoughtSteps || [])];
            steps[1] = { ...steps[1], status: 'complete' };
            steps.push({ id: '3', title: '初始化模型', type: 'plan', status: 'active', reasoning: '' });
            return [...prev.slice(0, -1), { ...last, thoughtSteps: steps }];
        });

        // 3. Start Terminal Logs
        await new Promise(r => setTimeout(r, 2000));
        setSessionLogs([MOCK_TRAINING_STEPS[0], MOCK_TRAINING_STEPS[1], MOCK_TERMINAL_LOGS[0]]);

        await new Promise(r => setTimeout(r, 1000));
        setSessionLogs([MOCK_TRAINING_STEPS[0], MOCK_TRAINING_STEPS[1], MOCK_TERMINAL_LOGS[0], MOCK_TERMINAL_LOGS[1]]);

        await new Promise(r => setTimeout(r, 1500));
        setSessionLogs([MOCK_TRAINING_STEPS[0], MOCK_TRAINING_STEPS[1], MOCK_TERMINAL_LOGS[0], MOCK_TERMINAL_LOGS[1], MOCK_TRAINING_STEPS[2]]);

        await new Promise(r => setTimeout(r, 1000));
        setSessionLogs([MOCK_TRAINING_STEPS[0], MOCK_TRAINING_STEPS[1], MOCK_TERMINAL_LOGS[0], MOCK_TERMINAL_LOGS[1], MOCK_TRAINING_STEPS[2], MOCK_TERMINAL_LOGS[2]]);

        // 4. Training Progress Simulation
        await new Promise(r => setTimeout(r, 2000));
        setSessionLogs(prev => [...prev, MOCK_TERMINAL_LOGS[3]]);

        // 5. Finalize
        await new Promise(r => setTimeout(r, 3000));
        setSessionLogs(MOCK_FINAL_LOGS);
        setMessages(prev => {
            const last = prev[prev.length - 1];
            return [...prev.slice(0, -1), {
                ...last,
                content: MOCK_FINAL_CONTENT,
                thoughtSteps: (last.thoughtSteps || []).map(s => ({ ...s, status: 'complete' }))
            }];
        });
        setIsExecuting(false);
    }, []);

    const handleGetResponse = useCallback(async (userMessage: string) => {
        // Intercept for demo
        if (userMessage === MOCK_DEMO_PROMPT) {
            return simulateMockTraining(userMessage);
        }

        setIsExecuting(true);

        // 🔧 标记新执行开始,确保SSE事件处理不会累积旧状态
        isNewExecutionRef.current = true;

        // 🔧 重置执行状态,防止上一轮结果污染下一轮
        // 注意:只清空执行相关的状态,保留消息历史用于对话上下文
        setSessionLogs([]);
        setTodos([]);
        setGeneratedFiles([]);

        // 创建会话
        let activeSessionId = currentSessionId;
        if (!activeSessionId) {
            const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
            activeSessionId = await createSession(title);
            if (!activeSessionId) {
                console.error('Failed to create session');
            }
        }

        // 读取本地缓存的 LLM 配置 (包含 api_key)
        const STORAGE_KEY = 'upapergen_llm_settings';
        const cachedSettings = localStorage.getItem(STORAGE_KEY);
        let llmConfig = null;
        if (cachedSettings) {
            try {
                llmConfig = JSON.parse(cachedSettings);
            } catch (e) {
                console.error('Failed to parse cached LLM settings', e);
            }
        }

        // 助手消息初始化
        const assistantResponse: Message = {
            id: `assistant-${Date.now()}`,  // 添加唯一ID
            role: 'assistant',
            content: "",
            thoughtSteps: [
                { id: '1', title: '正在连接智能体...', type: 'plan', status: 'active', reasoning: '' },
            ]
        };

        console.log('[ChatArea] 🆕 Creating NEW assistant message for round');
        setMessages(prev => {
            console.log('[ChatArea] 📋 Current messages count:', prev.length);
            return [...prev, assistantResponse];
        });

        try {
            const API_URL = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:8000';
            const authToken = localStorage.getItem('auth_token');

            const response = await fetch(`${API_URL}/api/v1/agent/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
                },
                body: JSON.stringify({
                    prompt: userMessage,
                    session_id: activeSessionId,
                    agent: agentMode,
                    llm_config: llmConfig,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No reader available');
            }

            const decoder = new TextDecoder();
            let thoughtContent = '';
            let responseContent = '';

            setTimeout(() => setIsConsoleOpen(true), 500);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const event = JSON.parse(line.slice(6));
                            const type = event.type;

                            if (type === 'session_started' || type === 'start') {
                                console.log('Session confirmed by backend:', event.session_id);
                            } else if (type === 'thought') {
                                thoughtContent += event.content || '';
                                setMessages(prev => {
                                    const lastMsg = prev[prev.length - 1];
                                    if (lastMsg?.role === 'assistant' && lastMsg.thoughtSteps && lastMsg.thoughtSteps.length > 0) {
                                        const steps = lastMsg.thoughtSteps.map((s, idx) => {
                                            if (idx === lastMsg.thoughtSteps!.length - 1) {
                                                return { ...s, reasoning: (s.reasoning || '') + (event.content || '') };
                                            }
                                            return s;
                                        });
                                        return [...prev.slice(0, -1), { ...lastMsg, thoughtSteps: steps }];
                                    }
                                    return prev;
                                });
                            } else if (type === 'delta' || type === 'text-delta') {
                                const deltaContent = event.content || event.text || '';
                                responseContent += deltaContent;
                                console.log('[ChatArea] 📝 Delta received:');
                                console.log('  - Delta text:', deltaContent);
                                console.log('  - Total responseContent:', responseContent.substring(0, 100) + '...');
                                console.log('  - responseContent length:', responseContent.length);
                                setMessages(prev => {
                                    const lastMsg = prev[prev.length - 1];
                                    if (lastMsg?.role === 'assistant') {
                                        console.log('[ChatArea] ✏️ Updating last assistant message');
                                        console.log('  - Old content:', lastMsg.content?.substring(0, 50));
                                        console.log('  - New content:', responseContent.substring(0, 50));
                                        return [...prev.slice(0, -1), { ...lastMsg, content: responseContent }];
                                    }
                                    console.warn('[ChatArea] ⚠️ Last message is NOT assistant, skipping delta update');
                                    return prev;
                                });
                            } else if (type === 'step_start' || type === 'step-start') {
                                const stepNum = event.step || event.step_number || 0;
                                setSessionLogs(prev => {
                                    // 如果是新执行,忽略prev中的旧数据
                                    const base = isNewExecutionRef.current ? [] : prev;
                                    if (isNewExecutionRef.current) isNewExecutionRef.current = false;

                                    const updated = base.map(log =>
                                        log.type === 'step' && log.status === 'active'
                                            ? { ...log, status: 'complete' as const }
                                            : log
                                    );
                                    return [...updated, {
                                        id: event.id || `step-${stepNum}`,
                                        type: 'step',
                                        title: `步骤 ${stepNum}`,
                                        status: 'active' as const,
                                        timestamp: new Date(),
                                    }];
                                });
                                setMessages(prev => {
                                    const lastMsg = prev[prev.length - 1];
                                    if (lastMsg?.role === 'assistant') {
                                        const newStep = {
                                            id: String(stepNum),
                                            title: `步骤 ${stepNum}`,
                                            type: 'plan' as const,
                                            status: 'active' as const,
                                            reasoning: ''
                                        };
                                        const steps = lastMsg.thoughtSteps || [];
                                        return [...prev.slice(0, -1), { ...lastMsg, thoughtSteps: [...steps, newStep] }];
                                    }
                                    return prev;
                                });
                            } else if (type === 'tool_start' || type === 'tool-call') {
                                const toolName = event.tool || event.tool_name || 'unknown';
                                const toolArgs = event.arguments || event.input || {};
                                const toolId = event.id || event.tool_id || `tool-${Date.now()}`;
                                const argsStr = toolArgs ? JSON.stringify(toolArgs).slice(0, 100) : '';
                                setSessionLogs(prev => {
                                    // 如果是新执行,忽略prev中的旧数据
                                    const base = isNewExecutionRef.current ? [] : prev;
                                    if (isNewExecutionRef.current) isNewExecutionRef.current = false;
                                    return [...base, {
                                        id: toolId,
                                        type: 'tool',
                                        toolName: toolName,
                                        title: toolName === 'bash' ? (toolArgs?.command || `调用工具: ${toolName}`) : `调用工具: ${toolName}`,
                                        content: toolName === 'bash' ? (toolArgs?.command || argsStr) : argsStr,
                                        status: 'active',
                                        timestamp: new Date(),
                                    }];
                                });
                                setMessages(prev => {
                                    const lastMsg = prev[prev.length - 1];
                                    if (lastMsg?.role === 'assistant') {
                                        const newStep = {
                                            id: toolId,
                                            title: `调用工具: ${toolName}`,
                                            type: 'sandbox' as const,
                                            status: 'active' as const,
                                            reasoning: ''
                                        };
                                        const steps = lastMsg.thoughtSteps || [];
                                        return [...prev.slice(0, -1), { ...lastMsg, thoughtSteps: [...steps, newStep] }];
                                    }
                                    return prev;
                                });
                            } else if (type === 'tool_end' || type === 'tool-result') {
                                const toolName = event.tool || event.tool_name || 'unknown';
                                setSessionLogs(prev => {
                                    const updated = [...prev];
                                    for (let i = updated.length - 1; i >= 0; i--) {
                                        if (updated[i].toolName === toolName && updated[i].status === 'active') {
                                            const fullOutput = event.output ? (typeof event.output === 'string' ? event.output : JSON.stringify(event.output)) : '';
                                            updated[i] = {
                                                ...updated[i],
                                                status: 'complete',
                                                content: (toolName === 'bash' ? fullOutput : (fullOutput.slice(0, 200) + (fullOutput.length > 200 ? '...' : ''))) || updated[i].content,
                                            };
                                            break;
                                        }
                                    }
                                    return updated;
                                });


                                if (toolName === 'todo_write' && event.metadata?.todos) {
                                    console.log('[ChatArea] 📋 TODO_WRITE EVENT RECEIVED!', event.metadata.todos);
                                    setTodos(event.metadata.todos);
                                    console.log('[ChatArea] ✅ Todos state updated, count:', event.metadata.todos.length);
                                } else if (toolName === 'todo_write') {
                                    console.warn('[ChatArea] ⚠️ TODO_WRITE event but NO todos in metadata!', event.metadata);
                                }

                                // Handle todo_update events (status changes)
                                if (toolName === 'todo_update' && event.metadata?.todos) {
                                    console.log('[ChatArea] 🔄 TODO_UPDATE EVENT RECEIVED!', event.metadata.updated_todo);
                                    setTodos(event.metadata.todos);
                                    console.log('[ChatArea] ✅ Todo status updated!');
                                }

                                // Handle automatic todo updates (from auto-inference)
                                if (toolName === 'todo_auto_update' && event.metadata?.todos) {
                                    console.log('[ChatArea] 🤖 AUTO TODO UPDATE!', {
                                        trigger: event.metadata.trigger,
                                        phase: event.metadata.phase,
                                        todoId: event.metadata.updated_todo_id,
                                    });
                                    setTodos(event.metadata.todos);
                                }
                                if (toolName === 'file_write' && event.metadata?.file_path) {
                                    const filePath = event.metadata.file_path;
                                    const fileName = filePath.split(/[\\\/]/).pop() || filePath;
                                    setGeneratedFiles(prev => {
                                        // 如果是新执行,忽略prev中的旧数据
                                        const base = isNewExecutionRef.current ? [] : prev;
                                        if (isNewExecutionRef.current) isNewExecutionRef.current = false;
                                        return [
                                            ...base.filter(f => f.path !== filePath),
                                            {
                                                id: event.metadata.file_id,
                                                path: filePath,
                                                name: fileName,
                                                action: event.metadata.action || 'created',
                                                size: event.metadata.bytes_written || 0,
                                                timestamp: new Date(),
                                                url: event.metadata.url,
                                            }
                                        ];
                                    });
                                }
                                setMessages(prev => {
                                    const lastMsg = prev[prev.length - 1];
                                    if (lastMsg?.role === 'assistant' && lastMsg.thoughtSteps) {
                                        const steps = lastMsg.thoughtSteps.map(s =>
                                            s.title.includes(toolName) ? { ...s, status: 'complete' as const } : s
                                        );
                                        return [...prev.slice(0, -1), { ...lastMsg, thoughtSteps: steps }];
                                    }
                                    return prev;
                                });
                            } else if (type === 'done' || type === 'finish' || type === 'error') {
                                if (type === 'error') {
                                    setMessages(prev => {
                                        const lastMsg = prev[prev.length - 1];
                                        if (lastMsg?.role === 'assistant') {
                                            return [...prev.slice(0, -1), {
                                                ...lastMsg,
                                                content: (lastMsg.content || '') + `\n\n错误: ${event.content || event.message || '未知错误'}`
                                            }];
                                        }
                                        return prev;
                                    });
                                }
                                setSessionLogs(prev => prev.map(log => ({ ...log, status: 'complete' as const })));
                                setMessages(prev => {
                                    const lastMsg = prev[prev.length - 1];
                                    if (lastMsg?.role === 'assistant' && lastMsg.thoughtSteps) {
                                        const steps = lastMsg.thoughtSteps.map(s => ({ ...s, status: 'complete' as const }));
                                        return [...prev.slice(0, -1), { ...lastMsg, thoughtSteps: steps }];
                                    }
                                    return prev;
                                });
                            }
                        } catch (e) {
                            console.error('Error parsing SSE:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === 'assistant') {
                    return [...prev.slice(0, -1), {
                        ...lastMsg,
                        content: `连接失败: ${error instanceof Error ? error.message : '请检查后端是否运行'}`,
                        thoughtSteps: [{ id: 'error', title: '连接失败', type: 'plan', status: 'complete', reasoning: '' }]
                    }];
                }
                return prev;
            });
        } finally {
            setIsExecuting(false);
        }
    }, [currentSessionId, createSession, agentMode]);

    const handleAbort = async () => {
        if (!currentSessionId) return;
        try {
            const API_URL = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:8000';
            await fetch(`${API_URL}/api/v1/agent/abort/${currentSessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            // 立即更新前端状态
            setIsExecuting(false);
            setSessionLogs(prev => prev.map(log =>
                log.status === 'active' ? { ...log, status: 'complete' as const } : log
            ));
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === 'assistant' && lastMsg.thoughtSteps) {
                    const steps = lastMsg.thoughtSteps.map(s =>
                        s.status === 'active' ? { ...s, status: 'complete' as const } : s
                    );
                    return [...prev.slice(0, -1), { ...lastMsg, thoughtSteps: steps }];
                }
                return prev;
            });
        } catch (error) {
            console.error('Failed to abort execution:', error);
        }
    };

    // 使用初始prompt自动获取响应（仅限新会话）
    useEffect(() => {
        if (initialPrompt && !sessionId && messages.length === 1 && !hasInitialResponseRef.current) {
            hasInitialResponseRef.current = true;
            handleGetResponse(initialPrompt);
        }
    }, [initialPrompt, sessionId, messages.length, handleGetResponse]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newUserMessage: Message = {
            id: `user-${Date.now()}`,  // 添加唯一ID
            role: 'user',
            content: inputText
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputText("");
        handleGetResponse(inputText);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files).map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: file.size,
                type: file.type,
                progress: 0,
                status: 'uploading' as const
            }));

            setUploadedFiles(prev => [...prev, ...newFiles]);

            // Simulate upload progress
            newFiles.forEach(newFile => {
                let currentProgress = 0;
                const interval = setInterval(() => {
                    currentProgress += Math.floor(Math.random() * 20) + 5;
                    if (currentProgress >= 100) {
                        currentProgress = 100;
                        clearInterval(interval);
                        setUploadedFiles(prev =>
                            prev.map(f => f.id === newFile.id ? { ...f, progress: 100, status: 'complete' } : f)
                        );
                    } else {
                        setUploadedFiles(prev =>
                            prev.map(f => f.id === newFile.id ? { ...f, progress: currentProgress } : f)
                        );
                    }
                }, 400);
            });
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (id: string) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex-1 flex h-full overflow-hidden">
            <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-white">
                {/* Header */}
                <header className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-1.5 hover:bg-slate-50 rounded text-slate-400"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                                <MessageSquare size={16} className="text-brand-600" />
                            </div>
                            <span className="font-semibold text-slate-800 text-sm">
                                {sessionTitle || actionName || 'New Chat'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <AnimatePresence initial={false}>
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id || `msg-${idx}`}  // 使用唯一ID而非索引
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`w-full max-w-2xl flex ${msg.role === 'user' ? 'flex-row-reverse gap-4' : 'flex-row gap-4 items-start'}`}>
                                        {msg.role === 'assistant' ? (
                                            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 shadow-sm mt-1">
                                                <Sparkles size={16} className="text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0 shadow-sm overflow-hidden border border-brand-200 mt-1">
                                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User Avatar" />
                                            </div>
                                        )}

                                        <div className={`${msg.role === 'user'
                                            ? 'bg-slate-100 text-slate-800 px-4 py-2.5 rounded-[20px] shadow-sm'
                                            : 'text-slate-700 space-y-4 flex-1 pt-1'
                                            }`}>
                                            {msg.thoughtSteps && msg.thoughtSteps.length > 0 && <ThoughtProcess steps={msg.thoughtSteps} />}

                                            {msg.isPPTResponse ? (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both delay-300">
                                                    <div className="space-y-2">
                                                        <h3 className="text-xl font-bold text-slate-900">已完成·黄鹤楼PPT (三页)</h3>
                                                        <p className="text-[15px] leading-relaxed">
                                                            我已为你生成一份三页的黄鹤楼介绍幻灯片（.slides）。你可以在右侧预览中打开并需要时导出为 .pptx。
                                                        </p>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h4 className="font-bold text-slate-900">文件说明</h4>
                                                        <ul className="list-disc pl-5 space-y-2 text-[15px]">
                                                            <li><span className="font-bold">封面：</span>简洁定位黄鹤楼与演示范围，配以黄鹤楼外观点照片</li>
                                                            <li><span className="font-bold">内容页：</span>历史沿革、文化意象与建筑特征的要点式介绍</li>
                                                            <li><span className="font-bold">收尾页：</span>实用参观建议与体验亮点，使用风景背景以便叠加文本</li>
                                                        </ul>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h4 className="font-bold text-slate-900">风格</h4>
                                                        <ul className="list-disc pl-5 space-y-2 text-[15px]">
                                                            <li><span className="font-bold">色彩：</span>浅色背景，青绿与鼠尾草为点缀，清爽稳重</li>
                                                            <li><span className="font-bold">字体：</span>标题用 Montserrat 与思源黑体；正文用 Open Sans 与思源黑体</li>
                                                        </ul>
                                                        <p className="text-[15px] leading-relaxed mt-4">
                                                            如需修改页面结构、增减图片或加入更具体信息（如票价与时段），告诉我你的偏好，我会快速更新。
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-[18px] w-fit min-w-[280px] hover:bg-slate-100 transition-colors cursor-pointer group">
                                                        <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow transition-shadow">
                                                            <Presentation size={20} className="text-orange-500" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[14px] font-bold text-slate-700">huanghelou_intro</span>
                                                            <span className="text-[11px] text-slate-400">Presentation File • 2.4 MB</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 pt-2">
                                                        <button className="p-2 text-slate-400 hover:text-brand-600 transition-colors"><Copy size={18} /></button>
                                                        <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"><ThumbsUp size={18} /></button>
                                                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><ThumbsDown size={18} /></button>
                                                        <button className="p-2 text-slate-400 hover:text-slate-800 transition-colors"><RotateCcw size={18} /></button>
                                                    </div>

                                                    <div className="pt-4 space-y-2">
                                                        <button className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group">
                                                            <span className="text-sm text-slate-600">在第二页增加关于崔颢《黄鹤楼》诗词的解析以及对文人墨客影响的详细介绍</span>
                                                            <ChevronLeft size={16} className="text-slate-300 group-hover:text-slate-500 rotate-180" />
                                                        </button>
                                                        <button className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group">
                                                            <span className="text-sm text-slate-600">将这份三页的介绍大纲扩展成一份更详细的武汉旅游文化调研报告</span>
                                                            <ChevronLeft size={16} className="text-slate-300 group-hover:text-slate-500 rotate-180" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="prose prose-sm prose-slate max-w-none leading-relaxed text-[15px]">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-6 relative">
                    <div className="max-w-4xl mx-auto relative px-4 text-center">
                        {!isConsoleOpen && (
                            <div className="absolute -top-14 right-4 z-20">
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsConsoleOpen(true)}
                                    className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl shadow-sm px-4 py-2 flex items-center gap-2.5 text-slate-600 hover:text-brand-600 hover:border-brand-200 transition-all group"
                                >
                                    <Terminal size={16} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
                                    <span className="text-[13px] font-semibold">任务中心</span>
                                    <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-slate-50 border border-slate-100 group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase group-hover:text-brand-500">Active</span>
                                    </div>
                                </motion.button>
                            </div>
                        )}

                        <div className="bg-white rounded-[20px] shadow-sm focus-within:shadow-md transition-all text-left border border-slate-100 relative">
                            <AnimatePresence>
                                {uploadedFiles.length > 0 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="flex flex-wrap gap-2 p-3 bg-slate-50/50 border-b border-slate-100 overflow-hidden"
                                    >
                                        {uploadedFiles.map(file => (
                                            <FilePreviewItem
                                                key={file.id}
                                                file={file}
                                                onRemove={removeFile}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="发送消息..."
                                className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-slate-700 p-4 min-h-[60px] resize-none text-[15px] rounded-t-[20px]"
                            />
                            <div className="flex items-center justify-between px-4 py-3 bg-white rounded-b-[20px]">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        multiple
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                                        title="上传文档/图片"
                                    >
                                        <Paperclip size={18} />
                                    </button>

                                    <div className="h-4 w-[1px] bg-slate-200 mx-1" />

                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsAgentModeMenuOpen(!isAgentModeMenuOpen);
                                            }}
                                            disabled={isExecuting}
                                            className={`transition-colors flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg ${isExecuting
                                                ? 'text-slate-300 cursor-not-allowed'
                                                : isAgentModeMenuOpen
                                                    ? 'bg-brand-50 text-brand-600'
                                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {agentMode === 'build' && (
                                                <>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                                                    </svg>
                                                    <span>Build</span>
                                                </>
                                            )}
                                            {agentMode === 'plan' && (
                                                <>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                        <line x1="9" y1="9" x2="15" y2="9"></line>
                                                        <line x1="9" y1="15" x2="15" y2="15"></line>
                                                    </svg>
                                                    <span>Plan</span>
                                                </>
                                            )}
                                            {agentMode === 'explore' && (
                                                <>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="11" cy="11" r="8"></circle>
                                                        <path d="m21 21-4.35-4.35"></path>
                                                    </svg>
                                                    <span>Explore</span>
                                                </>
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {isAgentModeMenuOpen && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-30"
                                                        onClick={() => setIsAgentModeMenuOpen(false)}
                                                    />
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                                        className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-40 overflow-hidden"
                                                    >
                                                        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                            选择智能体模式
                                                        </div>

                                                        <div className="space-y-1">
                                                            <button
                                                                onClick={() => {
                                                                    setAgentMode('build');
                                                                    setIsAgentModeMenuOpen(false);
                                                                }}
                                                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl ${agentMode === 'build'
                                                                    ? 'bg-brand-50 text-brand-600'
                                                                    : 'hover:bg-slate-50 text-slate-600'
                                                                    } transition-colors text-left`}
                                                            >
                                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                                                                    </svg>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium">Build</div>
                                                                    <div className="text-xs text-slate-400">执行模式</div>
                                                                </div>
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setAgentMode('plan');
                                                                    setIsAgentModeMenuOpen(false);
                                                                }}
                                                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl ${agentMode === 'plan'
                                                                    ? 'bg-brand-50 text-brand-600'
                                                                    : 'hover:bg-slate-50 text-slate-600'
                                                                    } transition-colors text-left`}
                                                            >
                                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                                        <line x1="9" y1="9" x2="15" y2="9"></line>
                                                                        <line x1="9" y1="15" x2="15" y2="15"></line>
                                                                    </svg>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium">Plan</div>
                                                                    <div className="text-xs text-slate-400">规划模式</div>
                                                                </div>
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setAgentMode('explore');
                                                                    setIsAgentModeMenuOpen(false);
                                                                }}
                                                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl ${agentMode === 'explore'
                                                                    ? 'bg-brand-50 text-brand-600'
                                                                    : 'hover:bg-slate-50 text-slate-600'
                                                                    } transition-colors text-left`}
                                                            >
                                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <circle cx="11" cy="11" r="8"></circle>
                                                                        <path d="m21 21-4.35-4.35"></path>
                                                                    </svg>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium">Explore</div>
                                                                    <div className="text-xs text-slate-400">探索模式</div>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="h-4 w-[1px] bg-slate-200 mx-1" />

                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsDataSourceMenuOpen(!isDataSourceMenuOpen);
                                            }}
                                            className={`transition-colors flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg ${isDataSourceMenuOpen ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <Puzzle size={18} />
                                            <span>连接器</span>
                                        </button>

                                        <AnimatePresence>
                                            {isDataSourceMenuOpen && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-30"
                                                        onClick={() => setIsDataSourceMenuOpen(false)}
                                                    />
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                                        className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-40 overflow-hidden"
                                                    >
                                                        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                            已启用的连接器与数据源
                                                        </div>

                                                        <div className="space-y-1 mt-1">
                                                            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                                        <Globe size={16} />
                                                                    </div>
                                                                    <span className="text-sm font-medium text-slate-700">网页搜索</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => setDataSources(prev => ({ ...prev, webSearch: !prev.webSearch }))}
                                                                    className={`w-10 h-5 rounded-full transition-colors relative ${dataSources.webSearch ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                                                >
                                                                    <motion.div
                                                                        animate={{ x: dataSources.webSearch ? 22 : 2 }}
                                                                        className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                                                                    />
                                                                </button>
                                                            </div>

                                                            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
                                                                        <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-4 h-4" alt="Drive" />
                                                                    </div>
                                                                    <span className="text-sm font-medium text-slate-700">Google 云端硬盘</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => setDataSources(prev => ({ ...prev, googleDrive: !prev.googleDrive }))}
                                                                    className={`w-10 h-5 rounded-full transition-colors relative ${dataSources.googleDrive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                                                >
                                                                    <motion.div
                                                                        animate={{ x: dataSources.googleDrive ? 22 : 2 }}
                                                                        className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                                                                    />
                                                                </button>
                                                            </div>

                                                        </div>

                                                        <div className="h-[1px] bg-slate-100 my-2" />

                                                        <div className="space-y-1">
                                                            <button
                                                                onClick={() => {
                                                                    setIsAddConnectorModalOpen(true);
                                                                    setIsDataSourceMenuOpen(false);
                                                                }}
                                                                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                                                            >
                                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
                                                                    <Plus size={16} />
                                                                </div>
                                                                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">添加连接器</span>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <button
                                    onClick={isExecuting ? handleAbort : handleSend}
                                    disabled={!isExecuting && !inputText.trim()}
                                    className={`${isExecuting ? 'bg-orange-500 hover:bg-orange-600 animate-pulse' : 'bg-brand-600 hover:bg-brand-500 active:scale-95 shadow-lg shadow-brand-500/20'} p-2 rounded-xl text-white transition-all`}
                                    title={isExecuting ? "停止执行" : "发送消息"}
                                >
                                    {isExecuting ? <Square size={18} fill="currentColor" /> : <Send size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <AnimatePresence>
                {isConsoleOpen && (
                    <AgentConsole
                        isOpen={isConsoleOpen}
                        onClose={() => setIsConsoleOpen(false)}
                        todos={todos}
                        files={generatedFiles}
                        logs={sessionLogs}
                        currentSessionId={currentSessionId || undefined}
                        onLogsUpdate={(updated) => setSessionLogs(updated)}
                        onTodosUpdate={(updated) => setTodos(updated)}
                    />
                )}
            </AnimatePresence>

            <AddConnectorModal
                isOpen={isAddConnectorModalOpen}
                onClose={() => setIsAddConnectorModalOpen(false)}
            />
        </div>
    );
};

export default ChatArea;
