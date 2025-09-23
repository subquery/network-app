import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { chatApi, projectsApi } from '../services/agent-api';
import type { ChatCompletionRequest, ChatMessage } from '../types';

export function useChat(
  projectCid: string,
  messages: ChatMessage[],
  onMessagesChange: (messagesOrUpdater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void,
) {
  const [isStreaming, setIsStreaming] = useState(false);

  const addMessage = useCallback(
    (message: ChatMessage) => {
      onMessagesChange((prevMessages) => [...prevMessages, message]);
    },
    [onMessagesChange],
  );

  const updateLastMessage = useCallback(
    (content: string) => {
      onMessagesChange((prevMessages) => {
        const updated = [...prevMessages];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updated[lastIndex].content + content,
          };
        }
        return updated;
      });
    },
    [onMessagesChange],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      addMessage(userMessage);

      // Build conversation history including the new user message
      const conversationHistory = [
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        })),
        { role: 'user', content, timestamp: Date.now() },
      ];

      const request: ChatCompletionRequest = {
        model: 'gpt-4o-mini',
        messages: conversationHistory,
        stream: false,
        think: true, // Default to true for non-streaming
      };

      try {
        const response = await projectsApi.chat(projectCid, request);

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.choices[0].message.content,
          timestamp: Date.now(),
        };

        addMessage(assistantMessage);
        return response;
      } catch (error) {
        console.error('Chat error:', error);
        throw error;
      }
    },
    [projectCid, messages, addMessage],
  );

  // Non-streaming chat mutation
  const chatMutation = useMutation({
    mutationFn: sendMessage,
  });

  // Streaming chat
  const sendStreamingMessage = useCallback(
    async (content: string, dataLimit: number = 10, showThink: boolean = true, tempEndpoint = '', tempToken = '') => {
      const userMessage: ChatMessage = {
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      addMessage(userMessage);
      setIsStreaming(true);

      // Add empty assistant message that will be updated
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      addMessage(assistantMessage);

      try {
        // Build conversation history including the new user message
        // Add data limit instruction to the last user message for backend, but keep UI clean
        const enhancedContent = `${content}\n\n[SYSTEM: When constructing GraphQL queries, limit results to maximum ${dataLimit} records using appropriate pagination (first: ${dataLimit} or limit: ${dataLimit})]`;

        const conversationHistory = [
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          })),
          { role: 'user', content: enhancedContent, timestamp: Date.now() },
        ];

        const request: ChatCompletionRequest = {
          model: 'gpt-4o-mini',
          messages: conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })),
          stream: true,
          think: showThink,
          tempEndpoint,
          tempToken,
        };

        const stream = chatApi.streamChat(projectCid, request);

        for await (const chunk of stream) {
          updateLastMessage(chunk);
        }
      } catch (error) {
        console.error('Streaming chat error:', error);

        // Update the last message with error
        onMessagesChange((prevMessages) => {
          const updated = [...prevMessages];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
            };
          }
          return updated;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [projectCid, addMessage, updateLastMessage, messages],
  );

  return {
    isStreaming,
    isLoading: chatMutation.isPending,
    error: chatMutation.error,
    sendMessage,
    sendStreamingMessage,
    addMessage,
  };
}
