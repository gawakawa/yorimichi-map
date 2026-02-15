import { useEffect, useRef, useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { chatNavigationAPI, type Route, type Place } from '../../api/navigation';
import { APIError } from '../../api/errors';
import { getErrorMessage } from '../../utils/errorMessages';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { SpotsList } from './SpotsList';
import { RouteInputForm } from './RouteInputForm';

interface ChatPanelProps {
	onRouteReceived?: (route: Route | null) => void;
}

export function ChatPanel({ onRouteReceived }: ChatPanelProps) {
	const { messages, addMessage, isLoading, setLoading, error, setErrorMessage } = useChat();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [spots, setSpots] = useState<Place[]>([]);

	// Route search state
	const [origin, setOrigin] = useState('');
	const [destination, setDestination] = useState('');
	const [selectedWaypoints, setSelectedWaypoints] = useState<Place[]>([]);
	const [isSearchingRoute, setIsSearchingRoute] = useState(false);
	const [route, setRoute] = useState<Route | null>(null);

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

	// Handle spot selection as waypoint
	const handleSpotSelect = (spot: Place) => {
		setSelectedWaypoints((prev) => {
			const exists = prev.some((w) => w.name === spot.name);
			if (exists) {
				return prev.filter((w) => w.name !== spot.name);
			}
			return [...prev, spot];
		});
	};

	// Calculate route with selected waypoints
	const handleRouteSearch = async () => {
		if (origin.trim() === '' || destination.trim() === '') {
			setErrorMessage('出発地と目的地を入力してください');
			return;
		}

		setIsSearchingRoute(true);
		setErrorMessage(null);

		try {
			const waypoints = selectedWaypoints.map((w) => w.name);
			const response = await chatNavigationAPI.calculateRoute({
				origin: origin.trim(),
				destination: destination.trim(),
				waypoints,
			});
			setRoute(response.route);
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

	// Reset route search
	const handleReset = () => {
		setRoute(null);
		setSelectedWaypoints([]);
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

					{/* Route result display */}
					{route && (
						<div className="mb-4 space-y-4">
							<div className="rounded-lg border border-green-200 bg-green-50 p-4">
								<h3 className="font-semibold text-green-800">ルートが見つかりました</h3>
								<div className="mt-2 space-y-1 text-sm text-green-700">
									<p>
										<span className="font-medium">出発:</span> {route.origin}
									</p>
									<p>
										<span className="font-medium">到着:</span> {route.destination}
									</p>
									{route.waypoints.length > 0 && (
										<p>
											<span className="font-medium">経由地:</span> {route.waypoints.join(' → ')}
										</p>
									)}
									<p>
										<span className="font-medium">距離:</span>{' '}
										{(route.distance_meters / 1000).toFixed(1)} km
									</p>
									<p>
										<span className="font-medium">所要時間:</span>{' '}
										{Math.round(parseInt(route.duration_seconds) / 60)} 分
									</p>
									{route.tolls && route.tolls.length > 0 && (
										<p>
											<span className="font-medium">料金:</span>{' '}
											{route.tolls.map((t) => `${t.units}${t.currencyCode}`).join(', ')}
										</p>
									)}
								</div>
								<div className="mt-4 flex gap-2">
									<a
										href={route.google_maps_url}
										target="_blank"
										rel="noopener noreferrer"
										className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-600"
									>
										Google Maps で開く
									</a>
									<button
										type="button"
										onClick={handleReset}
										className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
									>
										新規検索
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Route input form (always visible when no route result) */}
					{!route && (
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
					)}

					{/* Selected waypoints display */}
					{!route && selectedWaypoints.length > 0 && (
						<div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
							<h3 className="mb-2 text-sm font-semibold text-blue-800">
								選択した経由地 ({selectedWaypoints.length}件)
							</h3>
							<div className="flex flex-wrap gap-2">
								{selectedWaypoints.map((wp) => (
									<button
										key={wp.name}
										type="button"
										onClick={() => handleSpotSelect(wp)}
										className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 hover:bg-blue-200"
									>
										{wp.name}
										<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								))}
							</div>
							<button
								type="button"
								onClick={handleRouteSearch}
								disabled={isSearchingRoute || origin.trim() === '' || destination.trim() === ''}
								className="mt-3 w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
							>
								{isSearchingRoute ? 'ルート検索中...' : 'このルートで検索'}
							</button>
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

					{/* Chat messages and spots */}
					{!route && (
						<>
							{messages.length === 0 && spots.length === 0 ? (
								<SpotsList spots={[]} onSelect={handleSpotSelect} />
							) : (
								<>
									<MessageList messages={messages} />
									{spots.length > 0 && (
										<div className="mt-4">
											<SpotsList
												spots={spots}
												onSelect={handleSpotSelect}
												selectedSpots={selectedWaypoints}
											/>
										</div>
									)}
								</>
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

			{/* Chat input (visible when no route result) */}
			{!route && (
				<div className="flex-shrink-0">
					<ChatInput onSend={handleSend} isLoading={isLoading} />
				</div>
			)}
		</div>
	);
}
