/**
 * Datasets API Service
 */
import apiClient from './client';
import type {
    Dataset,
    DatasetListParams,
    DatasetPreview,
    DatasetVersion,
    DatasetCreateRequest,
    DatasetUpdateRequest,
    PaginatedResponse,
} from './types';

export const datasetsApi = {
    /**
     * Get datasets list with pagination and filters
     */
    list: async (params?: DatasetListParams): Promise<PaginatedResponse<Dataset>> => {
        const response = await apiClient.get<PaginatedResponse<Dataset>>('/datasets', { params });
        return response.data;
    },

    /**
     * Get dataset by ID
     */
    get: async (id: string): Promise<Dataset> => {
        const response = await apiClient.get<Dataset>(`/datasets/${id}`);
        return response.data;
    },

    /**
     * Create dataset metadata
     */
    create: async (data: DatasetCreateRequest): Promise<Dataset> => {
        const response = await apiClient.post<Dataset>('/datasets', data);
        return response.data;
    },

    /**
     * Upload dataset file
     */
    upload: async (
        file: File,
        metadata: DatasetCreateRequest,
        onProgress?: (progress: number) => void
    ): Promise<Dataset> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', metadata.name);
        formData.append('modality', metadata.modality);
        formData.append('tags', JSON.stringify(metadata.tags));
        if (metadata.description) {
            formData.append('description', metadata.description);
        }

        const response = await apiClient.post<Dataset>('/datasets/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        });
        return response.data;
    },

    /**
     * Update dataset (tags, description, status)
     */
    update: async (id: string, data: DatasetUpdateRequest): Promise<Dataset> => {
        const response = await apiClient.patch<Dataset>(`/datasets/${id}`, data);
        return response.data;
    },

    /**
     * Delete dataset
     */
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/datasets/${id}`);
    },

    /**
     * Get dataset preview (sample data)
     */
    getPreview: async (id: string, limit: number = 10): Promise<DatasetPreview> => {
        const response = await apiClient.get<DatasetPreview>(`/datasets/${id}/preview`, {
            params: { limit },
        });
        return response.data;
    },

    /**
     * Get dataset version history
     */
    getVersions: async (id: string): Promise<DatasetVersion[]> => {
        const response = await apiClient.get<DatasetVersion[]>(`/datasets/${id}/versions`);
        return response.data;
    },

    /**
     * Get dataset quality report
     */
    getQualityReport: async (id: string): Promise<{ quality: number; details: any }> => {
        const response = await apiClient.get(`/datasets/${id}/quality`);
        return response.data;
    },

    /**
     * Publish dataset
     */
    publish: async (id: string): Promise<Dataset> => {
        const response = await apiClient.post<Dataset>(`/datasets/${id}/publish`);
        return response.data;
    },
};

export default datasetsApi;
