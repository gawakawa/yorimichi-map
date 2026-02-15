import type { Route } from '../../api/navigation';
import { RouteMap } from './RouteMap';
import { RouteSummary } from './RouteSummary';

interface MapPanelProps {
	route: Route | null;
}

export function MapPanel({ route }: MapPanelProps) {
	return (
		<div className="flex h-full flex-col">
			<div className="border-b border-gray-200 bg-white p-5 shadow-sm">
				<RouteSummary
					distance={route?.distance_meters}
					duration={route?.duration_seconds ? parseInt(route.duration_seconds, 10) : undefined}
					waypoints={route?.waypoints}
				/>
			</div>
			<div className="relative flex-1 overflow-hidden">
				<RouteMap route={route} />
			</div>
		</div>
	);
}
