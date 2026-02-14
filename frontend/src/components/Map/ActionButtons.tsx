interface ActionButtonsProps {
	onSearch: () => void;
}

export function ActionButtons({ onSearch }: ActionButtonsProps) {
	return (
		<div className="flex gap-2">
			<button
				onClick={onSearch}
				className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
			>
				検索
			</button>
		</div>
	);
}
