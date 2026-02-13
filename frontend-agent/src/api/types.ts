// ============ 用户相关类型 ============
export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    bio?: string;
    role: 'free' | 'pro' | 'enterprise';
    settings?: any;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
}

// ============ 会话相关类型 ============
export interface Session {
    id: string;
    userId: string;
    title: string;
    parentId?: string;
    status: 'active' | 'completed' | 'failed';
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    sessionId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    thinkingContent?: string;
    plan?: TaskPlan;
    toolCalls?: ToolCall[];
    artifacts?: Artifact[];
    createdAt: string;
}

// ============ 任务规划类型 ============
export interface Todo {
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    order: number;
    dependency?: string;
    result?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TaskPlan {
    goal: string;
    todos: Todo[];
    progress: number;
}

// ============ 工具调用类型 ============
export interface ToolCall {
    id: string;
    name: string;
    args: Record<string, unknown>;
    result?: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    duration?: number;
}

// ============ 产物类型 ============
export interface Artifact {
    id: string;
    type: 'document' | 'code' | 'image' | 'chart' | 'table' | 'file';
    name: string;
    content?: string;
    url?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
}

// ============ 后台任务类型 ============
export interface BackgroundTask {
    id: string;
    sessionId: string;
    description: string;
    agent: string;
    status: 'pending' | 'running' | 'completed' | 'error' | 'cancelled';
    progress?: {
        lastTool?: string;
        lastMessage?: string;
    };
    queuedAt?: string;
    startedAt?: string;
    completedAt?: string;
}

// ============ 文件类型 ============
export interface FileInfo {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    sessionId?: string;
    createdAt: string;
}

export interface PreviewData {
    type: 'image' | 'pdf' | 'text' | 'markdown' | 'csv' | 'office';
    content: string;
    url?: string;
    pages?: number;
    thumbnail?: string;
}

// ============ 连接器类型 ============
export interface ConnectorInfo {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'database' | 'cloud' | 'docs' | 'custom';
    authType: 'oauth' | 'apikey' | 'credentials';
}

export interface ConfiguredConnector {
    id: string;
    connectorId: string;
    name: string;
    status: 'connected' | 'disconnected' | 'error';
    createdAt: string;
}

// ============ 智能体类型 ============
export interface AgentConfig {
    name: string;
    description: string;
    mode: 'primary' | 'subagent' | 'all';
    model?: { providerID: string; modelID: string };
    color?: string;
    hidden?: boolean;
}


// ============ 使用统计类型 ============
export interface UsageStats {
    papers: number;
    downloads: number;
    shares: number;
    tokensUsed: number;
    sessionsCount: number;
}

export interface Activity {
    id: string;
    action: string;
    target: string;
    createdAt: string;
}

// ============ SSE 事件类型 ============
export type SSEEventType =
    // 会话事件
    | 'session.created'
    | 'session.updated'
    | 'session.resumed'              // 会话续接 (使用 session_id)
    // 思考事件
    | 'thinking.start'
    | 'thinking.chunk'
    | 'thinking.end'
    // 规划事件
    | 'planning.start'
    | 'planning.todo.created'
    | 'planning.todo.updated'        // 任务状态更新
    | 'planning.end'
    // 任务事件
    | 'task.start'
    | 'task.progress'
    | 'task.end'
    // 工具事件
    | 'tool.start'
    | 'tool.result'
    | 'tool.error'
    // 后台任务事件 (并行执行)
    | 'background.launched'
    | 'background.progress'
    | 'background.completed'
    | 'background.error'
    // 沙盒事件
    | 'sandbox.start'
    | 'sandbox.output'
    | 'sandbox.result'
    // 产物事件
    | 'artifact.generating'
    | 'artifact.created'
    // 内容事件
    | 'content.chunk'
    // ========== 多智能体编排事件 ==========
    | 'agent.delegation'             // 任务委托给子智能体
    | 'agent.delegation.start'       // 委托开始
    | 'agent.delegation.result'      // 委托结果返回
    | 'agent.handoff'                // 智能体切换
    | 'agent.session.continue'       // 会话续接 (关键！)
    | 'agent.verification'           // 验证结果
    // 笔记本事件 (累积智慧)
    | 'notepad.read'                 // 读取笔记本
    | 'notepad.append'               // 追加笔记
    // Oracle 咨询事件
    | 'oracle.consult'               // 咨询 Oracle
    | 'oracle.response'              // Oracle 响应
    // 工作计划事件
    | 'plan.created'                 // 计划创建
    | 'plan.approved'                // 计划批准
    | 'plan.task.start'              // 计划任务开始
    | 'plan.task.end'                // 计划任务完成
    | 'plan.completed'               // 计划执行完成
    // 结束事件
    | 'done'
    | 'error';

// ============ SSE 事件数据类型 ============
export interface SSEEventData {
    'session.created': { sessionId: string; title: string };
    'session.updated': { sessionId: string; status: string };
    'session.resumed': {
        sessionId: string;
        previousSessionId: string;
        tokensSaved: number;          // 节省的 token (通过续接)
    };
    'thinking.start': { agentId: string; agentName?: string };
    'thinking.chunk': { content: string };
    'thinking.end': { summary: string };
    'planning.start': Record<string, never>;
    'planning.todo.created': { todo: Todo };
    'planning.todo.updated': {
        todoId: string;
        status: Todo['status'];
        result?: string;
    };
    'planning.end': { plan: TaskPlan };
    'task.start': { taskId: string; title: string; order: number };
    'task.progress': { taskId: string; progress: number };
    'task.end': { taskId: string; result: string; status: string };
    'tool.start': { toolName: string; args: Record<string, unknown> };
    'tool.result': { toolName: string; result: string; duration: number };
    'tool.error': { toolName: string; error: string };
    // 后台任务
    'background.launched': {
        taskId: string;
        sessionId: string;            // 重要！用于 session_id 续接
        agent: string;
        description: string;
        category?: string;
        skills?: string[];
    };
    'background.progress': { taskId: string; lastTool?: string; lastMessage?: string };
    'background.completed': { taskId: string; sessionId: string; result: string };
    'background.error': { taskId: string; error: string };
    // 沙盒
    'sandbox.start': { language: string; code: string };
    'sandbox.output': { output: string };
    'sandbox.result': { success: boolean; result: string };
    // 产物
    'artifact.generating': { type: string; name: string };
    'artifact.created': { artifact: Artifact };
    // 内容
    'content.chunk': { content: string };
    // ========== 多智能体编排 ==========
    'agent.delegation': {
        from: string;
        to: string;
        category?: string;
        skills?: string[];
        prompt: string;               // 6 段式 Prompt
    };
    'agent.delegation.start': {
        delegationId: string;
        from: string;
        to: string;
        category?: string;
        skills?: string[];
        runInBackground: boolean;
    };
    'agent.delegation.result': {
        delegationId: string;
        sessionId: string;            // 重要！用于续接
        success: boolean;
        result?: string;
        error?: string;
    };
    'agent.handoff': { from: string; to: string; reason: string };
    'agent.session.continue': {
        sessionId: string;            // 被续接的会话
        prompt: string;
        previousTurns: number;        // 之前的对话轮次
    };
    'agent.verification': {
        type: 'diagnostics' | 'build' | 'test' | 'manual';
        success: boolean;
        details: {
            errors?: number;
            warnings?: number;
            exitCode?: number;
            passed?: number;
            failed?: number;
            message?: string;
        };
    };
    // 笔记本
    'notepad.read': {
        planName: string;
        category: 'learnings' | 'decisions' | 'issues' | 'problems';
        content: string;
    };
    'notepad.append': {
        planName: string;
        category: 'learnings' | 'decisions' | 'issues' | 'problems';
        content: string;
        taskId?: string;
    };
    // Oracle 咨询
    'oracle.consult': {
        question: string;
        context?: string;
    };
    'oracle.response': {
        bottomLine: string;
        actionPlan: string[];
        effortEstimate: 'quick' | 'short' | 'medium' | 'large';
        reasoning?: string;
    };
    // 工作计划
    'plan.created': {
        planId: string;
        name: string;
        path: string;
        taskCount: number;
    };
    'plan.approved': {
        planId: string;
        feedback?: string;
    };
    'plan.task.start': {
        planId: string;
        taskId: string;
        content: string;
        category?: string;
        skills?: string[];
    };
    'plan.task.end': {
        planId: string;
        taskId: string;
        success: boolean;
        result?: string;
        error?: string;
    };
    'plan.completed': {
        planId: string;
        completed: number;
        failed: number;
        filesModified: string[];
        wisdom: string[];             // 累积智慧
    };
    // 结束
    'done': { sessionId: string; messageId: string };
    'error': { code: string; message: string };
}


// ============ 请求类型 ============
export interface AgentExecuteRequest {
    sessionId?: string;              // 继续已有会话 (关键！节省 token)
    message: string;
    files?: string[];
    dataSources?: {
        webSearch: boolean;
        connectors: string[];
    };
    agentConfig?: {
        // 智能体类型 (扩展)
        agent:
        | 'build'      // 默认构建智能体
        | 'plan'       // 规划模式 (只规划不执行)
        | 'sisyphus'   // 编排智能体 (推荐，自动委托)
        | 'atlas'      // 工作计划执行器
        | 'hephaestus' // 深度自主执行
        | 'prometheus' // 战略规划
        | 'research';  // 研究模式

        // 执行模式
        mode?:
        | 'single'       // 单智能体执行
        | 'orchestrator' // 多智能体编排
        | 'autonomous';  // 深度自主 (Hephaestus)

        // 执行约束
        maxIterations?: number;      // 最大迭代次数
        maxTokens?: number;          // 最大输出 token
        temperature?: number;        // 温度参数
        thinking?: boolean;          // 是否启用深度思考
        thinkingBudget?: number;     // 思考 token 预算 (默认 32000)
    };

    /**
     * 加载的技能 ID 列表
     * 被注入到智能体上下文，可在执行过程中调用
     */
    loadSkills?: string[];

    /**
     * 工作计划路径 (Atlas 模式)
     * 如果提供，将使用 Atlas 编排执行整个计划
     */
    planPath?: string;

    /**
     * 验证选项
     */
    verification?: {
        runDiagnostics?: boolean;    // 运行 LSP 诊断
        runBuild?: boolean;          // 运行构建命令
        runTests?: boolean;          // 运行测试
    };

    /**
     * 运行时 LLM 配置 (包含 api_key 等)
     */
    llm_config?: Record<string, any>;

    /**
     * 运行时模型名称
     */
    model?: string;
}

export interface BackgroundLaunchRequest {
    description: string;
    prompt: string;

    // 二选一：subagentType 或 category
    subagentType?: 'explore' | 'librarian' | 'oracle' | 'multimodal-looker';
    category?: 'quick' | 'visual-engineering' | 'ultrabrain' | 'research' | 'documentation' | 'testing';

    parentSessionId: string;

    /**
     * 加载的技能 ID 列表
     */
    loadSkills?: string[];

    /**
     * 6 段式 Prompt 结构 (推荐)
     * 如果使用结构化 prompt，会自动格式化
     */
    structuredPrompt?: {
        task: string;                    // 1. 任务描述
        expectedOutcome: string[];       // 2. 预期结果
        requiredTools?: string[];        // 3. 所需工具
        mustDo: string[];                // 4. 必须做
        mustNotDo: string[];             // 5. 禁止做
        context?: string;                // 6. 上下文
    };
}

// ============ 智能体权限类型 ============
export interface AgentPermission {
    permission: string;              // 工具名或 '*'
    action: 'allow' | 'deny' | 'ask';
    pattern: string;                 // 匹配模式
}

// ============ 多智能体编排事件 ============
export interface OrchestrationEvent {
    type: 'delegation' | 'handoff' | 'verification' | 'notepad';
    from: string;
    to?: string;
    data: {
        prompt?: string;
        sessionId?: string;
        result?: string;
        category?: string;
        skills?: string[];
    };
    timestamp: string;
}

