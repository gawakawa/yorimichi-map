import { useEffect, useRef, useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { useRouteSearch } from '../../hooks/useRouteSearch';
import { chatNavigationAPI, type Route, type Place } from '../../api/navigation';
import { APIError } from '../../api/errors';
import { getErrorMessage } from '../../utils/errorMessages';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { SpotsList } from './SpotsList';
import { RouteInputForm } from './RouteInputForm';
import { WaypointSelector } from '../Navigation/WaypointSelector';

interface ChatPanelProps {
	onRouteReceived?: (route: Route | null) => void;
}

export function ChatPanel({ onRouteReceived }: ChatPanelProps) {
	const { messages, addMessage, isLoading, setLoading, error, setErrorMessage } = useChat();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [spots, setSpots] = useState<Place[]>([]);
	const showRouteSearch = true;

	const routeSearch = useRouteSearch();

	// Notify parent when route is received
	useEffect(() => {
		if (routeSearch.route && onRouteReceived) {
			onRouteReceived(routeSearch.route);
		}
	}, [routeSearch.route, onRouteReceived]);

	// メッセージが追加されたら自動的に最下部にスクロール
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, isLoading]);

	const handleSend = async (message: string) => {
		addMessage(message, 'user');
		setErrorMessage(null);
		setLoading(true);

		try {
			// Convert messages to API format (text -> content)
			const history = messages.map((m) => ({
				role: m.role,
				content: m.text,
			}));

			const response = await chatNavigationAPI.sendMessage(message, history);

			addMessage(response.reply, 'assistant');

			// Update spots if received from API
			if (response.places && response.places.length > 0) {
				setSpots(response.places);
			}

			// Notify parent if route is received
			if (response.route && onRouteReceived) {
				onRouteReceived(response.route);
			}
		} catch (err) {
			console.error('Failed to send message:', err);
			if (err instanceof APIError) {
				const userMessage = getErrorMessage(err.status);
				setErrorMessage(userMessage);
				// 429 (rate limit) does not add assistant message to encourage retry later
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

	const handleRouteSearchReset = () => {
		routeSearch.reset();
		if (onRouteReceived) {
			onRouteReceived(null);
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
					{(error || routeSearch.error) && (
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
									<p className="m-0 text-sm text-red-800">{error || routeSearch.error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Route Search UI based on phase */}
					{showRouteSearch && (
						<>
							{(routeSearch.phase === 'input' || routeSearch.phase === 'error') && (
								<RouteInputForm
									origin={routeSearch.origin}
									destination={routeSearch.destination}
									aiPrompt={routeSearch.aiPrompt}
									onOriginChange={routeSearch.setOrigin}
									onDestinationChange={routeSearch.setDestination}
									onAiPromptChange={routeSearch.setAiPrompt}
									onSearch={routeSearch.handleSearch}
									isSearching={routeSearch.isLoading}
								/>
							)}

							{routeSearch.phase === 'selecting' && (
								<WaypointSelector
									candidates={routeSearch.candidates}
									selectedCandidates={routeSearch.selectedCandidates}
									aiComment={routeSearch.aiComment}
									onToggle={routeSearch.toggleCandidate}
									onConfirm={routeSearch.confirmSelection}
									onCancel={handleRouteSearchReset}
									isLoading={routeSearch.isLoading}
								/>
							)}

							{routeSearch.phase === 'searching' && (
								<div
									className="flex flex-col items-center justify-center py-8"
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

							{routeSearch.phase === 'result' && routeSearch.route && (
								<div className="space-y-4">
									<div className="rounded-lg border border-green-200 bg-green-50 p-4">
										<h3 className="font-semibold text-green-800">ルートが見つかりました</h3>
										<div className="mt-2 space-y-1 text-sm text-green-700">
											<p>
												<span className="font-medium">出発:</span> {routeSearch.route.origin}
											</p>
											<p>
												<span className="font-medium">到着:</span> {routeSearch.route.destination}
											</p>
											{routeSearch.route.waypoints.length > 0 && (
												<p>
													<span className="font-medium">経由地:</span>{' '}
													{routeSearch.route.waypoints.join(' → ')}
												</p>
											)}
											<p>
												<span className="font-medium">距離:</span>{' '}
												{(routeSearch.route.distance_meters / 1000).toFixed(1)} km
											</p>
											<p>
												<span className="font-medium">所要時間:</span>{' '}
												{Math.round(parseInt(routeSearch.route.duration_seconds) / 60)} 分
											</p>
											{routeSearch.route.tolls && routeSearch.route.tolls.length > 0 && (
												<p>
													<span className="font-medium">料金:</span>{' '}
													{routeSearch.route.tolls
														.map((t) => `${t.units}${t.currencyCode}`)
														.join(', ')}
												</p>
											)}
										</div>
										<div className="mt-4 flex gap-2">
											<a
												href={routeSearch.route.google_maps_url}
												target="_blank"
												rel="noopener noreferrer"
												className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-600"
											>
												Google Maps で開く
											</a>
											<button
												type="button"
												onClick={handleRouteSearchReset}
												className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
											>
												新規検索
											</button>
										</div>
									</div>
								</div>
							)}
						</>
					)}

					{/* Legacy chat UI (hidden when route search is shown) */}
					{!showRouteSearch && (
						<>
							{messages.length === 0 ? (
								<SpotsList spots={spots} />
							) : (
								<MessageList messages={messages} />
							)}

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
						</>
					)}

					{/* Auto-scroll anchor */}
					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Legacy chat input (hidden when route search is shown) */}
			{!showRouteSearch && (
				<div className="flex-shrink-0">
					<ChatInput onSend={handleSend} isLoading={isLoading} />
				</div>
			)}
		</div>
	);
}
