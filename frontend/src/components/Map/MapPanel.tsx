import { RouteMap } from './RouteMap';
import { RouteSummary } from './RouteSummary';

export function MapPanel() {
	return (
		<div className="flex h-full flex-col">
			<div className="border-b border-gray-200 bg-white p-4">
				<RouteSummary />
			</div>
			<div className="flex-1">
				<RouteMap />
			</div>
		</div>
	);
}
