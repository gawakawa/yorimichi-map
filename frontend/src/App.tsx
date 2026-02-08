import { useState } from 'react';
import { ChatPanel } from './components/chat/ChatPanel';
import { AppLayout } from './components/layout/AppLayout';
import { MapPanel } from './components/map/MapPanel';
import { useChat } from './hooks/useChat';
import { useReturnRoute } from './hooks/useReturnRoute';
import type { ChatMessage, Place, Route } from './types/navigation';

function App() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
	const [currentPlaces, setCurrentPlaces] = useState<Place[]>([]);

	const chatMutation = useChat();
	const returnRouteMutation = useReturnRoute();

	const handleSend = (text: string) => {
		const userMessage: ChatMessage = { role: 'user', content: text };
		const updatedMessages = [...messages, userMessage];
		setMessages(updatedMessages);

		chatMutation.mutate(
			{ message: text, history: messages },
			{
				onSuccess: (data) => {
					const assistantMessage: ChatMessage = {
						role: 'assistant',
						content: data.reply,
					};
					setMessages((prev) => [...prev, assistantMessage]);

					if (data.route) {
						setCurrentRoute(data.route);
					}
					if (data.places) {
						setCurrentPlaces(data.places);
					}
				},
				onError: () => {
					const errorMessage: ChatMessage = {
						role: 'assistant',
						content: '申し訳ありません、エラーが発生しました。もう一度お試しください。',
					};
					setMessages((prev) => [...prev, errorMessage]);
				},
			},
		);
	};

	const handleReturnRoute = (origin: string, destination: string, waypoints: string[]) => {
		returnRouteMutation.mutate(
			{ origin, destination, waypoints },
			{
				onSuccess: (data) => {
					setCurrentRoute(data.route);
					const infoMessage: ChatMessage = {
						role: 'assistant',
						content: `帰り道のルートを生成しました! ${data.route.origin} → ${data.route.destination}`,
					};
					setMessages((prev) => [...prev, infoMessage]);
				},
				onError: () => {
					const errorMessage: ChatMessage = {
						role: 'assistant',
						content: '帰り道の計算に失敗しました。もう一度お試しください。',
					};
					setMessages((prev) => [...prev, errorMessage]);
				},
			},
		);
	};

	return (
		<AppLayout
			left={
				<ChatPanel messages={messages} onSend={handleSend} isLoading={chatMutation.isPending} />
			}
			right={
				<MapPanel
					route={currentRoute}
					places={currentPlaces}
					onReturnRoute={handleReturnRoute}
					isReturnLoading={returnRouteMutation.isPending}
				/>
			}
		/>
	);
}

export default App;
