interface ActionButtonsProps {
	onSearch: () => void;
	onDetails: () => void;
	onShare: () => void;
}

export function ActionButtons({ onSearch, onDetails, onShare }: ActionButtonsProps) {
	return (
		<div className="flex gap-2">
			<button
				onClick={onSearch}
				disabled
				className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-sm opacity-50 cursor-not-allowed"
			>
				<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				検索
			</button>
			<button
				onClick={onDetails}
				disabled
				className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 opacity-50 cursor-not-allowed"
			>
				<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</button>
			<button
				onClick={onShare}
				disabled
				className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 opacity-50 cursor-not-allowed"
			>
				<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
					/>
				</svg>
			</button>
		</div>
	);
}
