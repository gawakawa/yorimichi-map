import { useEffect, useRef, useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { chatNavigationAPI, type Route, type WaypointCandidate } from '../../api/navigation';
import { APIError } from '../../api/errors';
import { getErrorMessage } from '../../utils/errorMessages';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { WaypointCandidatesList } from './WaypointCandidatesList';
import { RouteInputForm } from './RouteInputForm';

interface ChatPanelProps {
	onRouteReceived?: (route: Route | null) => void;
}

export function ChatPanel({ onRouteReceived }: ChatPanelProps) {
	const { messages, addMessage, isLoading, setLoading, error, setErrorMessage } = useChat();
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Route search state
	const [origin, setOrigin] = useState('');
	const [destination, setDestination] = useState('');
	const [isSearchingRoute, setIsSearchingRoute] = useState(false);
	const [route, setRoute] = useState<Route | null>(null);

	// Waypoint candidates state
	const [waypointCandidates, setWaypointCandidates] = useState<WaypointCandidate[]>([]);
	const [selectedCandidates, setSelectedCandidates] = useState<WaypointCandidate[]>([]);

	// Notify parent when route is received
	useEffect(() => {
		if (route && onRouteReceived) {
			onRouteReceived(route);
		}
	}, [route, onRouteReceived]);

	// メッセージが追加されたら自動的に最下部にスクロール
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, isLoading]);

	const handleSend = async (message: string) => {
		addMessage(message, 'user');
		setErrorMessage(null);
		setLoading(true);
		setWaypointCandidates([]);
		setSelectedCandidates([]);

		try {
			const response = await chatNavigationAPI.suggestWaypoints({
				origin: origin.trim(),
				destination: destination.trim(),
				prompt: message,
			});

			if (response.ai_comment) {
				addMessage(response.ai_comment, 'assistant');
			}

			if (response.candidates && response.candidates.length > 0) {
				setWaypointCandidates(response.candidates);
			}
		} catch (err) {
			console.error('Failed to suggest waypoints:', err);
			if (err instanceof APIError) {
				const userMessage = getErrorMessage(err.status);
				setErrorMessage(userMessage);
				if (err.status !== 429) {
					addMessage(userMessage, 'assistant');
				}
			} else {
				const errorMessage = '通信エラーが発生しました。';
				setErrorMessage(errorMessage);
				addMessage(errorMessage, 'assistant');
			}
		} finally {
			setLoading(false);
		}
	};

	// Handle candidate selection
	const handleCandidateSelect = (candidate: WaypointCandidate) => {
		setSelectedCandidates((prev) => {
			const exists = prev.some((c) => c.name === candidate.name);
			if (exists) {
				return prev.filter((c) => c.name !== candidate.name);
			}
			return [...prev, candidate];
		});
	};

	// Calculate route with selected candidates
	const handleRouteSearch = async () => {
		if (origin.trim() === '' || destination.trim() === '') {
			setErrorMessage('出発地と目的地を入力してください');
			return;
		}

		setIsSearchingRoute(true);
		setErrorMessage(null);

		try {
			const waypoints = selectedCandidates.map((c) => c.name);
			const response = await chatNavigationAPI.calculateRoute({
				origin: origin.trim(),
				destination: destination.trim(),
				waypoints,
			});
			setRoute(response.route);
			setWaypointCandidates([]);
			setSelectedCandidates([]);
		} catch (err) {
			console.error('Route calculation failed:', err);
			if (err instanceof APIError) {
				setErrorMessage(getErrorMessage(err.status));
			} else {
				setErrorMessage('ルート検索に失敗しました。');
			}
		} finally {
			setIsSearchingRoute(false);
		}
	};

	return (
		<div className="flex h-full flex-col">
			{/* ヘッダー */}
			<div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 px-6 py-5 shadow-sm">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
						<svg
							className="h-6 w-6 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
							/>
						</svg>
					</div>
					<div>
						<h1 className="m-0 text-xl font-bold text-white">寄り道マップ</h1>
						<p className="m-0 text-xs text-white/80">AI ドライブコンシェルジュ</p>
					</div>
				</div>
			</div>

			{/* メインコンテンツエリア */}
			<div className="flex-1 overflow-y-auto bg-white">
				<div className="min-h-full p-6">
					{/* Error display */}
					{error && (
						<div className="mb-4">
							<div
								className="flex items-start gap-3 rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-4 shadow-sm"
								role="alert"
								aria-live="polite"
							>
								<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
									<svg
										className="h-5 w-5 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<div className="flex-1">
									<p className="m-0 mb-1 text-sm font-semibold text-red-900">
										エラーが発生しました
									</p>
									<p className="m-0 text-sm text-red-800">{error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Route input form */}
					<div className="mb-4">
						<RouteInputForm
							origin={origin}
							destination={destination}
							onOriginChange={setOrigin}
							onDestinationChange={setDestination}
							onSearch={handleRouteSearch}
							isSearching={isSearchingRoute}
						/>
					</div>

					{/* Waypoint candidates display */}
					{waypointCandidates.length > 0 && (
						<div className="mb-4">
							<WaypointCandidatesList
								candidates={waypointCandidates}
								selectedCandidates={selectedCandidates}
								onSelect={handleCandidateSelect}
								onConfirm={handleRouteSearch}
								isSearching={isSearchingRoute}
							/>
						</div>
					)}

					{/* Route searching indicator */}
					{isSearchingRoute && (
						<div
							className="mb-4 flex flex-col items-center justify-center py-8"
							aria-live="polite"
							aria-label="検索中"
						>
							<div className="relative">
								<div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-transparent bg-gradient-to-br from-blue-500 to-purple-600" />
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="h-6 w-6 rounded-full bg-white" />
								</div>
							</div>
							<p className="mt-4 text-sm font-medium text-gray-600">ルートを検索中...</p>
						</div>
					)}

					{/* Chat messages */}
					<MessageList messages={messages} />

					{isLoading && (
						<div
							className="flex flex-col items-center justify-center py-8"
							aria-live="polite"
							aria-label="読み込み中"
						>
							<div className="relative">
								<div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-transparent bg-gradient-to-br from-blue-500 to-purple-600" />
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="h-6 w-6 rounded-full bg-white" />
								</div>
							</div>
							<p className="mt-4 text-sm font-medium text-gray-600">考え中...</p>
						</div>
					)}

					{/* Auto-scroll anchor */}
					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Chat input */}
			<div className="flex-shrink-0">
				<ChatInput
					onSend={handleSend}
					isLoading={isLoading}
					disabled={!origin.trim() || !destination.trim()}
				/>
			</div>
		</div>
	);
}
