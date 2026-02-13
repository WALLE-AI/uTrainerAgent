import { apiClient } from './client';
import type { User, AuthResponse } from './types';

// ============ 认证服务 ============
export const authService = {
    /**
     * 用户注册
     */
    async register(data: { username: string; email: string; password: string }) {
        const res = await apiClient.post<User>('/auth/register', data);
        return res;
    },

    /**
     * 用户登录
     */
    async login(data: { email: string; password: string }) {
        const res = await apiClient.post<AuthResponse>('/auth/login', data);
        if (res.success && res.data) {
            apiClient.setToken(res.data.token);
            localStorage.setItem('refresh_token', res.data.refreshToken);
        }
        return res;
    },

    /**
     * 退出登录
     */
    async logout() {
        const res = await apiClient.post<{ success: boolean }>('/auth/logout');
        apiClient.setToken(null);
        localStorage.removeItem('refresh_token');
        return res;
    },

    /**
     * 刷新 Token
     */
    async refreshToken() {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            return { success: false, error: { code: 'NO_REFRESH_TOKEN', message: '无刷新令牌' } };
        }
        const res = await apiClient.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken });
        if (res.success && res.data) {
            apiClient.setToken(res.data.token);
            localStorage.setItem('refresh_token', res.data.refreshToken);
        }
        return res;
    },

    /**
     * OAuth 登录跳转 URL
     */
    getOAuthUrl(provider: 'google' | 'github') {
        return `${apiClient.getToken() ? '' : ''}/api/auth/oauth/${provider}`;
    },

    /**
     * 检查是否已登录
     */
    isAuthenticated() {
        return !!apiClient.getToken();
    },

    /**
     * 获取当前 Token
     */
    getToken() {
        return apiClient.getToken();
    },
};

// ============ 用户服务 ============
export const userService = {
    /**
     * 获取当前用户信息
     */
    async getProfile() {
        return apiClient.get<User>('/users/me');
    },

    /**
     * 更新用户资料
     */
    async updateProfile(data: { name?: string; bio?: string; avatar?: string; settings?: any }) {
        return apiClient.put<User>('/users/me', data);
    },

    /**
     * 测试 LLM 连接
     */
    async testLlmConnection(data: { provider_type: string; api_key: string; base_url?: string; model?: string }) {
        return apiClient.post<{ message: string }>('/users/me/llm-test', data);
    },

    /**
     * 获取指定提供商的所有模型名称
     */
    async listModels(params: { provider_type: string; api_key: string; base_url?: string }) {
        return apiClient.get<string[]>('/users/models', params);
    },

    /**
     * 获取使用统计
     */
    async getStats() {
        return apiClient.get<{
            papers: number;
            downloads: number;
            shares: number;
            tokensUsed: number;
            sessionsCount: number;
        }>('/users/me/stats');
    },

    /**
     * 获取活动记录
     */
    async getActivities(params?: { page?: number; limit?: number }) {
        return apiClient.get<{ id: string; action: string; target: string; createdAt: string }[]>(
            '/users/me/activities',
            params
        );
    },

    /**
     * 修改密码
     */
    async changePassword(data: { oldPassword: string; newPassword: string }) {
        return apiClient.put<{ success: boolean }>('/users/me/password', data);
    },
};
