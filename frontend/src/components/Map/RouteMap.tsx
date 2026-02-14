import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import type { Route } from '../../api/navigation';
import { decodePolyline } from '../../utils/polyline';

const DEFAULT_ZOOM = 14;
const DEFAULT_CENTER: [number, number] = [35.6812, 139.7671]; // Tokyo Station

function MapUpdater({ routePoints }: { routePoints: [number, number][] }) {
	const map = useMap();

	useEffect(() => {
		if (routePoints.length > 0) {
			const bounds: LatLngBoundsExpression = routePoints.map(
				(p) => [p[0], p[1]] as [number, number],
			);
			map.fitBounds(bounds, { padding: [50, 50] });
		}
	}, [map, routePoints]);

	return null;
}

interface RouteMapProps {
	route: Route | null;
}

export function RouteMap({ route }: RouteMapProps) {
	const routePoints = route ? decodePolyline(route.encoded_polyline) : [];
	const hasRoute = routePoints.length > 0;

	const startPoint = hasRoute ? routePoints[0] : null;
	const endPoint = hasRoute ? routePoints[routePoints.length - 1] : null;
	const center = startPoint ?? DEFAULT_CENTER;

	return (
		<MapContainer
			center={center}
			zoom={DEFAULT_ZOOM}
			className="h-full w-full"
			style={{ height: '100%', width: '100%' }}
		>
			<MapUpdater routePoints={routePoints} />
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

			{startPoint && (
				<Marker position={[startPoint[0], startPoint[1]]}>
					<Popup>出発地点</Popup>
				</Marker>
			)}

			{endPoint && (
				<Marker position={[endPoint[0], endPoint[1]]}>
					<Popup>目的地</Popup>
				</Marker>
			)}

			{hasRoute && (
				<Polyline
					positions={routePoints.map((p) => [p[0], p[1]] as [number, number])}
					color="blue"
					weight={4}
					opacity={0.8}
				/>
			)}
		</MapContainer>
	);
}
