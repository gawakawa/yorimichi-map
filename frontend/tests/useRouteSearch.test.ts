import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRouteSearch } from '../src/hooks/useRouteSearch';
import { chatNavigationAPI } from '../src/api/navigation';

vi.mock('../src/api/navigation', () => ({
	chatNavigationAPI: {
		suggestWaypoints: vi.fn(),
		calculateRoute: vi.fn(),
	},
}));

describe('useRouteSearch', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should initialize with default values', () => {
		const { result } = renderHook(() => useRouteSearch());

		expect(result.current.origin).toBe('');
		expect(result.current.destination).toBe('');
		expect(result.current.aiPrompt).toBe('');
		expect(result.current.phase).toBe('input');
		expect(result.current.candidates).toEqual([]);
		expect(result.current.selectedCandidates).toEqual([]);
		expect(result.current.route).toBeNull();
		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it('should update origin', () => {
		const { result } = renderHook(() => useRouteSearch());

		act(() => {
			result.current.setOrigin('Tokyo Station');
		});

		expect(result.current.origin).toBe('Tokyo Station');
	});

	it('should update destination', () => {
		const { result } = renderHook(() => useRouteSearch());

		act(() => {
			result.current.setDestination('Osaka Station');
		});

		expect(result.current.destination).toBe('Osaka Station');
	});

	it('should update aiPrompt', () => {
		const { result } = renderHook(() => useRouteSearch());

		act(() => {
			result.current.setAiPrompt('I want to stop at a hot spring');
		});

		expect(result.current.aiPrompt).toBe('I want to stop at a hot spring');
	});

	it('should not search if origin is empty', async () => {
		const { result } = renderHook(() => useRouteSearch());

		act(() => {
			result.current.setDestination('Osaka');
		});

		await act(async () => {
			await result.current.handleSearch();
		});

		expect(result.current.phase).toBe('input');
		expect(chatNavigationAPI.calculateRoute).not.toHaveBeenCalled();
	});

	it('should not search if destination is empty', async () => {
		const { result } = renderHook(() => useRouteSearch());

		act(() => {
			result.current.setOrigin('Tokyo');
		});

		await act(async () => {
			await result.current.handleSearch();
		});

		expect(result.current.phase).toBe('input');
		expect(chatNavigationAPI.calculateRoute).not.toHaveBeenCalled();
	});

	it('should calculate route directly without AI prompt', async () => {
		const mockRoute = {
			origin: 'Tokyo',
			destination: 'Osaka',
			waypoints: [],
			waypoint_coords: [],
			duration_seconds: '3600s',
			distance_meters: 500000,
			encoded_polyline: 'abc123',
			google_maps_url: 'https://maps.google.com/...',
		};

		vi.mocked(chatNavigationAPI.calculateRoute).mockResolvedValue({
			route: mockRoute,
		});

		const { result } = renderHook(() => useRouteSearch());

		act(() => {
			result.current.setOrigin('Tokyo');
			result.current.setDestination('Osaka');
		});

		await act(async () => {
			await result.current.handleSearch();
		});

		expect(chatNavigationAPI.calculateRoute).toHaveBeenCalledWith({
			origin: 'Tokyo',
			destination: 'Osaka',
			waypoints: [],
		});
		expect(result.current.phase).toBe('result');
		expect(result.current.route).toEqual(mockRoute);
	});

	it('should get waypoint suggestions with AI prompt', async () => {
		const mockCandidates = [
			{ name: 'Hakone', description: 'Famous hot spring resort', address: 'Kanagawa' },
			{ name: 'Atami', description: 'Seaside hot spring town', address: 'Shizuoka' },
			{ name: 'Yugawara', description: 'Historic hot spring', address: 'Kanagawa' },
		];

		vi.mocked(chatNavigationAPI.suggestWaypoints).mockResolvedValue({
			candidates: mockCandidates,
			ai_comment: 'Here are some great options!',
		});

		const { result } = renderHook(() => useRouteSearch());

		act(() => {
			result.current.setOrigin('Tokyo');
			result.current.setDestination('Osaka');
			result.current.setAiPrompt('hot spring');
		});

		await act(async () => {
			await result.current.handleSearch();
		});

		expect(chatNavigationAPI.suggestWaypoints).toHaveBeenCalledWith({
			origin: 'Tokyo',
			destination: 'Osaka',
			prompt: 'hot spring',
		});
		expect(result.current.phase).toBe('selecting');
		expect(result.current.candidates).toEqual(mockCandidates);
		expect(result.current.aiComment).toBe('Here are some great options!');
	});

	it('should toggle candidate selection', async () => {
		const mockCandidates = [
			{ name: 'Hakone', description: 'Hot spring', address: '' },
			{ name: 'Atami', description: 'Seaside', address: '' },
		];

		vi.mocked(chatNavigationAPI.suggestWaypoints).mockResolvedValue({
			candidates: mockCandidates,
		});

		const { result } = renderHook(() => useRouteSearch());

		act(() => {
			result.current.setOrigin('Tokyo');
			result.current.setDestination('Osaka');
			result.current.setAiPrompt('hot spring');
		});

		await act(async () => {
			await result.current.handleSearch();
		});

		act(() => {
			result.current.toggleCandidate('Hakone');
		});

		expect(result.current.selectedCandidates).toHaveLength(1);
		expect(result.current.selectedCandidates[0]?.name).toBe('Hakone');

		act(() => {
			result.current.toggleCandidate('Atami');
		});

		expect(result.current.selectedCandidates).toHaveLength(2);

		act(() => {
			result.current.toggleCandidate('Hakone');
		});

		expect(result.current.selectedCandidates).toHaveLength(1);
		expect(result.current.selectedCandidates[0]?.name).toBe('Atami');
	});

	it('should calculate route with selected waypoints', async () => {
		const mockCandidates = [{ name: 'Hakone', description: 'Hot spring', address: '' }];
		const mockRoute = {
			origin: 'Tokyo',
			destination: 'Osaka',
			waypoints: ['Hakone'],
			waypoint_coords: [{ latitude: 35.2, longitude: 139.0 }],
			duration_seconds: '5400s',
			distance_meters: 550000,
			encoded_polyline: 'xyz789',
			google_maps_url: 'https://maps.google.com/...',
		};

		vi.mocked(chatNavigationAPI.suggestWaypoints).mockResolvedValue({
			candidates: mockCandidates,
		});
		vi.mocked(chatNavigationAPI.calculateRoute).mockResolvedValue({
			route: mockRoute,
		});

		const { result } = renderHook(() => useRouteSearch());

		act(() => {
			result.current.setOrigin('Tokyo');
			result.current.setDestination('Osaka');
			result.current.setAiPrompt('hot spring');
		});

		await act(async () => {
			await result.current.handleSearch();
		});

		act(() => {
			result.current.toggleCandidate('Hakone');
		});

		await act(async () => {
			await result.current.confirmSelection();
		});

		expect(chatNavigationAPI.calculateRoute).toHaveBeenCalledWith({
			origin: 'Tokyo',
			destination: 'Osaka',
			waypoints: ['Hakone'],
		});
		expect(result.current.phase).toBe('result');
		expect(result.current.route).toEqual(mockRoute);
	});

	it('should reset state', async () => {
		const mockCandidates = [{ name: 'Hakone', description: 'Hot spring', address: '' }];

		vi.mocked(chatNavigationAPI.suggestWaypoints).mockResolvedValue({
			candidates: mockCandidates,
			ai_comment: 'Comment',
		});

		const { result } = renderHook(() => useRouteSearch());

		act(() => {
			result.current.setOrigin('Tokyo');
			result.current.setDestination('Osaka');
			result.current.setAiPrompt('test');
		});

		await act(async () => {
			await result.current.handleSearch();
		});

		act(() => {
			result.current.toggleCandidate('Hakone');
		});

		expect(result.current.phase).toBe('selecting');
		expect(result.current.candidates).toHaveLength(1);
		expect(result.current.selectedCandidates).toHaveLength(1);

		act(() => {
			result.current.reset();
		});

		expect(result.current.phase).toBe('input');
		expect(result.current.candidates).toEqual([]);
		expect(result.current.selectedCandidates).toEqual([]);
		expect(result.current.route).toBeNull();
		expect(result.current.error).toBeNull();
		expect(result.current.aiComment).toBe('');
		expect(result.current.origin).toBe('Tokyo');
		expect(result.current.destination).toBe('Osaka');
	});

	it('should handle API error', async () => {
		vi.mocked(chatNavigationAPI.calculateRoute).mockRejectedValue(new Error('Network error'));

		const { result } = renderHook(() => useRouteSearch());

		act(() => {
			result.current.setOrigin('Tokyo');
			result.current.setDestination('Osaka');
		});

		await act(async () => {
			await result.current.handleSearch();
		});

		expect(result.current.phase).toBe('error');
		expect(result.current.error).toBeTruthy();
	});
});
