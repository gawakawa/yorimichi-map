import { useChat } from '../../hooks/useChat';
import { chatNavigationAPI } from '../../api/navigation';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { SpotsList } from './SpotsList';

const MOCK_SPOTS = [
	{
		id: '1',
		name: '銀座',
		description: 'ショッピングエリア',
		distance: 0.5,
		rating: 4.5,
	},
	{
		id: '2',
		name: '築地市場',
		description: '寿司と海鮮',
		distance: 1.2,
		rating: 4.8,
	},
	{
		id: '3',
		name: '浜離宮恩賜庭園',
		description: '日本庭園',
		distance: 1.8,
		rating: 4.6,
	},
];

export function ChatPanel() {
	const { messages, addMessage } = useChat();

	const handleSend = async (message: string) => {
		addMessage(message, 'user');

		try {
			// Convert messages to API format (text -> content)
			const history = messages.map((m) => ({
				role: m.role,
				content: m.text,
			}));

			const response = await chatNavigationAPI.sendMessage(message, history);

			addMessage(response.reply, 'assistant');
		} catch (error) {
			console.error('Failed to send message:', error);
			addMessage('エラーが発生しました。もう一度試してください。', 'assistant');
		}
	};

	const handleSpotSelect = (spot: (typeof MOCK_SPOTS)[0]) => {
		console.log('Selected spot:', spot);
	};

	return (
		<div className="flex h-full flex-col">
			<div className="border-b border-gray-200 bg-white p-4">
				<h2 className="m-0 text-xl font-semibold">寄り道マップ</h2>
			</div>
			<div className="flex-1 overflow-y-auto space-y-4 p-4">
				<MessageList messages={messages} />
				{messages.length === 0 && <SpotsList spots={MOCK_SPOTS} onSelect={handleSpotSelect} />}
			</div>
			<ChatInput onSend={handleSend} />
		</div>
	);
}
