/**
 * API Service Layer - Central Export
 * 
 * Usage:
 * import { authApi, datasetsApi, trainingApi, ... } from './api';
 * or
 * import api from './api';
 * api.auth.login({ email, password });
 */

// API Client
export { default as apiClient, setAuthToken, getAuthToken, createSSEConnection, createWebSocket } from './client';

// Service Modules
export { default as authApi } from './auth';
export { default as datasetsApi } from './datasets';
export { default as dataProcessingApi } from './dataProcessing';
export { default as pipelinesApi } from './pipelines';
export { default as trainingApi } from './training';
export { default as deploymentsApi } from './deployments';
export { default as inferenceApi } from './inference';
export { default as monitoringApi } from './monitoring';
export { default as evaluationApi } from './evaluation';
export { default as tasksApi } from './tasks';

// Types
export * from './types';

// Combined API object for convenience
import authApi from './auth';
import datasetsApi from './datasets';
import dataProcessingApi from './dataProcessing';
import pipelinesApi from './pipelines';
import trainingApi from './training';
import deploymentsApi from './deployments';
import inferenceApi from './inference';
import monitoringApi from './monitoring';
import evaluationApi from './evaluation';
import tasksApi from './tasks';

const api = {
    auth: authApi,
    datasets: datasetsApi,
    dataProcessing: dataProcessingApi,
    pipelines: pipelinesApi,
    training: trainingApi,
    deployments: deploymentsApi,
    inference: inferenceApi,
    monitoring: monitoringApi,
    evaluation: evaluationApi,
    tasks: tasksApi,
};

export default api;
