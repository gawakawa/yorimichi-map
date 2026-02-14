interface MessageBubbleProps {
	text: string;
	role: 'user' | 'assistant';
}

export function MessageBubble({ text, role }: MessageBubbleProps) {
	const isUser = role === 'user';

	return (
		<div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
			<div
				className={`max-w-xs rounded-lg px-4 py-2 ${
					isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
				}`}
			>
				<p className="whitespace-pre-wrap break-words">{text}</p>
			</div>
		</div>
	);
}
