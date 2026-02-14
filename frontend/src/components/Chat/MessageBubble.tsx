interface MessageBubbleProps {
	text: string;
	role: 'user' | 'assistant';
}

export function MessageBubble({ text, role }: MessageBubbleProps) {
	const isUser = role === 'user';

	return (
		<div
			className={`flex gap-4 px-6 py-6 transition-colors hover:bg-gray-50/50 ${
				isUser ? 'bg-white' : 'bg-gradient-to-br from-blue-50/30 to-purple-50/30'
			}`}
		>
			{/* アイコン */}
			<div className="flex-shrink-0">
				{isUser ? (
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white shadow-sm">
						You
					</div>
				) : (
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 text-sm font-bold text-white shadow-md">
						AI
					</div>
				)}
			</div>

			{/* メッセージ内容 */}
			<div className="flex-1 space-y-2 pt-1">
				<div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
					{isUser ? 'あなた' : 'AI ドライブコンシェルジュ'}
				</div>
				<div className="prose prose-sm max-w-none text-gray-800">
					<p className="whitespace-pre-wrap leading-relaxed">{text}</p>
				</div>
			</div>
		</div>
	);
}
