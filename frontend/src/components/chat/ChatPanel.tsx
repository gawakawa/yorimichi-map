import { useEffect, useRef } from 'react';
import type { ChatMessage as ChatMessageType } from '../../types/navigation';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';

interface Props {
	messages: ChatMessageType[];
	onSend: (message: string) => void;
	isLoading: boolean;
}

export function ChatPanel({ messages, onSend, isLoading }: Props) {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages.length]);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				borderRight: '1px solid #DEE2E6',
			}}
		>
			<div
				style={{
					padding: '16px',
					borderBottom: '1px solid #DEE2E6',
					fontWeight: 'bold',
					fontSize: '16px',
				}}
			>
				AI Drive Buddy
			</div>
			<div
				style={{
					flex: 1,
					overflowY: 'auto',
					padding: '12px',
				}}
			>
				{messages.length === 0 && (
					<div
						style={{
							textAlign: 'center',
							color: '#6C757D',
							marginTop: '40px',
						}}
					>
						<p>AI Drive Buddy へようこそ!</p>
						<p style={{ fontSize: '14px' }}>行き先や希望を入力してください。</p>
						<p style={{ fontSize: '13px', color: '#ADB5BD' }}>
							例: 「東京駅から箱根湯本まで行きたい」
						</p>
					</div>
				)}
				{messages.map((msg, i) => (
					<ChatMessage key={i} message={msg} />
				))}
				{isLoading && (
					<div
						style={{
							display: 'flex',
							justifyContent: 'flex-start',
							marginBottom: '8px',
						}}
					>
						<div
							style={{
								padding: '10px 14px',
								borderRadius: '12px',
								backgroundColor: '#E9ECEF',
								color: '#6C757D',
							}}
						>
							考え中...
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
			<ChatInput onSend={onSend} disabled={isLoading} />
		</div>
	);
}
