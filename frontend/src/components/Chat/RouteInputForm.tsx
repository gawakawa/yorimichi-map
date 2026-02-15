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
				<span className="w-12 text-sm text-gray-600">出発</span>
				<input
					type="text"
					value={origin}
					onChange={(e) => onOriginChange(e.target.value)}
					placeholder="出発地を入力"
					className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
				/>
			</div>
			<div className="flex items-center gap-2">
				<span className="w-12 text-sm text-gray-600">到着</span>
				<input
					type="text"
					value={destination}
					onChange={(e) => onDestinationChange(e.target.value)}
					placeholder="目的地を入力"
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
				className="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
			>
				{isSearching ? (
					<span className="flex items-center justify-center gap-2">
						<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
						検索中...
					</span>
				) : (
					'検索'
				)}
			</button>
		</div>
	);
}
