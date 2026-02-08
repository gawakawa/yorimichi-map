import type {
	ChatRequest,
	ChatResponse,
	ReturnRouteRequest,
	ReturnRouteResponse,
} from '../types/navigation';
import { apiPost } from './client';

export function postChat(req: ChatRequest): Promise<ChatResponse> {
	return apiPost('/api/navigation/chat/', req);
}

export function postReturnRoute(req: ReturnRouteRequest): Promise<ReturnRouteResponse> {
	return apiPost('/api/navigation/return-route/', req);
}
