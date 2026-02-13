/**
 * API Client Configuration
 * Base Axios instance with interceptors for auth, error handling
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Base URL - can be configured via environment variable
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    authToken = token;
    if (token) {
        localStorage.setItem('auth_token', token);
    } else {
        localStorage.removeItem('auth_token');
    }
};

export const getAuthToken = (): string | null => {
    if (!authToken) {
        authToken = localStorage.getItem('auth_token');
    }
    return authToken;
};

// Request interceptor - add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAuthToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            const { status } = error.response;

            // Handle 401 - Unauthorized
            if (status === 401) {
                setAuthToken(null);
                window.dispatchEvent(new CustomEvent('auth:logout'));
            }

            // Handle other errors
            const apiError = error.response.data as ApiError;
            return Promise.reject(apiError);
        }

        // Network error
        return Promise.reject({
            code: 'NETWORK_ERROR',
            message: 'Network connection failed',
        });
    }
);

// Error interface
export interface ApiError {
    code: string;
    message: string;
    details?: any;
    timestamp?: string;
    requestId?: string;
}

// Paginated response
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// SSE helper for streaming responses
export const createSSEConnection = (
    url: string,
    body: any,
    onMessage: (event: MessageEvent) => void,
    onError?: (error: Event) => void,
    onOpen?: () => void
): AbortController => {
    const controller = new AbortController();

    fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
            'Accept': 'text/event-stream',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
    }).then(async (response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        onOpen?.();

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) return;

        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    try {
                        const event = new MessageEvent('message', { data });
                        onMessage(event);
                    } catch (e) {
                        console.error('Failed to parse SSE message:', e);
                    }
                }
            }
        }
    }).catch((error) => {
        if (error.name !== 'AbortError') {
            onError?.(error);
        }
    });

    return controller;
};

// WebSocket helper
export const createWebSocket = (
    path: string,
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
    onClose?: () => void
): WebSocket => {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${path}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        // Send auth token
        const token = getAuthToken();
        if (token) {
            ws.send(JSON.stringify({ type: 'auth', token }));
        }
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            onMessage(data);
        } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
        }
    };

    ws.onerror = (error) => {
        onError?.(error);
    };

    ws.onclose = () => {
        onClose?.();
    };

    return ws;
};

export default apiClient;
