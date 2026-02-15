import { useState } from 'react';
import { chatNavigationAPI, type Route, type WaypointCandidate } from '../api/navigation';
import { APIError } from '../api/errors';
import { getErrorMessage } from '../utils/errorMessages';

export type SearchPhase = 'input' | 'selecting' | 'searching' | 'result' | 'error';

export interface UseRouteSearchReturn {
	origin: string;
	destination: string;
	aiPrompt: string;
	phase: SearchPhase;
	candidates: WaypointCandidate[];
	selectedCandidates: WaypointCandidate[];
	route: Route | null;
	isLoading: boolean;
	error: string | null;
	aiComment: string;

	setOrigin: (v: string) => void;
	setDestination: (v: string) => void;
	setAiPrompt: (v: string) => void;
	handleSearch: () => Promise<void>;
	toggleCandidate: (name: string) => void;
	confirmSelection: () => Promise<void>;
	reset: () => void;
}

export function useRouteSearch(): UseRouteSearchReturn {
	const [origin, setOrigin] = useState('');
	const [destination, setDestination] = useState('');
	const [aiPrompt, setAiPrompt] = useState('');
	const [phase, setPhase] = useState<SearchPhase>('input');
	const [candidates, setCandidates] = useState<WaypointCandidate[]>([]);
	const [selectedCandidates, setSelectedCandidates] = useState<WaypointCandidate[]>([]);
	const [route, setRoute] = useState<Route | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [aiComment, setAiComment] = useState('');

	const handleSearch = async () => {
		if (origin.trim() === '' || destination.trim() === '') {
			return;
		}

		setError(null);
		setIsLoading(true);

		try {
			if (aiPrompt.trim() === '') {
				// No AI prompt: direct route calculation
				setPhase('searching');
				const response = await chatNavigationAPI.calculateRoute({
					origin: origin.trim(),
					destination: destination.trim(),
					waypoints: [],
				});
				setRoute(response.route);
				setPhase('result');
			} else {
				// With AI prompt: get waypoint suggestions
				setPhase('searching');
				const response = await chatNavigationAPI.suggestWaypoints({
					origin: origin.trim(),
					destination: destination.trim(),
					prompt: aiPrompt.trim(),
				});
				setCandidates(response.candidates);
				setAiComment(response.ai_comment ?? '');
				setSelectedCandidates([]);
				setPhase('selecting');
			}
		} catch (err) {
			console.error('Search failed:', err);
			if (err instanceof APIError) {
				setError(getErrorMessage(err.status));
			} else {
				setError('通信エラーが発生しました。');
			}
			setPhase('error');
		} finally {
			setIsLoading(false);
		}
	};

	const toggleCandidate = (name: string) => {
		const candidate = candidates.find((c) => c.name === name);
		if (!candidate) return;

		setSelectedCandidates((prev) => {
			const exists = prev.some((c) => c.name === name);
			if (exists) {
				return prev.filter((c) => c.name !== name);
			}
			return [...prev, candidate];
		});
	};

	const confirmSelection = async () => {
		setError(null);
		setIsLoading(true);
		setPhase('searching');

		try {
			const waypoints = selectedCandidates.map((c) => c.name);
			const response = await chatNavigationAPI.calculateRoute({
				origin: origin.trim(),
				destination: destination.trim(),
				waypoints,
			});
			setRoute(response.route);
			setPhase('result');
		} catch (err) {
			console.error('Route calculation failed:', err);
			if (err instanceof APIError) {
				setError(getErrorMessage(err.status));
			} else {
				setError('通信エラーが発生しました。');
			}
			setPhase('error');
		} finally {
			setIsLoading(false);
		}
	};

	const reset = () => {
		setPhase('input');
		setCandidates([]);
		setSelectedCandidates([]);
		setRoute(null);
		setError(null);
		setAiComment('');
	};

	return {
		origin,
		destination,
		aiPrompt,
		phase,
		candidates,
		selectedCandidates,
		route,
		isLoading,
		error,
		aiComment,
		setOrigin,
		setDestination,
		setAiPrompt,
		handleSearch,
		toggleCandidate,
		confirmSelection,
		reset,
	};
}
