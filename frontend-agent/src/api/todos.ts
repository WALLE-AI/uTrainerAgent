import { apiClient } from './client';
import type { Todo } from './types';

// ============ 待办任务服务 ============
export const todoService = {
    /**
     * 获取会话待办列表
     */
    async list(sessionId: string) {
        return apiClient.get<Todo[]>(`/sessions/${sessionId}/todos`);
    },

    /**
     * 创建待办
     */
    async create(sessionId: string, data: { title: string; order?: number }) {
        return apiClient.post<Todo>(`/sessions/${sessionId}/todos`, data);
    },

    /**
     * 更新待办状态
     */
    async update(
        sessionId: string,
        todoId: string,
        data: { status?: Todo['status']; result?: string }
    ) {
        return apiClient.put<Todo>(`/sessions/${sessionId}/todos/${todoId}`, data);
    },

    /**
     * 删除待办
     */
    async delete(sessionId: string, todoId: string) {
        return apiClient.delete<{ success: boolean }>(`/sessions/${sessionId}/todos/${todoId}`);
    },
};
