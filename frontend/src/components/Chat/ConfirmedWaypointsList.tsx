import type { WaypointCandidate } from '../../api/navigation';

interface ConfirmedWaypointsListProps {
	waypoints: WaypointCandidate[];
	onRemove: (name: string) => void;
}

export function ConfirmedWaypointsList({ waypoints, onRemove }: ConfirmedWaypointsListProps) {
	if (waypoints.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2">
			<h3 className="text-sm font-semibold text-gray-700">寄り道スポット ({waypoints.length}件)</h3>
			<div className="flex flex-wrap gap-2">
				{waypoints.map((waypoint) => (
					<div
						key={waypoint.name}
						className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700"
					>
						<span>{waypoint.name}</span>
						<button
							type="button"
							onClick={() => onRemove(waypoint.name)}
							className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-200 transition-colors hover:bg-emerald-300"
							aria-label={`${waypoint.name}を削除`}
						>
							<svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
