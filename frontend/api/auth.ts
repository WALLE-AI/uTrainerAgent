/**
 * Auth API Service
 */
import apiClient, { setAuthToken } from './client';
import type { User, LoginRequest, LoginResponse, RegisterRequest } from './types';

export const authApi = {
    /**
     * User login
     */
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', data);
        setAuthToken(response.data.token);
        return response.data;
    },

    /**
     * User registration
     */
    register: async (data: RegisterRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/register', data);
        setAuthToken(response.data.token);
        return response.data;
    },

    /**
     * User logout
     */
    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
        setAuthToken(null);
    },

    /**
     * Get current user
     */
    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get<User>('/auth/me');
        return response.data;
    },

    /**
     * Update user profile
     */
    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await apiClient.put<User>('/auth/me', data);
        return response.data;
    },
};

export default authApi;
