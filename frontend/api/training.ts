/**
 * Training API Service
 */
import apiClient, { createSSEConnection } from './client';
import type {
    TrainingJob,
    TrainingJobListParams,
    TrainingJobCreateRequest,
    TrainingMetricPoint,
    Artifact,
    LogEntry,
    PaginatedResponse,
    Cluster,
    GPUType,
    BaseModel,
} from './types';

export const trainingApi = {
    /**
     * Get training jobs list
     */
    listJobs: async (params?: TrainingJobListParams): Promise<PaginatedResponse<TrainingJob>> => {
        const response = await apiClient.get<PaginatedResponse<TrainingJob>>('/training/jobs', {
            params,
        });
        return response.data;
    },

    /**
     * Get training job by ID
     */
    getJob: async (id: string): Promise<TrainingJob> => {
        const response = await apiClient.get<TrainingJob>(`/training/jobs/${id}`);
        return response.data;
    },

    /**
     * Create training job
     */
    createJob: async (data: TrainingJobCreateRequest): Promise<TrainingJob> => {
        const response = await apiClient.post<TrainingJob>('/training/jobs', data);
        return response.data;
    },

    /**
     * Delete training job
     */
    deleteJob: async (id: string): Promise<void> => {
        await apiClient.delete(`/training/jobs/${id}`);
    },

    /**
     * Stop training job
     */
    stopJob: async (id: string): Promise<TrainingJob> => {
        const response = await apiClient.post<TrainingJob>(`/training/jobs/${id}/stop`);
        return response.data;
    },

    /**
     * Resume training job
     */
    resumeJob: async (id: string): Promise<TrainingJob> => {
        const response = await apiClient.post<TrainingJob>(`/training/jobs/${id}/resume`);
        return response.data;
    },

    /**
     * Get training job metrics history
     */
    getMetrics: async (
        id: string,
        params?: { startStep?: number; endStep?: number }
    ): Promise<TrainingMetricPoint[]> => {
        const response = await apiClient.get<TrainingMetricPoint[]>(`/training/jobs/${id}/metrics`, {
            params,
        });
        return response.data;
    },

    /**
     * Get training job artifacts
     */
    getArtifacts: async (id: string): Promise<Artifact[]> => {
        const response = await apiClient.get<Artifact[]>(`/training/jobs/${id}/artifacts`);
        return response.data;
    },

    /**
     * Download artifact
     */
    downloadArtifact: async (jobId: string, artifactId: string): Promise<Blob> => {
        const response = await apiClient.get(
            `/training/jobs/${jobId}/artifacts/${artifactId}/download`,
            {
                responseType: 'blob',
            }
        );
        return response.data;
    },

    /**
     * Get training job logs
     */
    getLogs: async (id: string, params?: { tail?: number }): Promise<LogEntry[]> => {
        const response = await apiClient.get<LogEntry[]>(`/training/jobs/${id}/logs`, { params });
        return response.data;
    },

    /**
     * Subscribe to training job logs via SSE
     */
    subscribeToLogs: (
        jobId: string,
        onLog: (log: LogEntry) => void,
        onError?: (error: Error) => void
    ): AbortController => {
        return createSSEConnection(
            `/training/jobs/${jobId}/logs/stream`,
            {},
            (event) => {
                try {
                    const log = JSON.parse(event.data) as LogEntry;
                    onLog(log);
                } catch (e) {
                    console.error('Failed to parse log entry:', e);
                }
            },
            (error) => {
                onError?.(error instanceof Error ? error : new Error(String(error)));
            }
        );
    },

    /**
     * Get available training engines
     */
    getEngines: async (): Promise<{ id: string; name: string; description: string }[]> => {
        const response = await apiClient.get('/training/engines');
        return response.data;
    },

    /**
     * Get available clusters
     */
    getClusters: async (): Promise<Cluster[]> => {
        const response = await apiClient.get<Cluster[]>('/clusters');
        return response.data;
    },

    /**
     * Get available GPU types
     */
    getGPUTypes: async (): Promise<GPUType[]> => {
        const response = await apiClient.get<GPUType[]>('/clusters/gpu-types');
        return response.data;
    },

    /**
     * Get available base models
     */
    getBaseModels: async (): Promise<BaseModel[]> => {
        const response = await apiClient.get<BaseModel[]>('/models/base');
        return response.data;
    },
};

export default trainingApi;
