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
		<div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
			<div>
				<h3 className="mb-3 text-lg font-semibold">{title}</h3>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-gray-600">距離</span>
						<span className="font-medium">{formatDistance(distance)}</span>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-gray-600">所要時間</span>
						<span className="font-medium">{formatDuration(duration)}</span>
					</div>

					<div className="flex items-center justify-between border-t border-gray-200 pt-2">
						<span className="text-gray-600">料金</span>
						<span className="font-bold text-blue-600">{formatCurrency(fare)}</span>
					</div>
				</div>
			</div>

			<ActionButtons onSearch={onSearch} onDetails={onDetails} onShare={onShare} />
		</div>
	);
}
