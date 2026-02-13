/**
 * Monitoring API Service
 */
import apiClient, { createSSEConnection, createWebSocket } from './client';
import type {
    GPUNode,
    Alert,
    AlertListParams,
    LogEntry,
    LogListParams,
    SystemMetricPoint,
    MetricTrendPoint,
    ErrorRecord,
    StorageQuota,
    TaskStats,
    PaginatedResponse,
    InferenceMetrics,
} from './types';

export const monitoringApi = {
    // ==================== GPU Cluster ====================

    /**
     * Get GPU cluster status
     */
    getGPUCluster: async (): Promise<GPUNode[]> => {
        const response = await apiClient.get<GPUNode[]>('/monitoring/gpu-cluster');
        return response.data;
    },

    /**
     * Subscribe to GPU metrics via WebSocket
     */
    subscribeToGPUMetrics: (
        onUpdate: (data: { nodeId: string; gpuId: string; util: number; mem: number; temp: number; power: number }) => void,
        onError?: (error: Event) => void,
        onClose?: () => void
    ): WebSocket => {
        return createWebSocket(
            '/ws/gpu-metrics',
            (data) => {
                if (data.type === 'gpu_update') {
                    onUpdate(data.data);
                }
            },
            onError,
            onClose
        );
    },

    // ==================== Alerts ====================

    /**
     * Get alerts list
     */
    getAlerts: async (params?: AlertListParams): Promise<PaginatedResponse<Alert>> => {
        const response = await apiClient.get<PaginatedResponse<Alert>>('/monitoring/alerts', {
            params,
        });
        return response.data;
    },

    /**
     * Acknowledge alert
     */
    acknowledgeAlert: async (id: number): Promise<Alert> => {
        const response = await apiClient.post<Alert>(`/monitoring/alerts/${id}/acknowledge`);
        return response.data;
    },

    // ==================== Logs ====================

    /**
     * Get logs
     */
    getLogs: async (params?: LogListParams): Promise<LogEntry[]> => {
        const response = await apiClient.get<LogEntry[]>('/monitoring/logs', { params });
        return response.data;
    },

    /**
     * Subscribe to logs via SSE
     */
    subscribeToLogs: (
        onLog: (log: LogEntry) => void,
        sources?: string[],
        onError?: (error: Error) => void
    ): AbortController => {
        const params = sources ? `?sources=${sources.join(',')}` : '';
        return createSSEConnection(
            `/monitoring/logs/stream${params}`,
            {},
            (event) => {
                try {
                    const log = JSON.parse(event.data) as LogEntry;
                    onLog(log);
                } catch (e) {
                    console.error('Failed to parse log:', e);
                }
            },
            (error) => {
                onError?.(error instanceof Error ? error : new Error(String(error)));
            }
        );
    },

    // ==================== System Metrics ====================

    /**
     * Get system metrics
     */
    getSystemMetrics: async (range: string = '1h'): Promise<SystemMetricPoint[]> => {
        const response = await apiClient.get<SystemMetricPoint[]>('/monitoring/system-metrics', {
            params: { range },
        });
        return response.data;
    },

    // ==================== Inference Monitoring ====================

    /**
     * Get inference metrics for a deployment
     */
    getInferenceMetrics: async (deploymentId: number): Promise<InferenceMetrics> => {
        const response = await apiClient.get<InferenceMetrics>(
            `/monitoring/inference/${deploymentId}/metrics`
        );
        return response.data;
    },

    /**
     * Get inference metrics trends
     */
    getInferenceTrends: async (
        deploymentId: number,
        range: string = '1h'
    ): Promise<MetricTrendPoint[]> => {
        const response = await apiClient.get<MetricTrendPoint[]>(
            `/monitoring/inference/${deploymentId}/trends`,
            { params: { range } }
        );
        return response.data;
    },

    /**
     * Get inference error records
     */
    getInferenceErrors: async (
        deploymentId: number,
        limit: number = 10
    ): Promise<ErrorRecord[]> => {
        const response = await apiClient.get<ErrorRecord[]>(
            `/monitoring/inference/${deploymentId}/errors`,
            { params: { limit } }
        );
        return response.data;
    },

    /**
     * Export error as test dataset
     */
    exportErrorAsTestset: async (errorId: number): Promise<{ datasetId: string }> => {
        const response = await apiClient.post(`/monitoring/inference/errors/${errorId}/export-testset`);
        return response.data;
    },

    // ==================== Storage & Stats ====================

    /**
     * Get storage quota
     */
    getStorageQuota: async (): Promise<StorageQuota> => {
        const response = await apiClient.get<StorageQuota>('/monitoring/storage/quota');
        return response.data;
    },

    /**
     * Get task statistics
     */
    getTaskStats: async (): Promise<TaskStats> => {
        const response = await apiClient.get<TaskStats>('/monitoring/tasks/stats');
        return response.data;
    },
};

export default monitoringApi;
