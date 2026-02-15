import type { WaypointCandidate } from '../../api/navigation';

interface WaypointCandidatesListProps {
	candidates: WaypointCandidate[];
	selectedCandidates: WaypointCandidate[];
	onSelect: (candidate: WaypointCandidate) => void;
	onConfirm: () => void;
	isSearching: boolean;
}

export function WaypointCandidatesList({
	candidates,
	selectedCandidates,
	onSelect,
	onConfirm,
	isSearching,
}: WaypointCandidatesListProps) {
	const isSelected = (candidate: WaypointCandidate) =>
		selectedCandidates.some((c) => c.name === candidate.name);

	return (
		<div className="space-y-3">
			<h3 className="text-sm font-semibold text-gray-700">
				経由地の候補 ({selectedCandidates.length}件選択中)
			</h3>
			<div className="space-y-2">
				{candidates.map((candidate) => {
					const selected = isSelected(candidate);
					return (
						<button
							key={candidate.name}
							type="button"
							onClick={() => onSelect(candidate)}
							className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
								selected
									? 'border-blue-500 bg-blue-50 shadow-md'
									: 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
							}`}
						>
							<div className="flex items-start gap-3">
								<div
									className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
										selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
									}`}
								>
									{selected && (
										<svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<h4 className="font-medium text-gray-900">{candidate.name}</h4>
									<p className="mt-1 text-sm text-gray-600">{candidate.description}</p>
									{candidate.address && (
										<p className="mt-1 text-xs text-gray-400">{candidate.address}</p>
									)}
								</div>
							</div>
						</button>
					);
				})}
			</div>
			<button
				type="button"
				onClick={onConfirm}
				disabled={selectedCandidates.length === 0 || isSearching}
				className="w-full rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:opacity-50"
			>
				{isSearching ? (
					<span className="flex items-center justify-center gap-2">
						<svg
							className="h-4 w-4 animate-spin"
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
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						ルート検索中...
					</span>
				) : (
					'このルートで検索'
				)}
			</button>
		</div>
	);
}
