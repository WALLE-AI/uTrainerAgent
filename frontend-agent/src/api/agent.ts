import { apiClient } from './client';
import type {
    AgentExecuteRequest,
    SSEEventType,
    SSEEventData,
    AgentConfig
} from './types';

// ============ SSE 事件处理器类型 ============
export type SSEEventHandler<T extends SSEEventType = SSEEventType> = (
    data: SSEEventData[T]
) => void;

export type SSEEventHandlers = Partial<{
    [K in SSEEventType]: SSEEventHandler<K>;
}>;

// ============ 智能体模式定义 ============

/**
 * 智能体运行模式
 * - primary: 主智能体，响应用户界面选择的模型
 * - subagent: 子智能体，使用自己的模型回退链
 * - all: 两种模式都可用
 */
export type AgentMode = 'primary' | 'subagent' | 'all';

/**
 * 智能体分类
 */
export type AgentCategory =
    | 'orchestrator'   // 编排器 (Sisyphus, Atlas)
    | 'worker'         // 执行者 (Hephaestus, Build)
    | 'planner'        // 规划器 (Prometheus, Metis, Plan)
    | 'researcher'     // 研究者 (Librarian, Explore)
    | 'advisor'        // 顾问 (Oracle, Momus)
    | 'utility';       // 工具 (Title, Summary, Compaction)

/**
 * 成本分类
 */
export type AgentCost = 'free' | 'cheap' | 'expensive';

/**
 * 完整的智能体配置
 */
export interface FullAgentConfig extends AgentConfig {
    mode: AgentMode;
    category: AgentCategory;
    cost: AgentCost;
    color?: string;
    hidden?: boolean;
    native?: boolean;           // 是否内置
    temperature?: number;
    maxTokens?: number;
    thinking?: {
        type: 'enabled' | 'disabled';
        budgetTokens?: number;
    };
    reasoningEffort?: 'low' | 'medium' | 'high';
    toolRestrictions?: {
        denied: string[];
        allowed?: string[];
    };
    triggers?: {
        domain: string;
        trigger: string;
    }[];
    useWhen?: string[];
    avoidWhen?: string[];
}

// ============ 委托任务类型 ============

/**
 * 委托任务分类（用于智能体编排）
 */
export type DelegationCategory =
    | 'quick'             // 快速简单任务
    | 'visual-engineering' // 前端/UI 任务
    | 'ultrabrain'        // 复杂深度任务
    | 'research'          // 研究探索任务
    | 'documentation'     // 文档生成任务
    | 'testing'           // 测试验证任务
    | 'custom';           // 自定义分类

/**
 * 委托任务请求
 */
export interface DelegateTaskRequest {
    // 二选一：category 或 subagentType
    category?: DelegationCategory;
    subagentType?: string;          // explore, librarian, oracle 等

    prompt: string;                  // 任务 Prompt (6段式结构)
    loadSkills?: string[];           // 加载的技能
    runInBackground?: boolean;       // 是否后台运行
    sessionId?: string;              // 继续已有会话 (关键！节省 70% token)

    // 高级选项
    parentSessionId?: string;        // 父会话 ID
    timeout?: number;                // 超时时间 (毫秒)
}

/**
 * 委托任务响应
 */
export interface DelegateTaskResponse {
    taskId: string;
    sessionId: string;               // 重要！用于后续 session_id 继续
    status: 'queued' | 'running' | 'completed' | 'error';
    result?: string;
    error?: string;
}

// ============ 工作计划类型 ============

/**
 * 工作计划（Prometheus 生成）
 */
export interface WorkPlan {
    id: string;
    name: string;
    path: string;                    // .sisyphus/plans/{name}.md
    goal: string;
    tasks: WorkPlanTask[];
    parallelGroups: string[][];      // 可并行的任务组
    sequentialDeps: Record<string, string[]>; // 顺序依赖
    status: 'draft' | 'approved' | 'in_progress' | 'completed';
    createdAt: string;
    updatedAt: string;
}

/**
 * 工作计划任务
 */
export interface WorkPlanTask {
    id: string;
    content: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';
    category?: DelegationCategory;
    skills?: string[];
    parallelWith?: string[];         // 可并行的其他任务 ID
    dependsOn?: string[];            // 依赖的任务 ID
    assignedAgent?: string;
    result?: string;
    error?: string;
}

// ============ 笔记本系统 (累积智慧) ============

/**
 * 笔记本条目（用于智能体间知识传递）
 */
export interface NotepadEntry {
    id: string;
    planName: string;
    category: 'learnings' | 'decisions' | 'issues' | 'problems';
    content: string;
    taskId?: string;
    createdAt: string;
}

// ============ 智能体执行服务 (优化版) ============
export const agentService = {
    /**
     * 启动智能体执行 (SSE 流式响应)
     */
    execute(
        request: AgentExecuteRequest,
        handlers: SSEEventHandlers & {
            onError?: (error: Error) => void;
            onComplete?: () => void;
        }
    ) {
        // 自动注入本地 LLM 配置 (包含 api_key)
        const STORAGE_KEY = 'upapergen_llm_settings';
        const cachedSettings = localStorage.getItem(STORAGE_KEY);
        if (cachedSettings) {
            try {
                const llmConfig = JSON.parse(cachedSettings);
                request.llm_config = {
                    ...llmConfig,
                    ...request.llm_config
                };
            } catch (e) {
                console.error('Failed to parse cached LLM settings', e);
            }
        }

        return apiClient.createEventSource('/agent/execute', request, {
            onEvent: (event, data) => {
                const eventType = event as SSEEventType;
                const handler = handlers[eventType];
                if (handler) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (handler as (data: any) => void)(data);
                }
            },
            onError: handlers.onError,
            onComplete: handlers.onComplete,
        });
    },

    /**
     * 停止智能体执行
     */
    async stop(sessionId: string) {
        return apiClient.post<{ success: boolean }>(`/agent/${sessionId}/stop`);
    },

    /**
     * 重新执行
     */
    retry(
        sessionId: string,
        handlers: SSEEventHandlers & {
            onError?: (error: Error) => void;
            onComplete?: () => void;
        }
    ) {
        return apiClient.createEventSource(`/agent/${sessionId}/retry`, {}, {
            onEvent: (event, data) => {
                const eventType = event as SSEEventType;
                const handler = handlers[eventType];
                if (handler) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (handler as (data: any) => void)(data);
                }
            },
            onError: handlers.onError,
            onComplete: handlers.onComplete,
        });
    },

    // ============ 智能体管理 ============

    /**
     * 获取可用智能体列表
     */
    async listAgents(params?: {
        mode?: AgentMode;
        category?: AgentCategory;
        includeHidden?: boolean;
    }) {
        return apiClient.get<FullAgentConfig[]>('/agents', params as Record<string, string>);
    },

    /**
     * 获取智能体详情
     */
    async getAgent(name: string) {
        return apiClient.get<FullAgentConfig>(`/agents/${name}`);
    },

    /**
     * 获取默认智能体
     */
    async getDefaultAgent() {
        return apiClient.get<FullAgentConfig>('/agents/default');
    },

    /**
     * 创建/更新自定义智能体
     */
    async createAgent(config: Omit<FullAgentConfig, 'native'>) {
        return apiClient.post<FullAgentConfig>('/agents', config);
    },

    /**
     * 更新智能体配置
     */
    async updateAgent(name: string, config: Partial<FullAgentConfig>) {
        return apiClient.put<FullAgentConfig>(`/agents/${name}`, config);
    },

    /**
     * 禁用/启用智能体
     */
    async toggleAgent(name: string, enabled: boolean) {
        return apiClient.put<{ success: boolean }>(`/agents/${name}/toggle`, { enabled });
    },

    /**
     * 生成智能体配置（基于描述）
     */
    async generateAgent(description: string) {
        return apiClient.post<{
            identifier: string;
            whenToUse: string;
            systemPrompt: string;
        }>('/agents/generate', { description });
    },

    // ============ 任务委托 (核心编排功能) ============

    /**
     * 委托任务给子智能体
     * 这是多智能体编排的核心 API
     */
    async delegateTask(request: DelegateTaskRequest) {
        return apiClient.post<DelegateTaskResponse>('/agent/delegate', request);
    },

    /**
     * 续接委托会话 (使用 session_id)
     * 重要：可节省 70%+ token！
     */
    async continueSession(sessionId: string, prompt: string, options?: {
        loadSkills?: string[];
    }) {
        return apiClient.post<DelegateTaskResponse>('/agent/delegate', {
            sessionId,
            prompt,
            loadSkills: options?.loadSkills,
        });
    },

    /**
     * 批量委托任务（并行执行）
     */
    async delegateBatch(requests: DelegateTaskRequest[]) {
        return apiClient.post<DelegateTaskResponse[]>('/agent/delegate/batch', { tasks: requests });
    },

    // ============ 工作计划 (Prometheus 模式) ============

    /**
     * 创建工作计划
     */
    async createPlan(data: {
        name: string;
        goal: string;
        context?: string;
    }) {
        return apiClient.post<WorkPlan>('/agent/plans', data);
    },

    /**
     * 获取工作计划
     */
    async getPlan(planId: string) {
        return apiClient.get<WorkPlan>(`/agent/plans/${planId}`);
    },

    /**
     * 列出工作计划
     */
    async listPlans(params?: { status?: WorkPlan['status'] }) {
        return apiClient.get<WorkPlan[]>('/agent/plans', params);
    },

    /**
     * 审批工作计划
     */
    async approvePlan(planId: string, feedback?: string) {
        return apiClient.post<WorkPlan>(`/agent/plans/${planId}/approve`, { feedback });
    },

    /**
     * 执行工作计划（使用 Atlas 编排）
     */
    executePlan(
        planId: string,
        handlers: SSEEventHandlers & {
            onError?: (error: Error) => void;
            onComplete?: () => void;
        }
    ) {
        return apiClient.createEventSource(`/agent/plans/${planId}/execute`, {}, {
            onEvent: (event, data) => {
                const eventType = event as SSEEventType;
                const handler = handlers[eventType];
                if (handler) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (handler as (data: any) => void)(data);
                }
            },
            onError: handlers.onError,
            onComplete: handlers.onComplete,
        });
    },

    /**
     * 更新计划任务状态
     */
    async updatePlanTask(planId: string, taskId: string, data: Partial<WorkPlanTask>) {
        return apiClient.put<WorkPlanTask>(`/agent/plans/${planId}/tasks/${taskId}`, data);
    },

    // ============ 笔记本系统 (累积智慧) ============

    /**
     * 获取计划笔记本
     */
    async getNotepad(planName: string) {
        return apiClient.get<NotepadEntry[]>(`/agent/notepads/${planName}`);
    },

    /**
     * 追加笔记本条目
     */
    async appendNotepad(planName: string, entry: {
        category: NotepadEntry['category'];
        content: string;
        taskId?: string;
    }) {
        return apiClient.post<NotepadEntry>(`/agent/notepads/${planName}`, entry);
    },

    // ============ 验证与诊断 ============

    /**
     * 获取 LSP 诊断
     */
    async getDiagnostics(filePath: string) {
        return apiClient.post<{
            path: string;
            errors: number;
            warnings: number;
            diagnostics: Array<{
                line: number;
                column: number;
                severity: 'error' | 'warning' | 'info';
                message: string;
            }>;
        }>('/agent/diagnostics', { filePath });
    },

    /**
     * 项目级别验证
     */
    async verifyProject(options?: {
        runBuild?: boolean;
        runTests?: boolean;
        runLint?: boolean;
    }) {
        return apiClient.post<{
            success: boolean;
            buildResult?: { exitCode: number; output: string };
            testResult?: { passed: number; failed: number; output: string };
            lintResult?: { errors: number; warnings: number };
        }>('/agent/verify', options);
    },

    // ============ Oracle 咨询 ============

    /**
     * 咨询 Oracle（只读顾问）
     * 用于架构决策、调试帮助、代码审查
     */
    async consultOracle(request: {
        question: string;
        context?: string;
        files?: string[];
    }) {
        return apiClient.post<{
            bottomLine: string;        // 2-3 句核心建议
            actionPlan: string[];      // 实施步骤
            effortEstimate: 'quick' | 'short' | 'medium' | 'large';
            reasoning?: string;        // 推理过程
            risks?: string[];          // 风险提示
            escalationTriggers?: string[]; // 升级条件
        }>('/agent/oracle/consult', request);
    },

    // ============ 委托分类 ============

    /**
     * 获取可用委托分类
     */
    async getCategories() {
        return apiClient.get<{
            name: DelegationCategory;
            description: string;
            temperature: number;
            defaultSkills: string[];
        }[]>('/agent/categories');
    },

    /**
     * 创建/更新自定义分类
     */
    async createCategory(config: {
        name: string;
        description: string;
        temperature?: number;
        defaultSkills?: string[];
    }) {
        return apiClient.post<{ success: boolean }>('/agent/categories', config);
    },
};

// ============ 使用示例 ============
/*
import { agentService } from '@/api/agent';

// ========= 示例 1: 基本执行 =========
const { abort } = agentService.execute(
  {
    message: '帮我分析这份数据',
    agentConfig: { agent: 'sisyphus' },
  },
  {
    'thinking.chunk': (data) => console.log('思考:', data.content),
    'content.chunk': (data) => console.log('内容:', data.content),
    'done': () => console.log('完成'),
  }
);

// ========= 示例 2: 任务委托 (编排模式) =========
// 第一次委托
const result1 = await agentService.delegateTask({
  category: 'research',
  prompt: `
    ## 1. TASK
    搜索项目中的认证实现

    ## 2. EXPECTED OUTCOME
    - 找到所有认证相关文件
    - 理解当前认证模式

    ## 3. REQUIRED TOOLS
    - grep, glob, read

    ## 4. MUST DO
    - 搜索 auth*, login*, session* 相关文件
    - 阅读核心认证逻辑

    ## 5. MUST NOT DO
    - 不要修改任何文件

    ## 6. CONTEXT
    - 项目使用 TypeScript + Express
  `,
  loadSkills: ['skill-code-analysis'],
  runInBackground: true,
});

// 续接会话 (节省 70% token!)
const result2 = await agentService.continueSession(
  result1.data.sessionId,
  '基于你的发现，总结认证流程并建议改进方案'
);

// ========= 示例 3: 工作计划执行 =========
// 创建计划
const plan = await agentService.createPlan({
  name: 'add-oauth',
  goal: '为项目添加 OAuth 登录功能',
  context: '当前使用 JWT 认证，需要添加 Google/GitHub OAuth',
});

// 审批计划
await agentService.approvePlan(plan.data.id);

// 执行计划 (Atlas 编排)
agentService.executePlan(plan.data.id, {
  'task.start': (data) => console.log('开始任务:', data.title),
  'task.end': (data) => console.log('完成任务:', data.result),
  'done': () => console.log('计划执行完成'),
});

// ========= 示例 4: Oracle 咨询 =========
const advice = await agentService.consultOracle({
  question: '如何设计一个可扩展的插件系统？',
  context: '当前项目使用 TypeScript，需要支持第三方扩展',
  files: ['src/core/index.ts', 'src/plugins/base.ts'],
});
console.log('建议:', advice.data.bottomLine);
console.log('步骤:', advice.data.actionPlan);
*/
