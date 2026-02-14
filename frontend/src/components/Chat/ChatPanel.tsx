import { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { chatNavigationAPI, type Route } from '../../api/navigation';
import { APIError } from '../../api/errors';
import { getErrorMessage } from '../../utils/errorMessages';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { RouteInputForm } from './RouteInputForm';

interface ChatPanelProps {
	origin: string;
	destination: string;
	onOriginChange: (value: string) => void;
	onDestinationChange: (value: string) => void;
	onRouteReceived: (route: Route | null) => void;
}

export function ChatPanel({
	origin,
	destination,
	onOriginChange,
	onDestinationChange,
	onRouteReceived,
}: ChatPanelProps) {
	const { messages, addMessage, isLoading, setLoading, error, setErrorMessage } = useChat();
	const [isSearching, setIsSearching] = useState(false);

	const handleSearch = async () => {
		setErrorMessage(null);
		setIsSearching(true);

		try {
			const response = await chatNavigationAPI.getReturnRoute({
				origin,
				destination,
				waypoints: [],
			});
			onRouteReceived(response.route);
		} catch (err) {
			console.error('Failed to search route:', err);
			if (err instanceof APIError) {
				setErrorMessage(getErrorMessage(err.status));
			} else {
				setErrorMessage('ルート検索に失敗しました。');
			}
		} finally {
			setIsSearching(false);
		}
	};

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

			// Notify parent if route is received
			if (response.route) {
				onRouteReceived(response.route);
			}
		} catch (error) {
			console.error('Failed to send message:', error);
			if (error instanceof APIError) {
				const userMessage = getErrorMessage(error.status);
				setErrorMessage(userMessage);
				// 429 (rate limit) does not add assistant message to encourage retry later
				if (error.status !== 429) {
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

	return (
		<div className="flex h-full flex-col">
			<div className="space-y-3 border-b border-gray-200 bg-white p-4">
				<h2 className="m-0 text-xl font-semibold">寄り道マップ</h2>
				<RouteInputForm
					origin={origin}
					destination={destination}
					onOriginChange={onOriginChange}
					onDestinationChange={onDestinationChange}
					onSearch={handleSearch}
					isSearching={isSearching}
				/>
			</div>
			<div className="flex-1 space-y-4 overflow-y-auto p-4">
				{error && (
					<div
						className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800"
						role="alert"
						aria-live="polite"
					>
						<p className="m-0 text-sm font-medium">エラー</p>
						<p className="m-0 text-sm">{error}</p>
					</div>
				)}
				<MessageList messages={messages} />
				{isLoading && (
					<div className="flex justify-center py-4" aria-live="polite" aria-label="読み込み中">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
					</div>
				)}
			</div>
			<ChatInput onSend={handleSend} isLoading={isLoading} />
		</div>
	);
}
