import { type FormEvent, useState } from 'react';

interface Props {
	onSend: (message: string) => void;
	disabled: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
	const [text, setText] = useState('');

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		const trimmed = text.trim();
		if (trimmed.length === 0) return;
		onSend(trimmed);
		setText('');
	};

	return (
		<form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', padding: '12px' }}>
			<input
				type="text"
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="行き先や希望を入力..."
				disabled={disabled}
				style={{
					flex: 1,
					padding: '10px 14px',
					borderRadius: '8px',
					border: '1px solid #DEE2E6',
					fontSize: '14px',
				}}
			/>
			<button
				type="submit"
				disabled={disabled || text.trim().length === 0}
				style={{
					padding: '10px 20px',
					borderRadius: '8px',
					border: 'none',
					backgroundColor: '#007AFF',
					color: '#fff',
					fontSize: '14px',
					cursor: disabled ? 'not-allowed' : 'pointer',
					opacity: disabled ? 0.6 : 1,
				}}
			>
				送信
			</button>
		</form>
	);
}
