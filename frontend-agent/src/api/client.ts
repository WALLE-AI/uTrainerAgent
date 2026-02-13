import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

// ============ API 配置 ============
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ============ 通用类型 ============
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

// ============ API 客户端 ============
class ApiClient {
    private instance: AxiosInstance;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.token = localStorage.getItem('auth_token');

        this.instance = axios.create({
            baseURL: baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    /**
     * 设置请求和响应拦截器
     */
    private setupInterceptors() {
        // 请求拦截器：注入 Token (每次请求时从localStorage读取最新token)
        this.instance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                // 直接从localStorage读取，确保登录后立即生效
                const currentToken = localStorage.getItem('auth_token');
                if (currentToken) {
                    config.headers.Authorization = `Bearer ${currentToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // 响应拦截器：统一格式处理与错误拦截
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => {
                // Axios 的 response.data 已经是解析后的 JSON
                return response;
            },
            (error) => {
                const response = error.response;

                // 处理 401 未授权
                if (response && response.status === 401) {
                    this.setToken(null);
                    window.dispatchEvent(new CustomEvent('auth:logout'));
                }

                // 统一错误格式
                const apiError = {
                    success: false,
                    error: response?.data?.error || {
                        code: error.code || 'UNKNOWN_ERROR',
                        message: error.message || '请求失败',
                    },
                };

                return Promise.resolve({ data: apiError });
            }
        );
    }

    /**
     * 更新 Token
     */
    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    getToken() {
        return this.token;
    }

    /**
     * 通用请求封装
     */
    private async request<T>(
        config: InternalAxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        try {
            const response = await this.instance.request(config);

            // 如果拦截器已经处理好错误并返回了 ApiResponse 格式（在 data 中）
            if (response.data && 'success' in response.data && response.data.success === false) {
                return response.data as ApiResponse<T>;
            }

            // 如果后端已经返回了 ApiResponse 格式，直接使用
            if (response.data && 'success' in response.data && response.data.success === true) {
                return {
                    success: true,
                    data: response.data.data as T,
                };
            }

            // 否则包装成 ApiResponse 格式
            return {
                success: true,
                data: response.data as T,
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'CLIENT_ERROR',
                    message: error instanceof Error ? error.message : '客户端请求异常',
                },
            };
        }
    }

    async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'GET',
            url: endpoint,
            params,
        } as InternalAxiosRequestConfig);
    }

    async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'POST',
            url: endpoint,
            data: body,
        } as InternalAxiosRequestConfig);
    }

    async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'PUT',
            url: endpoint,
            data: body,
        } as InternalAxiosRequestConfig);
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'DELETE',
            url: endpoint,
        } as InternalAxiosRequestConfig);
    }

    /**
     * 文件上传 (支持进度追踪)
     */
    async upload<T>(
        endpoint: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<ApiResponse<T>> {
        const formData = new FormData();
        formData.append('file', file);

        return this.request<T>({
            method: 'POST',
            url: endpoint,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        } as InternalAxiosRequestConfig);
    }

    /**
     * SSE 流式请求 (基于 Fetch)
     * 保持原生 Fetch 实现以获得更好的流式控制，但集成 API 配置
     */
    createEventSource(endpoint: string, body: unknown, handlers: {
        onEvent: (event: string, data: unknown) => void;
        onError?: (error: Error) => void;
        onComplete?: () => void;
    }): { abort: () => void } {
        const controller = new AbortController();

        fetch(`${this.instance.defaults.baseURL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
            },
            body: JSON.stringify(body),
            signal: controller.signal,
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('No reader available');
                }

                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    let currentEvent = 'message';
                    for (const line of lines) {
                        if (line.startsWith('event:')) {
                            currentEvent = line.slice(6).trim();
                        } else if (line.startsWith('data:')) {
                            const dataStr = line.slice(5).trim();
                            try {
                                const data = JSON.parse(dataStr);
                                handlers.onEvent(currentEvent, data);
                            } catch {
                                handlers.onEvent(currentEvent, dataStr);
                            }
                        }
                    }
                }

                handlers.onComplete?.();
            })
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    handlers.onError?.(error);
                }
            });

        return {
            abort: () => controller.abort(),
        };
    }
}

// 导出单例
export const apiClient = new ApiClient(API_BASE_URL);
