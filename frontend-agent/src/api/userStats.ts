/**
 * 用户统计 API 模块
 */
import { apiClient } from './client';

export interface UserOverviewStats {
    totalCreationTime: number;
    totalDownloads: number;
    totalShares: number;
    activeAgents: number;
    totalTokensUsed: number;
    totalModelCalls: number;
    totalToolCalls: number;
    totalSessions: number;
}

export interface UserActivityItem {
    id: string;
    action: string;
    target: string;
    targetType?: string;
    targetId?: string;
    createdAt: string;
}

export interface TrendDataPoint {
    name: string;
    tokens: number;
    calls: number;
    tools: number;
    breakdown?: {
        [provider: string]: {
            total_tokens: number;
            total_calls: number;
            total_tool_calls?: number;
            models: {
                [model: string]: {
                    tokens: number;
                    calls: number;
                    tool_calls?: number;
                };
            };
        };
    };
}

export interface ToolUsageItem {
    name: string;
    value: number;
    color?: string;
}

export interface PhaseMetric {
    step: number;
    title: string;
    tokensInput: number;
    tokensOutput: number;
    tokensTotal: number;
    modelCalls: number;
    toolsCalled: string[];
    executionTimeMs: number;
    createdAt: string;
}

/**
 * 获取用户概览统计
 */
export const getUserOverview = async (): Promise<UserOverviewStats> => {
    const response = await apiClient.get<UserOverviewStats>('/users/me/overview');
    if (!response.success || !response.data) {
        throw new Error('Failed to fetch user overview');
    }
    return response.data;
};

/**
 * 获取用户活动日志
 */
export const getUserActivities = async (
    page: number = 1,
    limit: number = 20
): Promise<UserActivityItem[]> => {
    const response = await apiClient.get<UserActivityItem[]>('/users/me/activities', {
        page,
        limit
    });
    if (!response.success || !response.data) {
        throw new Error('Failed to fetch user activities');
    }
    return response.data;
};

/**
 * 获取使用趋势数据
 */
export const getUserTrends = async (
    periodType: 'daily' | 'monthly' = 'daily',
    days: number = 7
): Promise<TrendDataPoint[]> => {
    const response = await apiClient.get<TrendDataPoint[]>('/users/me/trends', {
        period_type: periodType,
        days
    });
    if (!response.success || !response.data) {
        throw new Error('Failed to fetch user trends');
    }
    return response.data;
};

/**
 * 获取工具使用分布
 */
export const getToolUsage = async (limit: number = 10): Promise<ToolUsageItem[]> => {
    const response = await apiClient.get<ToolUsageItem[]>('/users/me/tool-usage', {
        limit
    });
    if (!response.success || !response.data) {
        throw new Error('Failed to fetch tool usage');
    }
    return response.data;
};

/**
 * 获取会话执行指标
 */
export const getSessionMetrics = async (sessionId: string): Promise<PhaseMetric[]> => {
    const response = await apiClient.get<PhaseMetric[]>(`/users/me/sessions/${sessionId}/metrics`);
    if (!response.success || !response.data) {
        throw new Error('Failed to fetch session metrics');
    }
    return response.data;
};

const userStatsApi = {
    getUserOverview,
    getUserActivities,
    getUserTrends,
    getToolUsage,
    getSessionMetrics,
};

export default userStatsApi;
