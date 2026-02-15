import { useState, useCallback } from 'react';
import type { ChatMessage } from '../types/chat';

export type { ChatMessage };

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback((text: string, role: 'user' | 'assistant') => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      role,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const setErrorMessage = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  return {
    messages,
    addMessage,
    isLoading,
    setLoading,
    error,
    setErrorMessage,
  };
}
