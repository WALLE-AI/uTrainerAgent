import { apiClient } from './client';

// ============ 技能作用域 ============
export type SkillScope =
    | 'builtin'          // 内置技能
    | 'user'             // 用户级技能 (~/.opencode/skills/)
    | 'project'          // 项目级技能 (.opencode/skills/)
    | 'plugin'           // 插件提供的技能
    | 'config';          // 配置文件定义的技能

// ============ 技能分类 ============
export type SkillCategory =
    | 'research'        // 研究探索
    | 'writing'         // 文档写作
    | 'data'            // 数据处理
    | 'code'            // 代码相关
    | 'design'          // 设计相关
    | 'testing'         // 测试验证
    | 'devops'          // 运维部署
    | 'browser'         // 浏览器自动化
    | 'git'             // Git 操作
    | 'custom';         // 自定义

// ============ 技能元数据 ============
export interface SkillMetadata {
    license?: string;                    // 许可证
    compatibility?: string;              // 兼容性要求
    version?: string;                    // 版本
    author?: string;                     // 作者
    argumentHint?: string;               // 参数提示
    subtask?: boolean;                   // 是否子任务技能
    model?: string;                      // 推荐模型
    [key: string]: string | boolean | undefined;
}

// ============ MCP 相关类型 ============
export interface McpServerConfig {
    command: string;                     // 启动命令
    args?: string[];                     // 命令参数
    env?: Record<string, string>;        // 环境变量
    timeout?: number;                    // 超时时间 (ms)
}

export interface McpTool {
    name: string;
    description?: string;
    inputSchema: Record<string, unknown>;
}

export interface McpResource {
    uri: string;
    name?: string;
    mimeType?: string;
}

export interface McpPrompt {
    name: string;
    description?: string;
    arguments?: {
        name: string;
        description?: string;
        required?: boolean;
    }[];
}

export interface McpCapabilities {
    tools: McpTool[];
    resources: McpResource[];
    prompts: McpPrompt[];
}

// ============ 技能定义 ============
export interface Skill {
    id: string;
    name: string;
    description: string;
    icon?: string;
    category: SkillCategory;
    tags: string[];

    // 作用域与来源
    scope: SkillScope;
    location?: string;                   // 技能文件路径

    // 智能体限制
    agent?: string;                      // 限定使用的智能体
    allowedTools?: string[];             // 允许使用的工具列表

    // MCP 配置
    mcpServers?: Record<string, McpServerConfig>;

    // 元数据
    metadata?: SkillMetadata;

    // 状态
    isInstalled: boolean;
    isBuiltin: boolean;
    downloads?: number;
    rating?: number;

    // 时间戳
    createdAt: string;
    updatedAt: string;
}

// ============ 技能配置 ============
export interface SkillConfig {
    inputs?: SkillInput[];
    outputs?: SkillOutput[];
    settings?: SkillSetting[];
}

export interface SkillInput {
    name: string;
    type: 'text' | 'file' | 'select' | 'number' | 'boolean';
    label: string;
    description?: string;
    required?: boolean;
    options?: { label: string; value: string }[];
    default?: unknown;
}

export interface SkillOutput {
    name: string;
    type: 'text' | 'file' | 'json' | 'markdown' | 'html';
    label: string;
}

export interface SkillSetting {
    name: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    label: string;
    description?: string;
    default?: unknown;
    options?: { label: string; value: string }[];
}

// ============ 技能执行 ============
export interface SkillExecution {
    id: string;
    skillId: string;
    sessionId: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    inputs: Record<string, unknown>;
    outputs?: Record<string, unknown>;
    error?: string;
    startedAt: string;
    completedAt?: string;
}

// ============ 技能指令内容 ============
export interface SkillInstruction {
    skillId: string;
    name: string;

    /**
     * 系统指令模板
     * 注入到智能体的系统提示中，提供专业领域知识
     */
    systemPrompt: string;

    /**
     * 基础目录
     * 技能所在目录，用于解析相对路径
     */
    baseDirectory: string;

    /**
     * 工具定义
     * 技能提供的工具
     */
    toolDefinitions?: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    }[];

    /**
     * 使用示例
     */
    examples?: {
        input: string;
        output: string;
    }[];
}

// ============ 技能中心服务 ============
export const skillService = {
    // ========== 基础 CRUD ==========

    /**
     * 获取所有技能列表
     */
    async list(params?: {
        category?: SkillCategory;
        scope?: SkillScope;
        search?: string;
        installed?: boolean;
        mcpEnabled?: boolean;           // 只返回有 MCP 服务器的技能
        agent?: string;                 // 只返回指定智能体可用的技能
        page?: number;
        limit?: number;
    }) {
        return apiClient.get<{
            items: Skill[];
            total: number;
            page: number;
            limit: number;
        }>('/skills', params as Record<string, string | number | boolean>);
    },

    /**
     * 获取技能详情
     */
    async get(skillId: string) {
        return apiClient.get<Skill>(`/skills/${skillId}`);
    },

    /**
     * 安装技能
     */
    async install(skillId: string) {
        return apiClient.post<{ success: boolean }>(`/skills/${skillId}/install`);
    },

    /**
     * 卸载技能
     */
    async uninstall(skillId: string) {
        return apiClient.post<{ success: boolean }>(`/skills/${skillId}/uninstall`);
    },

    /**
     * 获取已安装的技能
     */
    async listInstalled() {
        return apiClient.get<Skill[]>('/skills/installed');
    },

    /**
     * 按作用域获取技能
     */
    async listByScope(scope: SkillScope) {
        return apiClient.get<Skill[]>(`/skills/scope/${scope}`);
    },

    // ========== 技能执行 ==========

    /**
     * 执行技能
     */
    async execute(
        skillId: string,
        data: {
            sessionId?: string;
            inputs: Record<string, unknown>;
            settings?: Record<string, unknown>;
        }
    ) {
        return apiClient.post<SkillExecution>(`/skills/${skillId}/execute`, data);
    },

    /**
     * 获取技能执行状态
     */
    async getExecution(executionId: string) {
        return apiClient.get<SkillExecution>(`/skills/executions/${executionId}`);
    },

    // ========== 技能指令 (核心!) ==========

    /**
     * 获取技能的指令内容
     * 用于智能体上下文注入
     */
    async getInstruction(skillId: string) {
        return apiClient.get<SkillInstruction>(`/skills/${skillId}/instruction`);
    },

    /**
     * 批量获取技能指令
     * 用于智能体执行时一次性加载多个技能
     */
    async batchGetInstructions(skillIds: string[]) {
        return apiClient.post<SkillInstruction[]>('/skills/instructions/batch', { skillIds });
    },

    /**
     * 解析技能内容 (异步)
     * 支持懒加载的技能内容解析
     */
    async resolveContent(skillId: string, options?: {
        gitMasterConfig?: {
            commitFooter?: boolean;
            includeCoAuthoredBy?: boolean;
        };
    }) {
        return apiClient.post<{ content: string }>(`/skills/${skillId}/resolve`, options);
    },

    /**
     * 批量解析技能内容
     */
    async batchResolveContent(skillIds: string[], options?: {
        gitMasterConfig?: {
            commitFooter?: boolean;
            includeCoAuthoredBy?: boolean;
        };
    }) {
        return apiClient.post<{
            resolved: Record<string, string>;  // skillId -> content
            notFound: string[];
        }>('/skills/resolve/batch', { skillIds, options });
    },

    // ========== MCP 集成 ==========

    /**
     * 获取技能的 MCP 能力
     * 列出技能提供的工具、资源、提示词
     */
    async getMcpCapabilities(skillId: string, serverName?: string) {
        const endpoint = serverName
            ? `/skills/${skillId}/mcp/${serverName}/capabilities`
            : `/skills/${skillId}/mcp/capabilities`;
        return apiClient.get<McpCapabilities>(endpoint);
    },

    /**
     * 执行 MCP 工具
     */
    async executeMcpTool(
        skillId: string,
        serverName: string,
        toolName: string,
        args: Record<string, unknown>
    ) {
        return apiClient.post<{
            success: boolean;
            result?: unknown;
            error?: string;
        }>(`/skills/${skillId}/mcp/${serverName}/tools/${toolName}`, { args });
    },

    /**
     * 读取 MCP 资源
     */
    async readMcpResource(skillId: string, serverName: string, uri: string) {
        return apiClient.post<{
            contents: {
                uri: string;
                mimeType?: string;
                text?: string;
                blob?: string;  // base64
            }[];
        }>(`/skills/${skillId}/mcp/${serverName}/resources/read`, { uri });
    },

    /**
     * 获取 MCP 提示词
     */
    async getMcpPrompt(
        skillId: string,
        serverName: string,
        promptName: string,
        args?: Record<string, string>
    ) {
        return apiClient.post<{
            messages: {
                role: 'user' | 'assistant';
                content: { type: 'text'; text: string }[];
            }[];
        }>(`/skills/${skillId}/mcp/${serverName}/prompts/${promptName}`, { args });
    },

    // ========== 分类与发现 ==========

    /**
     * 获取技能分类
     */
    async getCategories() {
        return apiClient.get<{
            id: SkillCategory;
            name: string;
            description: string;
            count: number;
        }[]>('/skills/categories');
    },

    /**
     * 获取推荐技能
     */
    async getRecommended() {
        return apiClient.get<Skill[]>('/skills/recommended');
    },

    /**
     * 获取热门技能
     */
    async getPopular(params?: { limit?: number }) {
        return apiClient.get<Skill[]>('/skills/popular', params);
    },

    /**
     * 按领域搜索技能
     * 使用语义匹配找到相关技能
     */
    async searchByDomain(domain: string) {
        return apiClient.get<Skill[]>('/skills/search/domain', { domain });
    },

    // ========== 技能管理 ==========

    /**
     * 更新技能设置
     */
    async updateSettings(skillId: string, settings: Record<string, unknown>) {
        return apiClient.put<{ success: boolean }>(`/skills/${skillId}/settings`, { settings });
    },

    /**
     * 创建自定义技能
     */
    async create(data: {
        name: string;
        description: string;
        category: SkillCategory;
        tags?: string[];
        config?: SkillConfig;
        template: string;                // 指令模板
        allowedTools?: string[];
        agent?: string;
    }) {
        return apiClient.post<Skill>('/skills', data);
    },

    /**
     * 更新自定义技能
     */
    async update(skillId: string, data: Partial<{
        name: string;
        description: string;
        category: SkillCategory;
        tags: string[];
        config: SkillConfig;
        template: string;
        allowedTools: string[];
        agent: string;
    }>) {
        return apiClient.put<Skill>(`/skills/${skillId}`, data);
    },

    /**
     * 删除自定义技能
     */
    async delete(skillId: string) {
        return apiClient.delete<{ success: boolean }>(`/skills/${skillId}`);
    },

    // ========== 智能体集成 ==========

    /**
     * 获取智能体可用的技能列表
     * 返回已安装且适用于指定智能体的技能
     */
    async getAgentSkills(agentName: string) {
        return apiClient.get<Skill[]>(`/agents/${agentName}/skills`);
    },

    /**
     * 设置智能体默认加载的技能
     */
    async setAgentDefaultSkills(agentName: string, skillIds: string[]) {
        return apiClient.put<{ success: boolean }>(`/agents/${agentName}/skills`, { skillIds });
    },

    /**
     * 验证技能是否对智能体可用
     */
    async validateForAgent(skillId: string, agentName: string) {
        return apiClient.get<{
            valid: boolean;
            reason?: string;
        }>(`/skills/${skillId}/validate`, { agent: agentName });
    },

    // ========== 缓存管理 ==========

    /**
     * 清除技能缓存
     * 强制重新发现所有技能
     */
    async clearCache() {
        return apiClient.post<{ success: boolean }>('/skills/cache/clear');
    },

    /**
     * 刷新技能列表
     * 重新扫描所有技能目录
     */
    async refresh() {
        return apiClient.post<{
            added: string[];
            removed: string[];
            updated: string[];
        }>('/skills/refresh');
    },
};
