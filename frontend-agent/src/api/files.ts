import { apiClient } from './client';
import type { FileInfo, PreviewData } from './types';

// ============ 文件服务 ============
export const fileService = {
    /**
     * 上传文件
     */
    async upload(
        file: File,
        options?: {
            sessionId?: string;
            onProgress?: (progress: number) => void;
        }
    ) {
        // 如果有 sessionId，需要在上传时附加
        const endpoint = options?.sessionId
            ? `/files/upload?sessionId=${options.sessionId}`
            : '/files/upload';
        return apiClient.upload<FileInfo>(endpoint, file, options?.onProgress);
    },

    /**
     * 获取文件信息
     */
    async get(fileId: string) {
        return apiClient.get<FileInfo>(`/files/${fileId}`);
    },

    /**
     * 获取文件预览
     */
    async preview(fileId: string) {
        return apiClient.get<PreviewData>(`/files/${fileId}/preview`);
    },

    /**
     * 下载文件
     */
    async download(
        fileId: string,
        fileName: string,
        onProgress?: (progress: number) => void
    ) {
        const token = apiClient.getToken();
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const url = `${baseUrl}/files/download/${fileId}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
        }

        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Unable to read response');
        }

        const chunks: Uint8Array[] = [];
        let receivedLength = 0;

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            chunks.push(value);
            receivedLength += value.length;

            if (onProgress && total) {
                const progress = Math.round((receivedLength / total) * 100);
                onProgress(progress);
            }
        }

        // 合并所有chunks
        const blob = new Blob(chunks as BlobPart[]);

        // 创建下载链接
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

        return { success: true };
    },

    /**
     * 获取下载 URL
     */
    getDownloadUrl(fileId: string) {
        const token = apiClient.getToken();
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        return `${baseUrl}/files/${fileId}/download${token ? `?token=${token}` : ''}`;
    },

    /**
     * 删除文件
     */
    async delete(fileId: string) {
        return apiClient.delete<{ success: boolean }>(`/files/${fileId}`);
    },

    /**
     * 获取会话文件列表
     */
    async listBySession(sessionId: string) {
        return apiClient.get<FileInfo[]>(`/sessions/${sessionId}/files`);
    },

    /**
     * 打开本地目录选择器 (仅在本地开发模式下有效)
     */
    async pickDirectory() {
        return apiClient.get<string>('/files/pick-directory');
    }
};
