import { useChat } from '../../hooks/useChat';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';

export function ChatPanel() {
	const { messages, addMessage } = useChat();

	const handleSend = (message: string) => {
		addMessage(message, 'user');
	};

	return (
		<div className="flex h-full flex-col">
			<div className="border-b border-gray-200 bg-white p-4">
				<h2 className="m-0 text-xl font-semibold">寄り道マップ</h2>
			</div>
			<div className="flex-1 p-4">
				<MessageList messages={messages} />
			</div>
			<ChatInput onSend={handleSend} />
		</div>
	);
}
