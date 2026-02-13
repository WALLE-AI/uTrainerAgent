import { apiClient } from './client';
import type { ConnectorInfo, ConfiguredConnector } from './types';

// ============ 连接器服务 ============
export const connectorService = {
    /**
     * 获取可用连接器列表
     */
    async listAvailable() {
        return apiClient.get<ConnectorInfo[]>('/connectors/available');
    },

    /**
     * 获取已配置的连接器
     */
    async listConfigured() {
        return apiClient.get<ConfiguredConnector[]>('/connectors/configured');
    },

    /**
     * 添加连接器
     */
    async add(data: {
        connectorType: string;
        name: string;
        config?: Record<string, unknown>;
    }) {
        return apiClient.post<ConfiguredConnector>('/connectors', data);
    },

    /**
     * 删除连接器
     */
    async delete(connectorId: string) {
        return apiClient.delete<{ success: boolean }>(`/connectors/${connectorId}`);
    },

    /**
     * 获取 OAuth 授权 URL
     */
    getOAuthUrl(connectorId: string) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const token = apiClient.getToken();
        return `${baseUrl}/connectors/${connectorId}/oauth${token ? `?token=${token}` : ''}`;
    },

    /**
     * 测试连接器连接
     */
    async test(connectorId: string) {
        return apiClient.post<{ success: boolean; message?: string }>(
            `/connectors/${connectorId}/test`
        );
    },
};
