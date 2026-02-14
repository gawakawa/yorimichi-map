import { ChatInput } from './ChatInput';

export function ChatPanel() {
	const handleSend = (message: string) => {
		console.log('Send:', message);
	};

	return (
		<div className="flex h-full flex-col">
			<div className="border-b border-gray-200 bg-white p-4">
				<h2 className="m-0 text-xl font-semibold">寄り道マップ</h2>
			</div>
			<div className="flex-1 overflow-y-auto p-4">{/* Messages will be displayed here */}</div>
			<ChatInput onSend={handleSend} />
		</div>
	);
}
