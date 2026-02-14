import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
	onSend: (message: string) => void;
	isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading = false }: ChatInputProps) {
	const [value, setValue] = useState('');

	const trimmedValue = value.trim();
	const canSend = trimmedValue.length > 0 && !isLoading;

	const handleSend = () => {
		if (canSend) {
			onSend(trimmedValue);
			setValue('');
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="flex gap-2 border-t border-gray-200 bg-white p-4">
			<textarea
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="メッセージを入力..."
				rows={3}
				className="flex-1 resize-none rounded-lg border border-gray-200 p-3 font-sans text-base leading-relaxed focus:border-blue-500 focus:outline-none"
			/>
			<button
				type="button"
				onClick={handleSend}
				disabled={!canSend}
				aria-label="Send"
				className="self-end rounded-lg bg-blue-500 px-6 py-3 text-base text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
			>
				送信
			</button>
		</div>
	);
}
