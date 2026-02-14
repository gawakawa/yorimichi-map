import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import type { LatLng } from '../../utils/polyline';

const DEFAULT_ZOOM = 14;

// Mock route: Tokyo Station -> Ginza -> Tsukiji (sample coordinates)
const MOCK_ROUTE: LatLng[] = [
	[35.6812, 139.7671], // Tokyo Station
	[35.6753, 139.7642], // Yaesu
	[35.6717, 139.7649], // Kyobashi
	[35.6687, 139.7639], // Ginza
	[35.6654, 139.7707], // Tsukiji
];

export function RouteMap() {
	const routePoints = MOCK_ROUTE;
	const startPoint = routePoints[0];
	const endPoint = routePoints[routePoints.length - 1];
	const center = startPoint;

	return (
		<MapContainer
			center={center}
			zoom={DEFAULT_ZOOM}
			className="h-full w-full"
			style={{ height: '100%', width: '100%' }}
		>
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

			{routePoints.length > 0 && (
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
