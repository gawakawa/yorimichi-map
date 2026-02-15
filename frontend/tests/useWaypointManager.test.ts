import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWaypointManager } from '../src/hooks/useWaypointManager';
import type { WaypointCandidate } from '../src/api/navigation';

const createCandidate = (name: string): WaypointCandidate => ({
	name,
	description: `Description for ${name}`,
	address: `Address for ${name}`,
});

describe('useWaypointManager', () => {
	it('should initialize with empty arrays', () => {
		const { result } = renderHook(() => useWaypointManager());

		expect(result.current.confirmedWaypoints).toEqual([]);
		expect(result.current.candidates).toEqual([]);
		expect(result.current.selectedCandidates).toEqual([]);
	});

	it('should set candidates with setCandidates', () => {
		const { result } = renderHook(() => useWaypointManager());
		const candidates = [createCandidate('Place A'), createCandidate('Place B')];

		act(() => {
			result.current.setCandidates(candidates);
		});

		expect(result.current.candidates).toEqual(candidates);
	});

	it('should toggle selection with toggleSelection', () => {
		const { result } = renderHook(() => useWaypointManager());
		const candidate = createCandidate('Place A');

		act(() => {
			result.current.setCandidates([candidate]);
		});

		// Select
		act(() => {
			result.current.toggleSelection(candidate);
		});

		expect(result.current.selectedCandidates).toHaveLength(1);
		expect(result.current.selectedCandidates[0]?.name).toBe('Place A');

		// Deselect
		act(() => {
			result.current.toggleSelection(candidate);
		});

		expect(result.current.selectedCandidates).toHaveLength(0);
	});

	it('should move selected candidates to confirmed with confirmSelection', () => {
		const { result } = renderHook(() => useWaypointManager());
		const candidates = [createCandidate('Place A'), createCandidate('Place B')];

		act(() => {
			result.current.setCandidates(candidates);
			result.current.toggleSelection(candidates[0]!);
		});

		act(() => {
			result.current.confirmSelection();
		});

		expect(result.current.confirmedWaypoints).toHaveLength(1);
		expect(result.current.confirmedWaypoints[0]?.name).toBe('Place A');
		expect(result.current.selectedCandidates).toHaveLength(0);
		expect(result.current.candidates).toHaveLength(0);
	});

	it('should accumulate confirmed waypoints across multiple confirmations', () => {
		const { result } = renderHook(() => useWaypointManager());

		// First batch
		const firstBatch = [createCandidate('Place A'), createCandidate('Place B')];
		act(() => {
			result.current.setCandidates(firstBatch);
			result.current.toggleSelection(firstBatch[0]!);
		});

		act(() => {
			result.current.confirmSelection();
		});

		// Second batch
		const secondBatch = [createCandidate('Place C'), createCandidate('Place D')];
		act(() => {
			result.current.setCandidates(secondBatch);
			result.current.toggleSelection(secondBatch[1]!);
		});

		act(() => {
			result.current.confirmSelection();
		});

		// Both should be confirmed
		expect(result.current.confirmedWaypoints).toHaveLength(2);
		expect(result.current.confirmedWaypoints.map((c) => c.name)).toEqual(['Place A', 'Place D']);
	});

	it('should not add duplicate waypoints to confirmed', () => {
		const { result } = renderHook(() => useWaypointManager());

		// First confirmation
		const firstBatch = [createCandidate('Place A')];
		act(() => {
			result.current.setCandidates(firstBatch);
			result.current.toggleSelection(firstBatch[0]!);
		});

		act(() => {
			result.current.confirmSelection();
		});

		// Try to add the same waypoint again
		const secondBatch = [createCandidate('Place A')];
		act(() => {
			result.current.setCandidates(secondBatch);
			result.current.toggleSelection(secondBatch[0]!);
		});

		act(() => {
			result.current.confirmSelection();
		});

		// Should still have only one
		expect(result.current.confirmedWaypoints).toHaveLength(1);
	});

	it('should remove confirmed waypoint with removeConfirmedWaypoint', () => {
		const { result } = renderHook(() => useWaypointManager());
		const candidates = [createCandidate('Place A'), createCandidate('Place B')];

		act(() => {
			result.current.setCandidates(candidates);
			result.current.toggleSelection(candidates[0]!);
			result.current.toggleSelection(candidates[1]!);
		});

		act(() => {
			result.current.confirmSelection();
		});

		expect(result.current.confirmedWaypoints).toHaveLength(2);

		act(() => {
			result.current.removeConfirmedWaypoint('Place A');
		});

		expect(result.current.confirmedWaypoints).toHaveLength(1);
		expect(result.current.confirmedWaypoints[0]?.name).toBe('Place B');
	});

	it('should return all waypoint names with getAllWaypointNames', () => {
		const { result } = renderHook(() => useWaypointManager());
		const candidates = [createCandidate('Place A'), createCandidate('Place B')];

		act(() => {
			result.current.setCandidates(candidates);
			result.current.toggleSelection(candidates[0]!);
			result.current.toggleSelection(candidates[1]!);
		});

		act(() => {
			result.current.confirmSelection();
		});

		const names = result.current.getAllWaypointNames();
		expect(names).toEqual(['Place A', 'Place B']);
	});

	it('should preserve confirmed waypoints when setCandidates is called', () => {
		const { result } = renderHook(() => useWaypointManager());

		// Confirm some waypoints
		const firstBatch = [createCandidate('Place A')];
		act(() => {
			result.current.setCandidates(firstBatch);
			result.current.toggleSelection(firstBatch[0]!);
		});

		act(() => {
			result.current.confirmSelection();
		});

		// Set new candidates
		const newCandidates = [createCandidate('Place X'), createCandidate('Place Y')];
		act(() => {
			result.current.setCandidates(newCandidates);
		});

		// Confirmed waypoints should be preserved
		expect(result.current.confirmedWaypoints).toHaveLength(1);
		expect(result.current.confirmedWaypoints[0]?.name).toBe('Place A');
		expect(result.current.candidates).toEqual(newCandidates);
	});

	it('should reset all state with reset', () => {
		const { result } = renderHook(() => useWaypointManager());
		const candidates = [createCandidate('Place A')];

		act(() => {
			result.current.setCandidates(candidates);
			result.current.toggleSelection(candidates[0]!);
		});

		act(() => {
			result.current.confirmSelection();
		});

		act(() => {
			result.current.reset();
		});

		expect(result.current.confirmedWaypoints).toEqual([]);
		expect(result.current.candidates).toEqual([]);
		expect(result.current.selectedCandidates).toEqual([]);
	});
});
