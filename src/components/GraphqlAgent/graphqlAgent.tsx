import { useEffect, useRef, useState } from 'react';
import { useChat } from '@hooks/useChat';
import { useProject } from '@hooks/useProjects';
import { Loader2, MessageCircle, Send, Trash2 } from 'lucide-react';

import { gtmEvents } from '../../lib/gtm';
import { formatCid, formatTimestamp } from '../../lib/utils';
import type { ChatMessage } from '../../types';
import styles from './graphqlAgent.module.less';

interface ChatInterfaceProps {
  projectCid: string;
  messages: ChatMessage[];
  onMessagesChange: (messagesOrUpdater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  onClearMessages: () => void;
  endpoint: string;
  token: string;
}

// 新增：可折叠的think块组件
function ThinkBlock({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const userIsScrollingRef = useRef(false);
  const lastContentUpdateRef = useRef(Date.now());
  const autoScrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // 检测用户是否在底部附近（阈值为30px）
  const isNearBottom = () => {
    if (!contentRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    return scrollHeight - scrollTop - clientHeight < 30;
  };

  // 滚动到底部的函数
  const scrollToBottom = () => {
    if (contentRef.current && !userIsScrollingRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  };

  // 用户滚动检测
  useEffect(() => {
    if (!collapsed && contentRef.current) {
      const handleScroll = () => {
        if (!contentRef.current) return;

        // 检测用户是否主动滚动离开底部
        if (!isNearBottom()) {
          userIsScrollingRef.current = true;
          // 用户滚动后3秒内不自动滚动
          clearTimeout(autoScrollTimeoutRef.current);
          autoScrollTimeoutRef.current = setTimeout(() => {
            // 只有在用户回到底部附近时才重新启用自动滚动
            if (isNearBottom()) {
              userIsScrollingRef.current = false;
            }
          }, 3000);
        } else {
          // 用户在底部附近，允许自动滚动
          userIsScrollingRef.current = false;
        }
      };

      contentRef.current.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        contentRef.current?.removeEventListener('scroll', handleScroll);
        clearTimeout(autoScrollTimeoutRef.current);
      };
    }
  }, [collapsed]);

  // 内容变化时的响应
  useEffect(() => {
    if (!collapsed && contentRef.current) {
      lastContentUpdateRef.current = Date.now();

      // 只有在用户没有主动滚动或在底部附近时才自动滚动
      if (!userIsScrollingRef.current || isNearBottom()) {
        userIsScrollingRef.current = false; // 重置状态
        requestAnimationFrame(scrollToBottom);
      }
    }
  }, [children, collapsed]);

  // 智能自动滚动机制 - 只在内容活跃更新时启用
  useEffect(() => {
    if (!collapsed && contentRef.current) {
      // 1. MutationObserver 响应内容变化
      const observer = new MutationObserver(() => {
        lastContentUpdateRef.current = Date.now();
        // 只有在允许的情况下才滚动
        if (!userIsScrollingRef.current || isNearBottom()) {
          requestAnimationFrame(scrollToBottom);
        }
      });

      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      // 2. 定时检查 - 降低频率，只在内容活跃时滚动
      const checkInterval = setInterval(() => {
        const timeSinceLastUpdate = Date.now() - lastContentUpdateRef.current;
        // 只有在最近500ms内有内容更新时才继续自动滚动
        if (timeSinceLastUpdate < 500 && (!userIsScrollingRef.current || isNearBottom())) {
          scrollToBottom();
        }
      }, 100); // 降低到100ms间隔

      // 3. ResizeObserver 监听容器大小变化
      const resizeObserver = new ResizeObserver(() => {
        if (!userIsScrollingRef.current || isNearBottom()) {
          scrollToBottom();
        }
      });
      resizeObserver.observe(contentRef.current);

      return () => {
        observer.disconnect();
        resizeObserver.disconnect();
        clearInterval(checkInterval);
      };
    }
  }, [collapsed]);

  return (
    <div className={styles.thinkBlock}>
      <div className={styles.thinkToggle} onClick={() => setCollapsed((c) => !c)}>
        <span className={styles.thinkIcon}>💡</span>
        <span>
          {collapsed ? 'Show tool reasoning / intermediate results' : 'Hide tool reasoning / intermediate results'}
        </span>
        <svg className={`${styles.toggleArrow} ${collapsed ? '' : styles.rotated}`} viewBox="0 0 8 8">
          <path d="M2 2l2 2 2-2" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
      </div>
      <div ref={contentRef} className={`${styles.thinkContent} ${collapsed ? styles.collapsed : styles.expanded}`}>
        {children}
      </div>
    </div>
  );
}

// 辅助：将<think>标签内容替换为ThinkBlock组件
function renderWithThinkBlocks(content: string) {
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  const regex = /<think>([\s\S]*?)<\/think>/g;
  let match;
  let idx = 0;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIdx) {
      parts.push(content.slice(lastIdx, match.index));
    }
    parts.push(<ThinkBlock key={idx++}>{match[1]}</ThinkBlock>);
    lastIdx = regex.lastIndex;
  }
  // 检查是否有未闭合的think块
  const openIdx = content.lastIndexOf('<think>');
  const closeIdx = content.lastIndexOf('</think>');
  if (openIdx > closeIdx) {
    // 有未闭合的think块
    parts.push(<ThinkBlock key={idx++}>{content.slice(openIdx + 7)}</ThinkBlock>);
  } else if (lastIdx < content.length) {
    parts.push(content.slice(lastIdx));
  }
  return parts;
}

export function ChatInterface({
  projectCid,
  messages,
  onMessagesChange,
  onClearMessages,
  endpoint,
  token,
}: ChatInterfaceProps) {
  const { data: project } = useProject(projectCid);
  const { isStreaming, isLoading, sendStreamingMessage } = useChat(projectCid, messages, onMessagesChange);

  const [input, setInput] = useState('');
  const [dataLimit, setDataLimit] = useState(10);
  const [showThink, setShowThink] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (immediate: boolean = false) => {
    const behavior = immediate ? 'auto' : 'smooth';
    setTimeout(
      () => {
        messagesEndRef.current?.scrollIntoView({ behavior });
      },
      immediate ? 0 : 50,
    );
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // More aggressive scrolling during streaming to keep up with content updates
  useEffect(() => {
    if (isStreaming) {
      // Immediate scroll when streaming starts
      scrollToBottom(true);

      // Then continuous smooth scrolling
      const interval = setInterval(() => scrollToBottom(true), 100);
      return () => clearInterval(interval);
    }
  }, [isStreaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isStreaming) return;

    const message = input.trim();
    setInput('');

    await sendStreamingMessage(message, dataLimit, showThink, endpoint, token);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Use project-specific suggested questions or fallback to defaults
  const suggestedQuestions = project?.suggested_questions || [
    'What types of data can I query from this project?',
    'Show me a sample GraphQL query',
    'What entities are available in this schema?',
    'How can I filter the data?',
  ];

  return (
    <div className={styles.chatContainer}>
      {/* Chat Header */}
      <div className={styles.chatHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h3>
              <MessageCircle className={styles.icon} />
              Chat with {project?.domain_name || formatCid(projectCid)}
            </h3>
            <p>Ask questions about the indexed data in this project</p>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={() => {
                gtmEvents.chatCleared(projectCid, messages.length);
                onClearMessages();
              }}
              className={styles.clearButton}
              title="Clear chat history"
              disabled={messages.length === 0}
            >
              <Trash2 className={styles.icon} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageCircle className={styles.emptyIcon} />
            <h4>Start a conversation</h4>
            <p>Ask questions about the data indexed by this SubQuery project</p>

            <div className={styles.suggestionsContainer}>
              <p className={styles.suggestionsTitle}>Try asking:</p>
              {suggestedQuestions.map((question: string, index: number) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(question);
                    gtmEvents.suggestedQuestionClicked(projectCid, question);
                  }}
                  className={styles.suggestionButton}
                >
                  &quot;{question}&quot;
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`${styles.messageWrapper} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
            >
              <div
                className={`${styles.messageBubble} ${
                  message.role === 'user' ? styles.userBubble : styles.assistantBubble
                }`}
              >
                <div className={styles.messageContent}>
                  {message.role === 'assistant' ? renderWithThinkBlocks(message.content) : message.content}
                </div>
                <div
                  className={`${styles.messageTimestamp} ${message.role === 'user' ? styles.userTimestamp : styles.assistantTimestamp}`}
                >
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className={styles.streamingIndicator}>
            <div className={styles.streamingBubble}>
              <Loader2 className={styles.streamingIcon} />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <div className={styles.inputWrapper}>
            <div className={styles.textareaContainer}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about this project's data..."
                className={styles.textarea}
                disabled={isLoading || isStreaming}
                rows={2}
              />
              <button type="submit" disabled={!input.trim() || isLoading || isStreaming} className={styles.sendButton}>
                {isLoading || isStreaming ? <Loader2 className={styles.icon} /> : <Send className={styles.icon} />}
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <div className={styles.leftControls}>
              {/* Data Limit Control */}
              <div className={styles.limitControl}>
                <label>Limit:</label>
                <div className={styles.sliderContainer}>
                  <span className={styles.sliderLabel}>1</span>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={dataLimit}
                    onChange={(e) => {
                      const newLimit = parseInt(e.target.value);
                      setDataLimit(newLimit);
                      gtmEvents.dataLimitChanged(newLimit);
                    }}
                    className={styles.slider}
                  />
                  <span className={styles.sliderLabel}>50</span>
                  <span className={styles.limitValue}>{dataLimit}</span>
                </div>
              </div>

              {/* Think Toggle Control */}
              <div className={styles.thinkControl}>
                <input
                  type="checkbox"
                  id="showThink"
                  checked={showThink}
                  onChange={(e) => setShowThink(e.target.checked)}
                />
                <label htmlFor="showThink">Show reasoning</label>
              </div>
            </div>
            <div className={styles.rightControls}>Press Enter to send, Shift+Enter for new line</div>
          </div>
        </form>
      </div>
    </div>
  );
}
