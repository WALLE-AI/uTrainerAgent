/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Dataset Task Types
export interface DatasetTask {
    id: string;
    name: string;
    status: 'Running' | 'Completed' | 'Suspended' | 'Failed';
    progress: number;
    diskUsage: string;
    dataVolume: string;
    tokens: string;
    stages: {
        name: string;
        status: 'Done' | 'Active' | 'Pending' | 'Error';
        progress: number;
    }[];
}

// Training Task Types
export interface TrainingMetric {
    epoch: number;
    step: number;
    loss: number;
    accuracy: number;
    learningRate: number;
}

export interface TrainingTask {
    id: string;
    name: string;
    engine: 'LlamaFactory' | 'Unsloth' | 'TRL';
    status: 'Running' | 'Completed' | 'Failed';
    currentEpoch: number;
    totalEpochs: number;
    currentStep: number;
    totalSteps: number;
    metrics: TrainingMetric[];
    alerts: string[];
}

// Inference Task Types
export interface InferenceTask {
    id: string;
    name: string;
    status: 'Healthy' | 'Warning' | 'Hanging' | 'Offline';
    latency: number;
    throughput: number;
    uptime: string;
    logs: {
        timestamp: string;
        level: 'INFO' | 'WARN' | 'ERROR';
        message: string;
    }[];
}

export const mockDatasetTasks: DatasetTask[] = [
    {
        id: 'ds-001',
        name: 'OpenWebText-Cleaning-v1',
        status: 'Running',
        progress: 65,
        diskUsage: '124 GB',
        dataVolume: '45.2M rows',
        tokens: '12.4B',
        stages: [
            { name: 'Data Extraction', status: 'Done', progress: 100 },
            { name: 'Cleaning & Normalization', status: 'Done', progress: 100 },
            { name: 'Deduplication (MinHash)', status: 'Active', progress: 45 },
            { name: 'PII Filtering', status: 'Pending', progress: 0 },
        ]
    },
    {
        id: 'ds-002',
        name: 'Medical-QA-Synthesis',
        status: 'Suspended',
        progress: 32,
        diskUsage: '12 GB',
        dataVolume: '1.2M rows',
        tokens: '450M',
        stages: [
            { name: 'Source Extraction', status: 'Done', progress: 100 },
            { name: 'Entity Extraction', status: 'Active', progress: 32 },
            { name: 'Question Generation', status: 'Pending', progress: 0 },
            { name: 'Answer Verification', status: 'Pending', progress: 0 },
        ]
    }
];

export const mockTrainingTasks: TrainingTask[] = [
    {
        id: 'train-001',
        name: 'Llama3-8B-SFT-Customer-Service',
        engine: 'LlamaFactory',
        status: 'Running',
        currentEpoch: 1,
        totalEpochs: 3,
        currentStep: 1250,
        totalSteps: 5000,
        metrics: Array.from({ length: 20 }, (_, i) => ({
            epoch: 1,
            step: i * 50,
            loss: 2.5 - Math.log(i + 1) * 0.4 + Math.random() * 0.1,
            accuracy: 0.6 + (i / 40) + Math.random() * 0.05,
            learningRate: 2e-5 * (1 - i / 100)
        })),
        alerts: [
            'Learning rate warm-up completed.',
            'Loss spike detected at step 850, recovered automatically.'
        ]
    }
];

export const mockInferenceTasks: InferenceTask[] = [
    {
        id: 'inf-001',
        name: 'Production-Assistant-v2',
        status: 'Healthy',
        latency: 42,
        throughput: 125,
        uptime: '15d 4h',
        logs: [
            { timestamp: '2026-02-13 16:20:01', level: 'INFO', message: 'Request processed: prompt_tokens=124, completion_tokens=452' },
            { timestamp: '2026-02-13 16:20:05', level: 'INFO', message: 'Model weights swapped to v2.1.0' },
            { timestamp: '2026-02-13 16:21:00', level: 'INFO', message: 'Periodic health check: OK' }
        ]
    },
    {
        id: 'inf-002',
        name: 'Data-Synthesis-Internal',
        status: 'Hanging',
        latency: 0,
        throughput: 0,
        uptime: '2d 1h',
        logs: [
            { timestamp: '2026-02-13 10:00:00', level: 'INFO', message: 'Process started' },
            { timestamp: '2026-02-13 10:05:00', level: 'WARN', message: 'VRAM usage near limit (92%)' },
            { timestamp: '2026-02-13 10:05:30', level: 'ERROR', message: 'Process suspended: Heartbeat timeout' }
        ]
    }
];
