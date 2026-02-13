/**
 * Tasks API Service (Global Task Center)
 */
import apiClient, { createWebSocket } from './client';
import type {
    GlobalTask,
    GlobalTaskStatus,
    GlobalTaskType,
    PaginatedResponse,
} from './types';

export const tasksApi = {
    /**
     * Get active tasks
     */
    getActive: async (): Promise<GlobalTask[]> => {
        const response = await apiClient.get<GlobalTask[]>('/tasks/active');
        return response.data;
    },

    /**
     * Get task history
     */
    getHistory: async (params?: {
        page?: number;
        pageSize?: number;
        type?: GlobalTaskType;
        status?: GlobalTaskStatus;
    }): Promise<PaginatedResponse<GlobalTask>> => {
        const response = await apiClient.get<PaginatedResponse<GlobalTask>>('/tasks/history', {
            params,
        });
        return response.data;
    },

    /**
     * Get task by ID
     */
    get: async (id: string): Promise<GlobalTask> => {
        const response = await apiClient.get<GlobalTask>(`/tasks/${id}`);
        return response.data;
    },

    /**
     * Subscribe to task updates via WebSocket
     */
    subscribeToUpdates: (
        onUpdate: (data: { taskId: string; status: GlobalTaskStatus; progress: number }) => void,
        onError?: (error: Event) => void,
        onClose?: () => void
    ): WebSocket => {
        return createWebSocket(
            '/ws/tasks',
            (data) => {
                if (data.type === 'task_update') {
                    onUpdate(data.data);
                }
            },
            onError,
            onClose
        );
    },
};

export default tasksApi;
