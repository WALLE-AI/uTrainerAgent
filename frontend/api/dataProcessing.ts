/**
 * Data Processing API Service
 */
import apiClient from './client';
import type {
    ProcessingTask,
    ProcessingTool,
    ProcessingTaskCreateRequest,
    PaginatedResponse,
    ProcessingTaskStatus,
} from './types';

export const dataProcessingApi = {
    /**
     * Get processing tasks list
     */
    listTasks: async (params?: {
        status?: ProcessingTaskStatus;
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResponse<ProcessingTask>> => {
        const response = await apiClient.get<PaginatedResponse<ProcessingTask>>('/data-processing/tasks', {
            params,
        });
        return response.data;
    },

    /**
     * Get task by ID
     */
    getTask: async (id: string): Promise<ProcessingTask> => {
        const response = await apiClient.get<ProcessingTask>(`/data-processing/tasks/${id}`);
        return response.data;
    },

    /**
     * Create processing task
     */
    createTask: async (data: ProcessingTaskCreateRequest): Promise<ProcessingTask> => {
        const response = await apiClient.post<ProcessingTask>('/data-processing/tasks', data);
        return response.data;
    },

    /**
     * Cancel/delete processing task
     */
    cancelTask: async (id: string): Promise<void> => {
        await apiClient.delete(`/data-processing/tasks/${id}`);
    },

    /**
     * Get available processing tools
     */
    listTools: async (): Promise<ProcessingTool[]> => {
        const response = await apiClient.get<ProcessingTool[]>('/data-processing/tools');
        return response.data;
    },

    /**
     * Execute a processing tool
     */
    executeTool: async (
        toolId: string,
        config: Record<string, any>
    ): Promise<ProcessingTask> => {
        const response = await apiClient.post<ProcessingTask>(
            `/data-processing/tools/${toolId}/execute`,
            config
        );
        return response.data;
    },
};

export default dataProcessingApi;
