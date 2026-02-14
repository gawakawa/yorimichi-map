import type { Route } from '../../api/navigation';
import { RouteMap } from './RouteMap';

interface MapPanelProps {
	route: Route | null;
}

export function MapPanel({ route }: MapPanelProps) {
	return (
		<div className="flex h-full flex-col">
			<div className="flex-1">
				<RouteMap route={route} />
			</div>
		</div>
	);
}
