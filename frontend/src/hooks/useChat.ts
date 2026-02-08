import { useMutation } from '@tanstack/react-query';
import { postChat } from '../api/navigation';
import type { ChatRequest, ChatResponse } from '../types/navigation';

export function useChat() {
	return useMutation<ChatResponse, Error, ChatRequest>({
		mutationFn: postChat,
	});
}
