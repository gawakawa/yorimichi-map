import { formatDistance, formatDuration, formatCurrency } from '../../utils/format';
import { ActionButtons } from './ActionButtons';

interface RouteSummaryProps {
	distance?: number;
	duration?: number;
	fare?: number;
	title?: string;
	onSearch?: () => void;
	onDetails?: () => void;
	onShare?: () => void;
}

export function RouteSummary({
	distance = 2500,
	duration = 900,
	fare = 210,
	title = 'おすすめルート',
	onSearch = () => console.log('Search'),
	onDetails = () => console.log('Details'),
	onShare = () => console.log('Share'),
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
					<h3 className="text-lg font-bold text-gray-800">{title}</h3>
				</div>

				<div className="space-y-3">
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

					<div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3">
						<div className="flex items-center gap-2 text-gray-700">
							<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span className="text-sm font-semibold">料金</span>
						</div>
						<span className="text-lg font-bold text-blue-600">{formatCurrency(fare)}</span>
					</div>
				</div>
			</div>

			<ActionButtons onSearch={onSearch} onDetails={onDetails} onShare={onShare} />
		</div>
	);
}
