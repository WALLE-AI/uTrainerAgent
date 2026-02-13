import { apiClient, type PaginatedResponse } from './client';
import type { Session, Message } from './types';

// ============ 会话服务 ============
export const sessionService = {
    /**
     * 创建新会话
     */
    async create(data?: { title?: string }) {
        return apiClient.post<Session>('/sessions', data);
    },

    /**
     * 获取会话列表
     */
    async list(params?: { page?: number; limit?: number }) {
        return apiClient.get<PaginatedResponse<Session>>('/sessions', params);
    },

    /**
     * 获取会话详情
     */
    async get(sessionId: string) {
        return apiClient.get<Session>(`/sessions/${sessionId}`);
    },

    /**
     * 更新会话
     */
    async update(sessionId: string, data: { title?: string }) {
        return apiClient.put<Session>(`/sessions/${sessionId}`, data);
    },

    /**
     * 删除会话
     */
    async delete(sessionId: string) {
        return apiClient.delete<{ success: boolean }>(`/sessions/${sessionId}`);
    },

    /**
     * 获取会话消息历史
     */
    async getMessages(sessionId: string, params?: { limit?: number }) {
        return apiClient.get<Message[]>(`/sessions/${sessionId}/messages`, params);
    },

    /**
     * 创建消息
     */
    async createMessage(sessionId: string, data: { role: string; content: string; toolCalls?: any[] }) {
        return apiClient.post<Message>(`/sessions/${sessionId}/messages`, data);
    },

    /**
     * 分支会话
     */
    async fork(sessionId: string, data?: { messageId?: string }) {
        return apiClient.post<Session>(`/sessions/${sessionId}/fork`, data);
    },

    /**
     * 中止会话执行
     */
    async abort(sessionId: string) {
        return apiClient.post<{ success: boolean }>(`/sessions/${sessionId}/abort`);
    },

    /**
     * 获取会话日志
     */
    async getLogs(sessionId: string) {
        return apiClient.get<any[]>(`/sessions/${sessionId}/logs`);
    },

    /**
     * 更新会话日志状态
     */
    async updateLog(
        sessionId: string,
        logId: string,
        data: { status: 'active' | 'complete' | 'error' }
    ) {
        return apiClient.put<any>(`/sessions/${sessionId}/logs/${logId}`, data);
    },
};
