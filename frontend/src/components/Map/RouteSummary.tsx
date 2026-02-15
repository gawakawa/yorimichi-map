import { formatDistance, formatDuration } from '../../utils/format';

interface RouteSummaryProps {
	origin?: string;
	destination?: string;
	distance?: number;
	duration?: number;
	waypoints?: string[];
	googleMapsUrl?: string;
	title?: string;
}

export function RouteSummary({
	origin,
	destination,
	distance = 2500,
	duration = 900,
	waypoints = [],
	googleMapsUrl,
	title = 'おすすめルート',
}: RouteSummaryProps) {
	return (
		<div className="space-y-4 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-5 shadow-sm">
			<div>
				<div className="mb-4 flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
						<svg
							className="h-5 w-5 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
							/>
						</svg>
					</div>
					<h3 className="flex-1 text-lg font-bold text-gray-800">{title}</h3>
					{googleMapsUrl && (
						<a
							href={googleMapsUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200"
						>
							Google Maps で開く
						</a>
					)}
				</div>

				<div className="space-y-3">
					{origin && (
						<div className="flex items-center justify-between rounded-lg bg-white/60 px-4 py-3">
							<div className="flex items-center gap-2 text-gray-600">
								<div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
									<span className="text-xs font-bold text-white">S</span>
								</div>
								<span className="text-sm font-medium">出発地</span>
							</div>
							<span className="font-semibold text-gray-800">{origin}</span>
						</div>
					)}

					{destination && (
						<div className="flex items-center justify-between rounded-lg bg-white/60 px-4 py-3">
							<div className="flex items-center gap-2 text-gray-600">
								<div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
									<span className="text-xs font-bold text-white">G</span>
								</div>
								<span className="text-sm font-medium">目的地</span>
							</div>
							<span className="font-semibold text-gray-800">{destination}</span>
						</div>
					)}
					<div className="flex items-center justify-between rounded-lg bg-white/60 px-4 py-3">
						<div className="flex items-center gap-2 text-gray-600">
							<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
								/>
							</svg>
							<span className="text-sm font-medium">距離</span>
						</div>
						<span className="font-semibold text-gray-800">{formatDistance(distance)}</span>
					</div>

					<div className="flex items-center justify-between rounded-lg bg-white/60 px-4 py-3">
						<div className="flex items-center gap-2 text-gray-600">
							<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span className="text-sm font-medium">所要時間</span>
						</div>
						<span className="font-semibold text-gray-800">{formatDuration(duration)}</span>
					</div>

					{waypoints.length > 0 && (
						<div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3">
							<div className="mb-2 flex items-center gap-2 text-gray-700">
								<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								<span className="text-sm font-semibold">経由地</span>
							</div>
							<div className="flex flex-wrap gap-2">
								{waypoints.map((waypoint, index) => (
									<span
										key={index}
										className="rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm"
									>
										{waypoint}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
