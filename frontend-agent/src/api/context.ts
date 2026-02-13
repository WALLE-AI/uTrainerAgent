import { apiClient } from './client';

// ============ 上下文管理类型定义 ============

/**
 * 上下文来源类型
 */
export type ContextSourceType =
    | 'system'           // 系统级上下文
    | 'skill'            // 技能注入
    | 'user-rules'       // 用户规则
    | 'directory'        // 目录上下文（README、.opencode等）
    | 'file'             // 文件内容
    | 'web'              // 网络搜索结果
    | 'connector'        // 连接器数据
    | 'memory'           // 长期记忆
    | 'custom';          // 自定义

/**
 * 上下文优先级
 */
export type ContextPriority = 'critical' | 'high' | 'normal' | 'low';

/**
 * 上下文条目
 */
export interface ContextEntry {
    id: string;
    source: ContextSourceType;
    content: string;
    priority: ContextPriority;
    tokens: number;                    // 估计的 token 数量
    metadata?: Record<string, unknown>;
    createdAt: string;
    expiresAt?: string;                // 可选的过期时间
}

/**
 * 会话上下文状态
 */
export interface SessionContext {
    sessionId: string;
    entries: ContextEntry[];
    totalTokens: number;
    maxTokens: number;                 // 模型上下文窗口限制
    usagePercent: number;              // 使用百分比
    needsCompaction: boolean;          // 是否需要压缩
}

/**
 * 上下文压缩摘要
 */
export interface CompactionSummary {
    id: string;
    sessionId: string;
    content: string;
    sections: {
        userRequests: string;            // 用户请求（原文）
        finalGoal: string;               // 最终目标
        workCompleted: string;           // 已完成工作
        remainingTasks: string;          // 剩余任务
        activeContext: string;           // 活跃上下文
        constraints: string;             // 约束/禁忌
        agentState?: string;             // 智能体验证状态
    };
    originalTokens: number;
    compressedTokens: number;
    compressionRatio: number;
    createdAt: string;
}

/**
 * 上下文注入请求
 */
export interface InjectContextRequest {
    sessionId: string;
    source: ContextSourceType;
    content: string;
    priority?: ContextPriority;
    metadata?: Record<string, unknown>;
    expiresIn?: number;                // 过期时间（秒）
}

/**
 * Token 使用统计
 */
export interface TokenUsage {
    input: number;
    output: number;
    cached: number;
    total: number;
    limit: number;
    remaining: number;
    usagePercent: number;
}

// ============ 上下文管理服务 ============
export const contextService = {
    /**
     * 获取会话当前上下文状态
     */
    async getSessionContext(sessionId: string) {
        return apiClient.get<SessionContext>(`/context/sessions/${sessionId}`);
    },

    /**
     * 注入上下文条目
     */
    async inject(request: InjectContextRequest) {
        return apiClient.post<ContextEntry>('/context/inject', request);
    },

    /**
     * 批量注入上下文
     */
    async injectBatch(entries: InjectContextRequest[]) {
        return apiClient.post<ContextEntry[]>('/context/inject/batch', { entries });
    },

    /**
     * 移除上下文条目
     */
    async remove(sessionId: string, entryId: string) {
        return apiClient.delete<{ success: boolean }>(`/context/sessions/${sessionId}/entries/${entryId}`);
    },

    /**
     * 清空会话上下文
     */
    async clear(sessionId: string) {
        return apiClient.delete<{ success: boolean }>(`/context/sessions/${sessionId}/entries`);
    },

    /**
     * 获取 Token 使用统计
     */
    async getTokenUsage(sessionId: string) {
        return apiClient.get<TokenUsage>(`/context/sessions/${sessionId}/tokens`);
    },

    /**
     * 估算文本 Token 数量
     */
    async estimateTokens(text: string) {
        return apiClient.post<{ tokens: number; chars: number }>('/context/estimate', { text });
    },

    /**
     * 触发上下文压缩
     */
    async compact(sessionId: string, options?: { auto?: boolean }) {
        return apiClient.post<CompactionSummary>(`/context/sessions/${sessionId}/compact`, options);
    },

    /**
     * 获取压缩历史
     */
    async getCompactionHistory(sessionId: string) {
        return apiClient.get<CompactionSummary[]>(`/context/sessions/${sessionId}/compactions`);
    },

    /**
     * 修剪旧的工具输出（释放上下文空间）
     */
    async prune(sessionId: string, options?: { keepTokens?: number }) {
        return apiClient.post<{ prunedEntries: number; freedTokens: number }>(
            `/context/sessions/${sessionId}/prune`,
            options
        );
    },

    /**
     * 获取上下文窗口监控数据
     */
    async getMonitor(sessionId: string) {
        return apiClient.get<{
            sessionId: string;
            model: string;
            contextLimit: number;
            currentUsage: number;
            usagePercent: number;
            warningThreshold: number;
            isWarning: boolean;
            lastUpdated: string;
        }>(`/context/sessions/${sessionId}/monitor`);
    },
};
