import { RouteMap } from './RouteMap';
import { RouteSummary } from './RouteSummary';

export function MapPanel() {
	return (
		<div className="flex h-full flex-col">
			<div className="border-b border-gray-200 bg-white p-5 shadow-sm">
				<RouteSummary />
			</div>
			<div className="relative flex-1 overflow-hidden">
				<RouteMap />
			</div>
		</div>
	);
}
