import { apiClient } from './client';

/**
 * SSH 配置
 */
export interface SSHConfig {
    host: string;
    port: number;
    username: string;
    authType: 'password' | 'key';
    password?: string;
    sshKey?: string;
}

/**
 * 工作空间
 */
export interface Workspace {
    id: string;
    name: string;
    type: 'local' | 'remote';
    path: string;
    isActive: boolean;
    isDefault: boolean;
    validationStatus: 'pending' | 'valid' | 'invalid';
    lastValidatedAt?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * 创建工作空间 DTO
 */
export interface CreateWorkspaceDto {
    name: string;
    type: 'local' | 'remote';
    path: string;
    sshConfig?: SSHConfig;
}

/**
 * 更新工作空间 DTO
 */
export interface UpdateWorkspaceDto {
    name?: string;
    path?: string;
    sshConfig?: SSHConfig;
}

/**
 * 工作空间 API客户端
 */
export const workspaceApi = {
    /**
     * 获取所有工作空间
     */
    async list() {
        return apiClient.get<Workspace[]>('/workspaces');
    },

    /**
     * 获取当前激活的工作空间
     */
    async getActive() {
        return apiClient.get<Workspace | null>('/workspaces/active');
    },

    /**
     * 创建新工作空间
     */
    async create(data: CreateWorkspaceDto) {
        return apiClient.post<Workspace>('/workspaces', data);
    },

    /**
     * 更新工作空间
     */
    async update(id: string, data: UpdateWorkspaceDto) {
        return apiClient.put<Workspace>(`/workspaces/${id}`, data);
    },

    /**
     * 删除工作空间
     */
    async delete(id: string) {
        return apiClient.delete<void>(`/workspaces/${id}`);
    },

    /**
     * 激活工作空间
     */
    async activate(id: string) {
        return apiClient.put<Workspace>(`/workspaces/${id}/activate`, {});
    },

    /**
     * 设置默认工作空间
     */
    async setDefault(id: string) {
        return apiClient.put<Workspace>(`/workspaces/${id}/set-default`, {});
    },

    /**
     * 验证工作空间路径
     */
    async validate(path: string, type: 'local' | 'remote') {
        return apiClient.post<{ valid: boolean; error?: string }>('/workspaces/validate', {
            path,
            type,
        });
    },
};
