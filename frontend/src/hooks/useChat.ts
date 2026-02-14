import { useState, useCallback } from 'react';
import type { ChatMessage } from '../types/chat';

export type { ChatMessage };

export function useChat() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);

	const addMessage = useCallback((text: string, role: 'user' | 'assistant') => {
		const newMessage: ChatMessage = {
			id: crypto.randomUUID(),
			text,
			role,
			timestamp: new Date().toISOString(),
		};

		setMessages((prev) => [...prev, newMessage]);
	}, []);

	return {
		messages,
		addMessage,
	};
}
