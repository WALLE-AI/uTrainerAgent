/**
 * Pipelines API Service
 */
import apiClient, { createSSEConnection } from './client';
import type {
    PipelineFlow,
    PipelineStrategy,
    PipelineExecution,
    PipelineExecutionCreateRequest,
} from './types';

export const pipelinesApi = {
    /**
     * Get available pipeline flows
     */
    listFlows: async (): Promise<PipelineFlow[]> => {
        const response = await apiClient.get<PipelineFlow[]>('/pipelines/flows');
        return response.data;
    },

    /**
     * Get strategies for a specific flow
     */
    getStrategies: async (flowId: string): Promise<PipelineStrategy[]> => {
        const response = await apiClient.get<PipelineStrategy[]>(
            `/pipelines/flows/${flowId}/strategies`
        );
        return response.data;
    },

    /**
     * Create pipeline execution
     */
    createExecution: async (data: PipelineExecutionCreateRequest): Promise<PipelineExecution> => {
        const response = await apiClient.post<PipelineExecution>('/pipelines/executions', data);
        return response.data;
    },

    /**
     * Get execution status
     */
    getExecution: async (id: string): Promise<PipelineExecution> => {
        const response = await apiClient.get<PipelineExecution>(`/pipelines/executions/${id}`);
        return response.data;
    },

    /**
     * Stop/cancel execution
     */
    stopExecution: async (id: string): Promise<void> => {
        await apiClient.delete(`/pipelines/executions/${id}`);
    },

    /**
     * Subscribe to execution logs via SSE
     */
    subscribeToLogs: (
        executionId: string,
        onLog: (log: string) => void,
        onError?: (error: Error) => void,
        onComplete?: () => void
    ): AbortController => {
        return createSSEConnection(
            `/pipelines/executions/${executionId}/logs/stream`,
            {},
            (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.log) {
                        onLog(data.log);
                    }
                    if (data.status === 'complete') {
                        onComplete?.();
                    }
                } catch (e) {
                    onLog(event.data);
                }
            },
            (error) => {
                onError?.(error instanceof Error ? error : new Error(String(error)));
            }
        );
    },
};

export default pipelinesApi;
