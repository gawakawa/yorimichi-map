import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from '../src/hooks/useChat';

describe('useChat', () => {
	it('should initialize with empty messages', () => {
		const { result } = renderHook(() => useChat());

		expect(result.current.messages).toEqual([]);
	});

	it('should add a message', () => {
		const { result } = renderHook(() => useChat());

		act(() => {
			result.current.addMessage('Hello', 'user');
		});

		expect(result.current.messages).toHaveLength(1);
		expect(result.current.messages[0]).toMatchObject({
			text: 'Hello',
			role: 'user',
		});
	});

	it('should add multiple messages', () => {
		const { result } = renderHook(() => useChat());

		act(() => {
			result.current.addMessage('Hi', 'user');
			result.current.addMessage('Hello', 'assistant');
			result.current.addMessage('How are you?', 'user');
		});

		expect(result.current.messages).toHaveLength(3);
	});

	it('should preserve message order', () => {
		const { result } = renderHook(() => useChat());

		act(() => {
			result.current.addMessage('First', 'user');
			result.current.addMessage('Second', 'assistant');
		});

		expect(result.current.messages[0].text).toBe('First');
		expect(result.current.messages[1].text).toBe('Second');
	});

	it('should add id to messages', () => {
		const { result } = renderHook(() => useChat());

		act(() => {
			result.current.addMessage('Test', 'user');
		});

		expect(result.current.messages[0]).toHaveProperty('id');
		expect(typeof result.current.messages[0].id).toBe('string');
	});

	it('should add timestamp to messages', () => {
		const { result } = renderHook(() => useChat());
		const beforeTime = Date.now();

		act(() => {
			result.current.addMessage('Test', 'user');
		});

		const afterTime = Date.now();
		const messageTime = new Date(result.current.messages[0].timestamp).getTime();

		expect(messageTime).toBeGreaterThanOrEqual(beforeTime);
		expect(messageTime).toBeLessThanOrEqual(afterTime);
	});

	it('should maintain history across multiple calls', () => {
		const { result } = renderHook(() => useChat());

		act(() => {
			result.current.addMessage('Message 1', 'user');
		});

		const firstLength = result.current.messages.length;

		act(() => {
			result.current.addMessage('Message 2', 'user');
		});

		expect(result.current.messages).toHaveLength(firstLength + 1);
	});

	it('should initialize with isLoading false and error null', () => {
		const { result } = renderHook(() => useChat());

		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it('should set and clear loading state', () => {
		const { result } = renderHook(() => useChat());

		act(() => {
			result.current.setLoading(true);
		});

		expect(result.current.isLoading).toBe(true);

		act(() => {
			result.current.setLoading(false);
		});

		expect(result.current.isLoading).toBe(false);
	});

	it('should set and clear error message', () => {
		const { result } = renderHook(() => useChat());

		act(() => {
			result.current.setErrorMessage('API error');
		});

		expect(result.current.error).toBe('API error');

		act(() => {
			result.current.setErrorMessage(null);
		});

		expect(result.current.error).toBeNull();
	});
});
