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
		<div className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50/50 px-6 py-4">
			<div className="mx-auto max-w-3xl">
				<div className="relative flex items-end gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm transition-shadow hover:shadow-md focus-within:border-blue-300 focus-within:shadow-md">
					<textarea
						value={value}
						onChange={(e) => setValue(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="どこへ行きたいですか？寄り道したい場所はありますか？"
						rows={1}
						className="max-h-32 flex-1 resize-none bg-transparent px-3 py-3 font-sans text-base leading-relaxed text-gray-800 placeholder-gray-400 focus:outline-none"
						style={{ minHeight: '44px' }}
					/>
					<button
						type="button"
						onClick={handleSend}
						disabled={!canSend}
						aria-label="Send"
						className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:opacity-50"
					>
						{isLoading ? (
							<svg
								className="h-5 w-5 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						) : (
							<svg
								className="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
								/>
							</svg>
						)}
					</button>
				</div>
				<div className="mt-2 px-1 text-xs text-gray-400">
					Enter で送信 • Shift + Enter で改行
				</div>
			</div>
		</div>
	);
}
