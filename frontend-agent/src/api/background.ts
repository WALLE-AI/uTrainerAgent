import { apiClient } from './client';
import type { BackgroundTask, BackgroundLaunchRequest } from './types';

// ============ 后台任务服务 ============
export const backgroundService = {
    /**
     * 启动后台任务
     */
    async launch(request: BackgroundLaunchRequest) {
        return apiClient.post<BackgroundTask>('/background/launch', request);
    },

    /**
     * 获取任务状态
     */
    async getTask(taskId: string) {
        return apiClient.get<BackgroundTask>(`/background/${taskId}`);
    },

    /**
     * 获取任务输出
     */
    async getOutput(
        taskId: string,
        options?: {
            block?: boolean;
            timeout?: number;
            fullSession?: boolean;
            sinceMessageId?: string;
        }
    ) {
        return apiClient.get<{
            taskId: string;
            sessionId: string;
            status: string;
            content: string;
            duration: string;
        }>(`/background/${taskId}/output`, options as Record<string, string | number>);
    },

    /**
     * 取消任务
     */
    async cancel(options: { taskId?: string; all?: boolean }) {
        return apiClient.post<{ cancelled: string[] }>('/background/cancel', options);
    },

    /**
     * 获取所有后台任务
     */
    async listTasks(sessionId?: string) {
        return apiClient.get<BackgroundTask[]>('/background/tasks', sessionId ? { sessionId } : undefined);
    },
};
