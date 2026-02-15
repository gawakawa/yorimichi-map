import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatNavigationAPI, __setUseMockAPI } from '../src/api/navigation';
import { APIError } from '../src/api/errors';
import { getErrorMessage } from '../src/utils/errorMessages';

// Mock fetch
global.fetch = vi.fn();

// Disable mock API for tests to use real fetch
__setUseMockAPI(false);

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

		it('should throw APIError on failed request', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
				json: async () => ({ detail: 'Server error' }),
			});

			await expect(chatNavigationAPI.sendMessage('test', [])).rejects.toThrow(APIError);
		});

		it('should include status and detail in APIError', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 429,
				statusText: 'Too Many Requests',
				json: async () => ({ detail: 'Rate limit exceeded' }),
			});

			try {
				await chatNavigationAPI.sendMessage('test', []);
			} catch (error) {
				expect(error).toBeInstanceOf(APIError);
				const apiError = error as APIError;
				expect(apiError.status).toBe(429);
				expect(apiError.statusText).toBe('Too Many Requests');
				expect(apiError.detail).toBe('Rate limit exceeded');
			}
		});

		it('should handle non-JSON error response', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 503,
				statusText: 'Service Unavailable',
				json: async () => {
					throw new Error('Invalid JSON');
				},
			});

			try {
				await chatNavigationAPI.sendMessage('test', []);
			} catch (error) {
				expect(error).toBeInstanceOf(APIError);
				const apiError = error as APIError;
				expect(apiError.status).toBe(503);
				expect(apiError.detail).toBeUndefined();
			}
		});
	});

	describe('getReturnRoute', () => {
		it('should throw APIError with detail on 400 response', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 400,
				statusText: 'Bad Request',
				json: async () => ({ detail: 'Location not found' }),
			});

			try {
				await chatNavigationAPI.getReturnRoute({
					origin: 'Unknown Place',
					destination: 'Tokyo',
					waypoints: [],
				});
			} catch (error) {
				expect(error).toBeInstanceOf(APIError);
				const apiError = error as APIError;
				expect(apiError.status).toBe(400);
				expect(apiError.detail).toBe('Location not found');
			}
		});

		it('should throw APIError on 502 response', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 502,
				statusText: 'Bad Gateway',
				json: async () => ({ detail: 'Routes API failed' }),
			});

			await expect(
				chatNavigationAPI.getReturnRoute({
					origin: 'Tokyo',
					destination: 'Osaka',
					waypoints: [],
				}),
			).rejects.toThrow(APIError);
		});
	});
});

describe('getErrorMessage', () => {
	it('should return rate limit message for 429', () => {
		expect(getErrorMessage(429)).toBe(
			'リクエスト回数の上限に達しました。しばらく待ってから再度お試しください。',
		);
	});

	it('should return AI service message for 503', () => {
		expect(getErrorMessage(503)).toBe(
			'AI サービスが一時的に利用できません。しばらく待ってから再度お試しください。',
		);
	});

	it('should return external service message for 502', () => {
		expect(getErrorMessage(502)).toBe(
			'外部サービスとの通信に失敗しました。しばらく待ってから再度お試しください。',
		);
	});

	it('should return input error message for 400', () => {
		expect(getErrorMessage(400)).toBe('入力内容に問題があります。別の地点名でお試しください。');
	});

	it('should return generic message for unknown status', () => {
		expect(getErrorMessage(500)).toBe('予期しないエラーが発生しました。');
	});
});
