interface Spot {
	id: string;
	name: string;
	description: string;
	distance: number;
	rating: number;
}

interface SpotsListProps {
	spots: Spot[];
	onSelect?: (spot: Spot) => void;
}

export function SpotsList({ spots, onSelect }: SpotsListProps) {
	if (spots.length === 0) {
		return (
			<div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-gray-500">
				スポットはありません
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{spots.map((spot) => (
				<button
					key={spot.id}
					onClick={() => onSelect?.(spot)}
					className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left hover:bg-gray-50"
				>
					<div className="flex items-start justify-between">
						<div>
							<h4 className="font-medium">{spot.name}</h4>
							<p className="text-sm text-gray-600">{spot.description}</p>
							<p className="text-sm text-gray-500">{spot.distance}km</p>
						</div>
						<div className="text-right">
							<div className="text-yellow-500">★ {spot.rating.toFixed(1)}</div>
						</div>
					</div>
				</button>
			))}
		</div>
	);
}
