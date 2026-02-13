import { apiClient, type PaginatedResponse } from './client';

// ============ 记忆管理类型定义 ============

/**
 * 记忆类型
 */
export type MemoryType =
    | 'fact'              // 事实记忆（用户偏好、项目信息等）
    | 'episode'           // 情景记忆（历史会话摘要）
    | 'procedure'         // 程序记忆（操作步骤、工作流程）
    | 'semantic'          // 语义记忆（概念、知识）
    | 'preference'        // 偏好记忆（用户习惯）
    | 'constraint';       // 约束记忆（禁止事项）

/**
 * 记忆条目
 */
export interface MemoryEntry {
    id: string;
    type: MemoryType;
    content: string;
    summary?: string;                  // 简短摘要
    keywords: string[];                // 关键词（用于检索）
    source: {
        type: 'session' | 'user' | 'system' | 'import';
        sessionId?: string;
        messageId?: string;
    };
    embeddings?: number[];             // 向量嵌入（用于语义搜索）
    importance: number;                // 重要性分数 0-1
    accessCount: number;               // 访问次数
    lastAccessedAt?: string;
    createdAt: string;
    updatedAt: string;
    expiresAt?: string;                // 可选过期时间
}

/**
 * 记忆检索结果
 */
export interface MemorySearchResult {
    entry: MemoryEntry;
    score: number;                     // 相关性分数
    matchType: 'keyword' | 'semantic' | 'hybrid';
}

/**
 * 用户记忆档案
 */
export interface UserMemoryProfile {
    userId: string;
    totalMemories: number;
    memoryByType: Record<MemoryType, number>;
    recentMemories: MemoryEntry[];
    importantMemories: MemoryEntry[];
    usageStats: {
        totalTokens: number;
        averageImportance: number;
        activeMemories: number;
        expiredMemories: number;
    };
}

/**
 * 会话回顾（用于生成记忆）
 */
export interface SessionRetrospect {
    sessionId: string;
    title: string;
    summary: string;
    keyPoints: string[];
    decisions: string[];
    learnings: string[];
    userPreferences: string[];
    constraints: string[];
    suggestedMemories: {
        content: string;
        type: MemoryType;
        importance: number;
    }[];
}

/**
 * 创建记忆请求
 */
export interface CreateMemoryRequest {
    type: MemoryType;
    content: string;
    summary?: string;
    keywords?: string[];
    source?: {
        type: 'session' | 'user' | 'import';
        sessionId?: string;
        messageId?: string;
    };
    importance?: number;
    expiresIn?: number;                // 过期时间（秒）
}

/**
 * 记忆搜索请求
 */
export interface SearchMemoryRequest {
    query: string;
    types?: MemoryType[];
    minImportance?: number;
    limit?: number;
    includeExpired?: boolean;
    searchType?: 'keyword' | 'semantic' | 'hybrid';
}

// ============ 记忆管理服务 ============
export const memoryService = {
    /**
     * 获取用户记忆档案
     */
    async getProfile() {
        return apiClient.get<UserMemoryProfile>('/memory/profile');
    },

    /**
     * 创建记忆条目
     */
    async create(request: CreateMemoryRequest) {
        return apiClient.post<MemoryEntry>('/memory', request);
    },

    /**
     * 批量创建记忆
     */
    async createBatch(entries: CreateMemoryRequest[]) {
        return apiClient.post<MemoryEntry[]>('/memory/batch', { entries });
    },

    /**
     * 获取记忆条目
     */
    async get(memoryId: string) {
        return apiClient.get<MemoryEntry>(`/memory/${memoryId}`);
    },

    /**
     * 更新记忆条目
     */
    async update(memoryId: string, data: Partial<CreateMemoryRequest>) {
        return apiClient.put<MemoryEntry>(`/memory/${memoryId}`, data);
    },

    /**
     * 删除记忆条目
     */
    async delete(memoryId: string) {
        return apiClient.delete<{ success: boolean }>(`/memory/${memoryId}`);
    },

    /**
     * 列出记忆（支持分页和过滤）
     */
    async list(params?: {
        type?: MemoryType;
        minImportance?: number;
        page?: number;
        limit?: number;
    }) {
        return apiClient.get<PaginatedResponse<MemoryEntry>>('/memory', params as Record<string, string | number>);
    },

    /**
     * 搜索记忆
     */
    async search(request: SearchMemoryRequest) {
        return apiClient.post<MemorySearchResult[]>('/memory/search', request);
    },

    /**
     * 语义搜索（基于向量相似度）
     */
    async semanticSearch(query: string, options?: { limit?: number; minScore?: number }) {
        return apiClient.post<MemorySearchResult[]>('/memory/search/semantic', { query, ...options });
    },

    /**
     * 获取与会话相关的记忆
     */
    async getRelevantMemories(sessionId: string, options?: { limit?: number }) {
        return apiClient.get<MemorySearchResult[]>(`/memory/sessions/${sessionId}/relevant`, options);
    },

    /**
     * 从会话生成记忆（会话回顾）
     */
    async retrospectSession(sessionId: string) {
        return apiClient.post<SessionRetrospect>(`/memory/sessions/${sessionId}/retrospect`);
    },

    /**
     * 确认并保存会话回顾中的记忆
     */
    async confirmRetrospectMemories(
        sessionId: string,
        memories: { content: string; type: MemoryType; importance: number }[]
    ) {
        return apiClient.post<MemoryEntry[]>(`/memory/sessions/${sessionId}/retrospect/confirm`, { memories });
    },

    /**
     * 自动整理记忆（合并重复、更新重要性）
     */
    async consolidate() {
        return apiClient.post<{
            merged: number;
            updated: number;
            expired: number;
        }>('/memory/consolidate');
    },

    /**
     * 导出记忆
     */
    async export(options?: { types?: MemoryType[]; format?: 'json' | 'markdown' }) {
        const params: Record<string, string> = {};
        if (options?.types) params.types = options.types.join(',');
        if (options?.format) params.format = options.format;
        return apiClient.get<{ content: string; format: string }>('/memory/export', Object.keys(params).length ? params : undefined);
    },

    /**
     * 导入记忆
     */
    async import(data: { content: string; format: 'json' | 'markdown' }) {
        return apiClient.post<{ imported: number; skipped: number }>('/memory/import', data);
    },

    /**
     * 清理过期记忆
     */
    async cleanup() {
        return apiClient.post<{ deleted: number }>('/memory/cleanup');
    },

    /**
     * 记录记忆访问（用于重要性动态调整）
     */
    async recordAccess(memoryId: string) {
        return apiClient.post<{ success: boolean }>(`/memory/${memoryId}/access`);
    },

    // ============ 智能体记忆注入 ============

    /**
     * 获取智能体执行时应注入的记忆
     */
    async getAgentMemories(agentName: string, context?: string) {
        return apiClient.post<MemoryEntry[]>(`/memory/agents/${agentName}/inject`, { context });
    },

    /**
     * 设置智能体默认加载的记忆类型
     */
    async setAgentMemoryPrefs(agentName: string, prefs: {
        types: MemoryType[];
        minImportance: number;
        maxTokens: number;
    }) {
        return apiClient.put<{ success: boolean }>(`/memory/agents/${agentName}/prefs`, prefs);
    },
};
