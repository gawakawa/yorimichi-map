import type { ChatMessage } from '../../types/chat';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
	messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
	return (
		<div className="flex-1 overflow-y-auto">
			<div className="flex flex-col gap-3">
				{messages.map((message) => (
					<MessageBubble key={message.id} text={message.text} role={message.role} />
				))}
			</div>
		</div>
	);
}
