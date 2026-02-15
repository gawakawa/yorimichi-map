interface RouteInputFormProps {
	origin: string;
	destination: string;
	aiPrompt?: string;
	onOriginChange: (value: string) => void;
	onDestinationChange: (value: string) => void;
	onAiPromptChange?: (value: string) => void;
	onSearch: () => void;
	isSearching: boolean;
}

export function RouteInputForm({
	origin,
	destination,
	aiPrompt = '',
	onOriginChange,
	onDestinationChange,
	onAiPromptChange,
	onSearch,
	isSearching,
}: RouteInputFormProps) {
	const canSearch = origin.trim() !== '' && destination.trim() !== '' && !isSearching;

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<span className="w-12 text-sm text-gray-600">出発地</span>
				<input
					type="text"
					value={origin}
					onChange={(e) => onOriginChange(e.target.value)}
					placeholder="東京駅"
					className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
				/>
			</div>
			<div className="flex items-center gap-2">
				<span className="w-12 text-sm text-gray-600">目的地</span>
				<input
					type="text"
					value={destination}
					onChange={(e) => onDestinationChange(e.target.value)}
					placeholder="渋谷駅"
					className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
				/>
			</div>
			{onAiPromptChange && (
				<div className="flex items-start gap-2">
					<span className="w-12 pt-2 text-sm text-gray-600">寄り道</span>
					<textarea
						value={aiPrompt}
						onChange={(e) => onAiPromptChange(e.target.value)}
						placeholder="寄り道リクエスト（任意）例: 途中で美味しいラーメンを食べたい"
						rows={2}
						className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
					/>
				</div>
			)}
			<button
				type="button"
				onClick={onSearch}
				disabled={!canSearch}
				className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isSearching ? (
					<span className="flex items-center justify-center gap-2">
						<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
						検索中...
					</span>
				) : (
					<>
						<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						検索
					</>
				)}
			</button>
		</div>
	);
}
