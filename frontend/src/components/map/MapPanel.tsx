import type { Place, Route } from '../../types/navigation';
import { GoogleMapsButton } from '../actions/GoogleMapsButton';
import { ReturnRouteButton } from '../actions/ReturnRouteButton';
import { WaypointsList } from '../waypoints/WaypointsList';
import { RouteInfo } from './RouteInfo';
import { RouteMap } from './RouteMap';

interface Props {
	route: Route | null;
	places: Place[];
	onReturnRoute: (origin: string, destination: string, waypoints: string[]) => void;
	isReturnLoading: boolean;
}

export function MapPanel({ route, places, onReturnRoute, isReturnLoading }: Props) {
	return (
		<div style={{ padding: '16px', height: '100%', overflowY: 'auto' }}>
			<div
				style={{
					fontWeight: 'bold',
					fontSize: '16px',
					marginBottom: '12px',
				}}
			>
				Map
			</div>

			{!route && (
				<div
					style={{
						textAlign: 'center',
						color: '#6C757D',
						marginTop: '80px',
					}}
				>
					<p>ルートが設定されていません</p>
					<p style={{ fontSize: '14px' }}>チャットでルートを検索してください</p>
				</div>
			)}

			{route && (
				<>
					<RouteMap route={route} />
					<RouteInfo route={route} />
					<div style={{ marginTop: '12px' }}>
						<GoogleMapsButton url={route.google_maps_url} />
						<ReturnRouteButton
							route={route}
							onReturnRoute={onReturnRoute}
							isLoading={isReturnLoading}
						/>
					</div>
				</>
			)}

			<WaypointsList places={places} />
		</div>
	);
}
