import type { Route } from '../../api/navigation';
import { RouteMap } from './RouteMap';
import { RouteSummary } from './RouteSummary';

interface MapPanelProps {
	route: Route | null;
}

export function MapPanel({ route }: MapPanelProps) {
	return (
		<div className="flex h-full flex-col">
			{route && (
				<div className="border-b border-gray-200 bg-white p-5 shadow-sm">
					<RouteSummary
						origin={route.origin}
						destination={route.destination}
						distance={route.distance_meters}
						duration={parseInt(route.duration_seconds, 10)}
						waypoints={route.waypoints}
						googleMapsUrl={route.google_maps_url}
					/>
				</div>
			)}
			<div className="relative flex-1 overflow-hidden">
				<RouteMap route={route} />
			</div>
		</div>
	);
}
