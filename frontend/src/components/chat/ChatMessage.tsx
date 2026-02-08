import type { ChatMessage as ChatMessageType } from '../../types/navigation';

interface Props {
	message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
	const isUser = message.role === 'user';

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: isUser ? 'flex-end' : 'flex-start',
				marginBottom: '8px',
			}}
		>
			<div
				style={{
					maxWidth: '80%',
					padding: '10px 14px',
					borderRadius: '12px',
					backgroundColor: isUser ? '#007AFF' : '#E9ECEF',
					color: isUser ? '#fff' : '#212529',
					whiteSpace: 'pre-wrap',
					wordBreak: 'break-word',
					lineHeight: '1.5',
				}}
			>
				{message.content}
			</div>
		</div>
	);
}
