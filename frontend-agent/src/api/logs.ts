import { apiClient } from './client';

// ============ SessionLog 接口定义 ============
export interface SessionLog {
    id: string;
    sessionId: string;
    logType: 'tool' | 'step' | 'terminal' | 'info' | 'error';
    title: string;
    content: string | null;
    status: 'active' | 'complete' | 'error';
    toolName: string | null;
    metadata: Record<string, any> | null;
    createdAt: string;
    updatedAt: string;
}

// ============ 会话日志服务 ============
export const sessionLogService = {
    /**
     * 获取会话日志列表
     */
    async list(sessionId: string) {
        return apiClient.get<SessionLog[]>(`/sessions/${sessionId}/logs`);
    },

    /**
     * 创建会话日志（供智能体内部调用）
     */
    async create(sessionId: string, data: {
        logType: SessionLog['logType'];
        title: string;
        content?: string;
        status?: SessionLog['status'];
        toolName?: string;
        metadata?: Record<string, any>;
    }) {
        return apiClient.post<SessionLog>(`/sessions/${sessionId}/logs`, data);
    },
};
