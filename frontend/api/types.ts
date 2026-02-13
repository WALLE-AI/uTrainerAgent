/**
 * TypeScript Type Definitions for API
 */

// ==================== Common ====================

export interface ApiError {
    code: string;
    message: string;
    details?: any;
    timestamp?: string;
    requestId?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

// ==================== Auth ====================

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'user';
    createdAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

// ==================== Datasets ====================

export type DatasetStatus = 'Published' | 'Draft' | 'Archived';
export type DatasetModality = 'Text' | 'Image' | 'Video';

export interface Dataset {
    id: string;
    name: string;
    version: string;
    samples: string;
    size: string;
    tags: string[];
    quality: number;
    lastEval: string;
    status: DatasetStatus;
    creator: string;
    modality: DatasetModality;
    thumbnail?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DatasetListParams extends PaginationParams {
    search?: string;
    domain?: string;
    modality?: DatasetModality;
    status?: DatasetStatus;
}

export interface DatasetPreview {
    columns: string[];
    rows: any[][];
}

export interface DatasetVersion {
    version: string;
    createdAt: string;
    description: string;
    samples: string;
}

export interface DatasetCreateRequest {
    name: string;
    modality: DatasetModality;
    tags: string[];
    description?: string;
}

export interface DatasetUpdateRequest {
    tags?: string[];
    description?: string;
    status?: DatasetStatus;
}

// ==================== Data Processing ====================

export type ProcessingTaskStatus = 'Running' | 'Completed' | 'Pending' | 'Failed';

export interface ProcessingTask {
    id: string;
    name: string;
    description: string;
    progress: number;
    status: ProcessingTaskStatus;
    type: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProcessingTool {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
}

export interface ProcessingTaskCreateRequest {
    type: string;
    datasetId: string;
    config: Record<string, any>;
}

// ==================== Pipelines ====================

export type PipelineStatus = 'configuring' | 'running' | 'complete' | 'failed';

export interface PipelineFlow {
    id: string;
    name: string;
    description: string;
    icon: string;
    tags: string[];
}

export interface PipelineStrategy {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface PipelineExecution {
    id: string;
    flowId: string;
    strategyId: string;
    status: PipelineStatus;
    progress: number;
    producedSamples: number;
    estimatedTimeRemaining?: string;
    qualityMetrics?: {
        semanticRelevance: number;
        logicalConsistency: number;
        distributionEntropy: number;
        duplicateRate: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface PipelineExecutionCreateRequest {
    flowId: string;
    strategyId: string;
    config: {
        baseModel: string;
        sampleLimit: number;
        promptTemplate?: string;
    };
}

// ==================== Training ====================

export type TrainingStatus = 'Running' | 'Completed' | 'Failed' | 'Pending';
export type TrainingEngine = 'LlamaFactory' | 'Unsloth' | 'TRL' | 'VERL';
export type TuningMethod = 'Full' | 'LoRA' | 'QLoRA';
export type TRLMethod = 'DPO' | 'PPO' | 'KTO' | 'ORPO' | 'GRPO';
export type ParallelismStrategy = 'DP' | 'TP' | 'PP' | 'MoE';

export interface TrainingJob {
    id: string;
    name: string;
    status: TrainingStatus;
    engine: TrainingEngine;
    baseModel: string;
    dataset: string;
    gpus: string;
    duration: string;
    loss: string;
    throughput: string;
    totalTokens: string;
    createdAt: string;
    config: TrainingConfig;
    history?: TrainingMetricPoint[];
    artifacts?: Artifact[];
}

export interface TrainingConfig {
    tuningMethod: TuningMethod;
    learningRate: string;
    batchSize: number;
    gradAccum: number;
    cutoffLen: number;
    saveEvery: number;
    loraR?: number;
    loraAlpha?: number;
    loraDropout?: number;
    trlMethod?: TRLMethod;
    dpoBeta?: number;
    dpoLossType?: string;
}

export interface TrainingMetricPoint {
    step: number;
    loss: number;
    valLoss: number;
    throughput: number;
    learningRate: number;
    gradNorm: number;
    gpuUtil: number;
    gpuMem: number;
    gpuTemp: number;
    networkBw?: number;
}

export interface Artifact {
    id: string;
    name: string;
    path: string;
    size: string;
    createdAt: string;
}

export interface TrainingJobListParams extends PaginationParams {
    status?: TrainingStatus;
    search?: string;
}

export interface TrainingJobCreateRequest {
    name: string;
    engine: TrainingEngine;
    trlMethod?: TRLMethod;
    datasets: {
        name: string;
        type: 'SFT' | 'Pre-training' | 'Validation';
        ratio: string;
    }[];
    params: {
        tuningMethod: TuningMethod;
        learningRate: string;
        batchSize: number;
        gradAccum: number;
        cutoffLen: number;
        saveEvery: number;
        loraR?: number;
        loraAlpha?: number;
        loraDropout?: number;
        dpoBeta?: number;
        dpoLossType?: string;
    };
    resources: {
        cluster: string;
        gpuType: string;
        gpuCount: number;
        parallelism: ParallelismStrategy;
    };
    tracking: {
        tracker: 'SwanLab' | 'W&B' | 'None';
        artifactsPath: string;
    };
}

export interface TrainingEngineInfo {
    id: string;
    name: string;
    description: string;
    supportedMethods: TuningMethod[];
}

// ==================== Deployments ====================

export type DeploymentStatus = 'Healthy' | 'Degraded' | 'Offline';
export type DeploymentRuntime = 'vLLM' | 'Ollama' | 'TRT-LLM' | 'SGLang';
export type BatchingMode = 'Continuous' | 'Batch';

export interface Deployment {
    id: number;
    name: string;
    model: string;
    status: DeploymentStatus;
    runtime: DeploymentRuntime;
    params: DeploymentParams;
    routing: RoutingConfig;
    metrics: InferenceMetrics;
    createdAt: string;
}

export interface DeploymentParams {
    concurrency: number;
    batching: BatchingMode;
    kvCache: string;
    tensorParallel: number;
    speculativeDecoding: boolean;
}

export interface RoutingConfig {
    weight: number;
    healthCheck: string;
    abTest: string;
    circuitBreaker: boolean;
    rateLimit: string;
}

export interface InferenceMetrics {
    qps: number;
    rps: number;
    p95: string;
    throughput: string;
    tps: number;
    errorRate: string;
    ttft: string;
    tpot: string;
    itl: string;
    e2el: string;
}

export interface DeploymentCreateRequest {
    name: string;
    model: string;
    runtime: DeploymentRuntime;
    params: Partial<DeploymentParams>;
    routing?: Partial<RoutingConfig>;
}

export interface DeploymentUpdateRequest {
    params?: Partial<DeploymentParams>;
    routing?: Partial<RoutingConfig>;
}

// ==================== Inference ====================

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    metrics?: {
        ttft: string;
        tps: string;
        tokens: number;
    };
}

export interface InferenceParams {
    temperature: number;
    topP: number;
    maxTokens: number;
    presencePenalty: number;
    frequencyPenalty?: number;
    stop?: string[];
}

export interface ChatRequest {
    deploymentId: number;
    messages: ChatMessage[];
    systemPrompt?: string;
    params: InferenceParams;
    stream?: boolean;
}

export interface ChatResponse {
    message: ChatMessage;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface SSETokenEvent {
    content: string;
    index: number;
}

export interface SSEMetricsEvent {
    ttft: string;
    tps: string;
}

export interface SSEDoneEvent {
    totalTokens: number;
}

// ==================== Monitoring ====================

export interface GPUNode {
    id: string;
    name: string;
    status: 'Healthy' | 'Warning' | 'Error';
    ip: string;
    role: 'Master/Worker' | 'Worker';
    cpu: string;
    memory: string;
    gpus: GPU[];
}

export interface GPU {
    id: string;
    model: string;
    util: number;
    mem: number;
    temp: number;
    power: number;
}

export type AlertSeverity = 'Critical' | 'Warning' | 'Info';
export type AlertSource = 'Training' | 'Inference' | 'System' | 'Data';

export interface Alert {
    id: number;
    severity: AlertSeverity;
    source: AlertSource;
    entity: string;
    message: string;
    time: string;
    acknowledged: boolean;
}

export interface AlertListParams extends PaginationParams {
    severity?: AlertSeverity;
    source?: AlertSource;
    acknowledged?: boolean;
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface LogEntry {
    id: number;
    time: string;
    level: LogLevel;
    source: string;
    message: string;
}

export interface LogListParams {
    level?: LogLevel;
    source?: string;
    limit?: number;
    before?: string;
}

export interface SystemMetricPoint {
    time: string;
    gpuUtil: number;
    gpuMem: number;
    cpuUtil: number;
    netIo: number;
}

export interface MetricTrendPoint {
    time: string;
    tps: number;
    ttft: number;
    tpot: number;
}

export interface ErrorRecord {
    id: number;
    time: string;
    code: string;
    message: string;
    prompt: string;
}

export interface StorageQuota {
    used: string;
    total: string;
    usedBytes: number;
    totalBytes: number;
}

export interface TaskStats {
    running: number;
    pending: number;
    completed: number;
    failed: number;
}

// ==================== Evaluation ====================

export interface GeneralBenchmark {
    name: string;
    mmlu: number;
    ceval: number;
    gsm8k: number;
    humaneval: number;
    mtbench: number;
}

export interface DomainBenchmark {
    name: string;
    score: number;
    accuracy: number;
    reasoning: number;
    knowledge: number;
}

export type EvaluationStatus = 'Success' | 'Running' | 'Failed';

export interface EvaluationTask {
    id: string;
    name: string;
    model: string;
    status: EvaluationStatus;
    date: string;
    duration: string;
    benchmarks: string[];
}

export interface EvaluationTaskCreateRequest {
    name: string;
    modelId: string;
    benchmarks: string[];
}

// ==================== Tasks ====================

export type GlobalTaskType = 'training' | 'deployment' | 'data' | 'evaluation';
export type GlobalTaskStatus = 'Running' | 'Completed' | 'Failed' | 'Pending';

export interface GlobalTask {
    id: string;
    name: string;
    status: GlobalTaskStatus;
    progress: number;
    type: GlobalTaskType;
    createdAt: string;
    updatedAt: string;
}

// ==================== Clusters ====================

export interface Cluster {
    id: string;
    name: string;
    status: 'Online' | 'Offline';
    nodeCount: number;
    gpuCount: number;
}

export interface GPUType {
    id: string;
    name: string;
    memory: string;
    available: number;
}

export interface BaseModel {
    id: string;
    name: string;
    provider: string;
    size: string;
    description: string;
}

// ==================== WebSocket Events ====================

export interface WSGPUUpdateEvent {
    type: 'gpu_update';
    data: {
        nodeId: string;
        gpuId: string;
        util: number;
        mem: number;
        temp: number;
        power: number;
    };
}

export interface WSTaskUpdateEvent {
    type: 'task_update';
    data: {
        taskId: string;
        status: GlobalTaskStatus;
        progress: number;
    };
}

export interface WSMetricsEvent {
    type: 'metrics';
    data: InferenceMetrics;
}

export type WSEvent = WSGPUUpdateEvent | WSTaskUpdateEvent | WSMetricsEvent;
