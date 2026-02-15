import type { WaypointCandidate } from '../../api/navigation';

interface WaypointSelectorProps {
	candidates: WaypointCandidate[];
	selectedCandidates: WaypointCandidate[];
	aiComment?: string;
	onToggle: (name: string) => void;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading: boolean;
}

export function WaypointSelector({
	candidates,
	selectedCandidates,
	aiComment,
	onToggle,
	onConfirm,
	onCancel,
	isLoading,
}: WaypointSelectorProps) {
	const isSelected = (name: string) => selectedCandidates.some((c) => c.name === name);

	return (
		<div className="space-y-4">
			<div className="text-center">
				<h2 className="text-lg font-semibold text-gray-800">経由地を選択</h2>
				<p className="mt-1 text-sm text-gray-600">寄りたいスポットを選んでください（複数選択可）</p>
			</div>

			{aiComment && (
				<div className="rounded-lg bg-blue-50 p-3">
					<p className="text-sm text-blue-800">{aiComment}</p>
				</div>
			)}

			<div className="space-y-2">
				{candidates.map((candidate) => (
					<button
						key={candidate.name}
						type="button"
						onClick={() => onToggle(candidate.name)}
						className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
							isSelected(candidate.name)
								? 'border-blue-500 bg-blue-50'
								: 'border-gray-200 bg-white hover:border-gray-300'
						}`}
					>
						<div className="flex items-start gap-3">
							<div
								className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 ${
									isSelected(candidate.name)
										? 'border-blue-500 bg-blue-500'
										: 'border-gray-300 bg-white'
								}`}
							>
								{isSelected(candidate.name) && (
									<svg
										className="h-3 w-3 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={3}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								)}
							</div>
							<div className="flex-1">
								<h3 className="font-medium text-gray-900">{candidate.name}</h3>
								<p className="mt-1 text-sm text-gray-600">{candidate.description}</p>
								{candidate.address && (
									<p className="mt-1 text-xs text-gray-500">{candidate.address}</p>
								)}
							</div>
						</div>
					</button>
				))}
			</div>

			<div className="flex gap-2">
				<button
					type="button"
					onClick={onCancel}
					disabled={isLoading}
					className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
				>
					戻る
				</button>
				<button
					type="button"
					onClick={onConfirm}
					disabled={isLoading}
					className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
				>
					{isLoading ? (
						<span className="flex items-center justify-center gap-2">
							<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
							計算中...
						</span>
					) : selectedCandidates.length > 0 ? (
						`${selectedCandidates.length}件を経由してルート検索`
					) : (
						'直接ルート検索'
					)}
				</button>
			</div>
		</div>
	);
}
