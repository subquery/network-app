export interface Project {
  cid: string;
  domain_name: string;
  endpoint: string;
  cached: boolean;
  provider_type?: string;
  has_authorization?: boolean;
}

export interface ProjectConfig {
  cid: string;
  domain_name: string;
  domain_capabilities: string[];
  decline_message: string;
  endpoint: string;
  suggested_questions: string[];
  cached: boolean;
  provider_type?: string;
  has_authorization?: boolean;
  authorization_preview?: string;
}

export interface RegisterProjectRequest {
  cid: string;
  endpoint: string;
  authorization?: string;
}

export interface RegisterProjectResponse {
  cid: string;
  domain_name: string;
  endpoint: string;
  message: string;
}

export interface UpdateProjectConfigRequest {
  domain_name?: string;
  domain_capabilities?: string[];
  decline_message?: string;
  endpoint?: string;
  suggested_questions?: string[];
  authorization?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatCompletionRequest {
  model: string;
  messages: { role: string; content: string }[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
  think?: boolean;
  userId?: string;
  tempEndpoint?: string;
  tempToken?: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ProjectsListResponse {
  projects: Project[];
  total: number;
}

export interface HealthResponse {
  status: string;
  projects_count: number;
  cached_agents: number;
  ipfs_gateway: string;
}
