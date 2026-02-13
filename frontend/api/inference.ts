/**
 * Inference API Service
 */
import apiClient, { createSSEConnection, getAuthToken } from './client';
import type {
    ChatRequest,
    ChatResponse,
    ChatMessage,
    Deployment,
} from './types';

// SSE Event types
export interface StreamCallbacks {
    onToken?: (content: string, index: number) => void;
    onMetrics?: (ttft: string, tps: string) => void;
    onComplete?: (totalTokens: number) => void;
    onError?: (error: Error) => void;
}

export const inferenceApi = {
    /**
     * Non-streaming chat completion
     */
    chat: async (request: ChatRequest): Promise<ChatResponse> => {
        const response = await apiClient.post<ChatResponse>('/inference/chat', {
            ...request,
            stream: false,
        });
        return response.data;
    },

    /**
     * Streaming chat completion via SSE
     * Returns AbortController to cancel the stream
     */
    chatStream: (
        request: Omit<ChatRequest, 'stream'>,
        callbacks: StreamCallbacks
    ): AbortController => {
        const controller = new AbortController();
        const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

        fetch(`${API_BASE_URL}/inference/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
                'Accept': 'text/event-stream',
            },
            body: JSON.stringify(request),
            signal: controller.signal,
        }).then(async (response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

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
                    if (line.startsWith('event: ')) {
                        const eventType = line.slice(7).trim();
                        continue;
                    }

                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            continue;
                        }

                        try {
                            const parsed = JSON.parse(data);

                            // Handle different event types
                            if (parsed.content !== undefined) {
                                callbacks.onToken?.(parsed.content, parsed.index || 0);
                            }
                            if (parsed.ttft && parsed.tps) {
                                callbacks.onMetrics?.(parsed.ttft, parsed.tps);
                            }
                            if (parsed.totalTokens !== undefined) {
                                callbacks.onComplete?.(parsed.totalTokens);
                            }
                            if (parsed.error) {
                                callbacks.onError?.(new Error(parsed.error));
                            }
                        } catch (e) {
                            // Handle plain text tokens
                            if (data.trim()) {
                                callbacks.onToken?.(data, 0);
                            }
                        }
                    }
                }
            }
        }).catch((error) => {
            if (error.name !== 'AbortError') {
                callbacks.onError?.(error);
            }
        });

        return controller;
    },

    /**
     * Get available models for inference
     */
    getModels: async (): Promise<Deployment[]> => {
        const response = await apiClient.get<Deployment[]>('/inference/models');
        return response.data;
    },
};

export default inferenceApi;
