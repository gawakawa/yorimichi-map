import { formatDistance, formatDuration, formatCurrency } from '../../utils/format';

interface RouteSummaryProps {
	distance?: number;
	duration?: number;
	fare?: number;
	title?: string;
}

export function RouteSummary({
	distance = 2500,
	duration = 900,
	fare = 210,
	title = 'おすすめルート',
}: RouteSummaryProps) {
	return (
		<div className="rounded-lg border border-gray-200 bg-white p-4">
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
	);
}
