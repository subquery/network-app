import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  HealthResponse,
  ProjectConfig,
  ProjectsListResponse,
  RegisterProjectRequest,
  RegisterProjectResponse,
  UpdateProjectConfigRequest,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_GRAPHQL_AGENT || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export function getUserId() {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem('userId', userId);
  }
  return userId;
}

export const projectsApi = {
  // Register a new project
  register: async (request: RegisterProjectRequest): Promise<RegisterProjectResponse> => {
    const userId = getUserId();
    const response = await api.post<RegisterProjectResponse>(
      `/register?user_id=${encodeURIComponent(userId)}`,
      request,
    );
    return response.data;
  },

  // List all projects
  list: async (): Promise<ProjectsListResponse> => {
    const userId = getUserId();
    const response = await api.get<ProjectsListResponse>(`/projects?user_id=${encodeURIComponent(userId)}`);
    return response.data;
  },

  // Get project configuration
  getConfig: async (cid: string): Promise<ProjectConfig> => {
    const userId = getUserId();
    const response = await api.get<ProjectConfig>(`/projects/${cid}?user_id=${encodeURIComponent(userId)}`);
    return response.data;
  },

  // Update project configuration
  updateConfig: async (cid: string, updates: UpdateProjectConfigRequest): Promise<ProjectConfig> => {
    const userId = getUserId();
    const response = await api.patch<ProjectConfig>(`/projects/${cid}?user_id=${encodeURIComponent(userId)}`, updates);
    return response.data;
  },

  // Delete project
  delete: async (cid: string): Promise<{ cid: string; deleted: boolean; message: string }> => {
    const userId = getUserId();
    const response = await api.delete(`/projects/${cid}?user_id=${encodeURIComponent(userId)}`);
    return response.data;
  },

  // Chat with project (non-streaming)
  chat: async (cid: string, request: ChatCompletionRequest): Promise<ChatCompletionResponse> => {
    const userId = getUserId();
    const response = await api.post<ChatCompletionResponse>(
      `/${cid}/chat/completions?user_id=${encodeURIComponent(userId)}`,
      request,
    );
    return response.data;
  },

  // Health check
  health: async (): Promise<HealthResponse> => {
    const response = await api.get<HealthResponse>('/health');
    return response.data;
  },
};

export const chatApi = {
  // Stream chat responses
  streamChat: async function* (cid: string, request: ChatCompletionRequest): AsyncGenerator<string, void, unknown> {
    const userId = getUserId();
    const url = `${API_BASE_URL}/${cid}/chat/completions?user_id=${encodeURIComponent(userId)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                yield parsed.choices[0].delta.content;
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};
