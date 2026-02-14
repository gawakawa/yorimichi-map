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
				className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
			>
				検索
			</button>
			<button
				onClick={onDetails}
				className="flex-1 rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
			>
				詳細
			</button>
			<button
				onClick={onShare}
				className="flex-1 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
			>
				共有
			</button>
		</div>
	);
}
