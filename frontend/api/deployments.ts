/**
 * Deployments API Service
 */
import apiClient from './client';
import type {
    Deployment,
    DeploymentCreateRequest,
    DeploymentUpdateRequest,
    InferenceMetrics,
} from './types';

export const deploymentsApi = {
    /**
     * Get all deployments
     */
    list: async (): Promise<Deployment[]> => {
        const response = await apiClient.get<Deployment[]>('/deployments');
        return response.data;
    },

    /**
     * Get deployment by ID
     */
    get: async (id: number): Promise<Deployment> => {
        const response = await apiClient.get<Deployment>(`/deployments/${id}`);
        return response.data;
    },

    /**
     * Create new deployment
     */
    create: async (data: DeploymentCreateRequest): Promise<Deployment> => {
        const response = await apiClient.post<Deployment>('/deployments', data);
        return response.data;
    },

    /**
     * Update deployment configuration
     */
    update: async (id: number, data: DeploymentUpdateRequest): Promise<Deployment> => {
        const response = await apiClient.patch<Deployment>(`/deployments/${id}`, data);
        return response.data;
    },

    /**
     * Delete deployment
     */
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/deployments/${id}`);
    },

    /**
     * Get deployment metrics
     */
    getMetrics: async (id: number): Promise<InferenceMetrics> => {
        const response = await apiClient.get<InferenceMetrics>(`/deployments/${id}/metrics`);
        return response.data;
    },

    /**
     * Scale deployment
     */
    scale: async (id: number, replicas: number): Promise<Deployment> => {
        const response = await apiClient.post<Deployment>(`/deployments/${id}/scale`, { replicas });
        return response.data;
    },

    /**
     * Restart deployment
     */
    restart: async (id: number): Promise<Deployment> => {
        const response = await apiClient.post<Deployment>(`/deployments/${id}/restart`);
        return response.data;
    },
};

export default deploymentsApi;
