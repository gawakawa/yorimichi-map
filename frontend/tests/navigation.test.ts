import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatNavigationAPI } from '../src/api/navigation';

// Mock fetch
global.fetch = vi.fn();

describe('navigation API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('chatNavigationAPI', () => {
		it('should send chat message to correct endpoint', async () => {
			const mockResponse = {
				reply: 'こんにちは',
				route: null,
				places: null,
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await chatNavigationAPI.sendMessage('こんにちは', []);

			expect(global.fetch).toHaveBeenCalledWith(
				'http://localhost:8000/api/navigation/chat/',
				expect.objectContaining({
					method: 'POST',
					headers: expect.objectContaining({
						'Content-Type': 'application/json',
					}),
				}),
			);

			expect(result).toEqual(mockResponse);
		});

		it('should send message with history', async () => {
			const mockResponse = {
				reply: 'ルートを検索します',
				route: null,
				places: null,
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const history = [{ role: 'user' as const, content: 'ルート検索' }];

			await chatNavigationAPI.sendMessage('東京から箱根へ', history);

			const callArgs = (global.fetch as any).mock.calls[0];
			const body = JSON.parse(callArgs[1].body);

			expect(body.message).toBe('東京から箱根へ');
			expect(body.history).toEqual(history);
		});

		it('should throw error on failed request', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
			});

			await expect(chatNavigationAPI.sendMessage('test', [])).rejects.toThrow();
		});
	});
});
