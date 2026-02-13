/**
 * Evaluation API Service
 */
import apiClient from './client';
import type {
    GeneralBenchmark,
    DomainBenchmark,
    EvaluationTask,
    EvaluationTaskCreateRequest,
    EvaluationStatus,
    PaginatedResponse,
} from './types';

export const evaluationApi = {
    /**
     * Get general benchmarks leaderboard
     */
    getGeneralBenchmarks: async (): Promise<GeneralBenchmark[]> => {
        const response = await apiClient.get<GeneralBenchmark[]>('/evaluation/benchmarks/general');
        return response.data;
    },

    /**
     * Get domain-specific benchmarks
     */
    getDomainBenchmarks: async (domain?: string): Promise<DomainBenchmark[]> => {
        const response = await apiClient.get<DomainBenchmark[]>('/evaluation/benchmarks/domain', {
            params: { domain },
        });
        return response.data;
    },

    /**
     * Get evaluation tasks list
     */
    listTasks: async (params?: {
        status?: EvaluationStatus;
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResponse<EvaluationTask>> => {
        const response = await apiClient.get<PaginatedResponse<EvaluationTask>>('/evaluation/tasks', {
            params,
        });
        return response.data;
    },

    /**
     * Get evaluation task by ID
     */
    getTask: async (id: string): Promise<EvaluationTask> => {
        const response = await apiClient.get<EvaluationTask>(`/evaluation/tasks/${id}`);
        return response.data;
    },

    /**
     * Create evaluation task
     */
    createTask: async (data: EvaluationTaskCreateRequest): Promise<EvaluationTask> => {
        const response = await apiClient.post<EvaluationTask>('/evaluation/tasks', data);
        return response.data;
    },
};

export default evaluationApi;
