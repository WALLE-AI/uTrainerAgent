// ============ API 统一导出 ============

// 客户端
export { apiClient, API_BASE_URL } from './client';
export type { ApiResponse, PaginatedResponse } from './client';

// 类型定义
export * from './types';

// 服务模块
export { authService, userService } from './auth';
export { sessionService } from './sessions';
export { agentService } from './agent';
export type {
    SSEEventHandler,
    SSEEventHandlers,
    // 智能体类型
    AgentMode,
    AgentCategory,
    AgentCost,
    FullAgentConfig,
    // 委托类型
    DelegationCategory,
    DelegateTaskRequest,
    DelegateTaskResponse,
    // 工作计划类型
    WorkPlan,
    WorkPlanTask,
    // 笔记本类型
    NotepadEntry,
} from './agent';

export { backgroundService } from './background';
export { todoService } from './todos';
export { fileService } from './files';
export { connectorService } from './connectors';
export { skillService } from './skills';
export type {
    // 基础类型
    Skill,
    SkillScope,
    SkillCategory,
    SkillMetadata,
    SkillConfig,
    SkillInput,
    SkillOutput,
    SkillSetting,
    SkillExecution,
    SkillInstruction,
    // MCP 类型
    McpServerConfig,
    McpTool,
    McpResource,
    McpPrompt,
    McpCapabilities,
} from './skills';

export { contextService } from './context';
export type {
    ContextSourceType,
    ContextPriority,
    ContextEntry,
    SessionContext,
    CompactionSummary,
    InjectContextRequest,
    TokenUsage,
} from './context';
export { memoryService } from './memory';
export type {
    MemoryType,
    MemoryEntry,
    MemorySearchResult,
    UserMemoryProfile,
    SessionRetrospect,
    CreateMemoryRequest,
    SearchMemoryRequest,
} from './memory';
