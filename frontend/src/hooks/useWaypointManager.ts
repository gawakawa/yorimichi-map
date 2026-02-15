import { useState } from 'react';
import type { WaypointCandidate } from '../api/navigation';

export interface UseWaypointManagerReturn {
	confirmedWaypoints: WaypointCandidate[];
	candidates: WaypointCandidate[];
	selectedCandidates: WaypointCandidate[];

	setCandidates: (candidates: WaypointCandidate[]) => void;
	toggleSelection: (candidate: WaypointCandidate) => void;
	confirmSelection: () => void;
	removeConfirmedWaypoint: (name: string) => void;
	getAllWaypointNames: () => string[];
	reset: () => void;
}

export function useWaypointManager(): UseWaypointManagerReturn {
	const [confirmedWaypoints, setConfirmedWaypoints] = useState<WaypointCandidate[]>([]);
	const [candidates, setCandidatesState] = useState<WaypointCandidate[]>([]);
	const [selectedCandidates, setSelectedCandidates] = useState<WaypointCandidate[]>([]);

	const setCandidates = (newCandidates: WaypointCandidate[]) => {
		setCandidatesState(newCandidates);
		setSelectedCandidates([]);
	};

	const toggleSelection = (candidate: WaypointCandidate) => {
		setSelectedCandidates((prev) => {
			const exists = prev.some((c) => c.name === candidate.name);
			if (exists) {
				return prev.filter((c) => c.name !== candidate.name);
			}
			return [...prev, candidate];
		});
	};

	const confirmSelection = () => {
		setConfirmedWaypoints((prev) => {
			const newWaypoints = selectedCandidates.filter(
				(selected) => !prev.some((confirmed) => confirmed.name === selected.name),
			);
			return [...prev, ...newWaypoints];
		});
		setSelectedCandidates([]);
		setCandidatesState([]);
	};

	const removeConfirmedWaypoint = (name: string) => {
		setConfirmedWaypoints((prev) => prev.filter((c) => c.name !== name));
	};

	const getAllWaypointNames = () => {
		return confirmedWaypoints.map((c) => c.name);
	};

	const reset = () => {
		setConfirmedWaypoints([]);
		setCandidatesState([]);
		setSelectedCandidates([]);
	};

	return {
		confirmedWaypoints,
		candidates,
		selectedCandidates,
		setCandidates,
		toggleSelection,
		confirmSelection,
		removeConfirmedWaypoint,
		getAllWaypointNames,
		reset,
	};
}
