import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet';
import type { Route } from '../../types/navigation';
import { decodePolyline } from '../../utils/polyline';

const startIcon = new L.Icon({
	iconUrl:
		'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

const endIcon = new L.Icon({
	iconUrl:
		'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

interface Props {
	route: Route;
}

export function RouteMap({ route }: Props) {
	const points = decodePolyline(route.encoded_polyline);

	if (points.length === 0) {
		return (
			<div style={{ padding: '20px', textAlign: 'center', color: '#6C757D' }}>
				ルートデータがありません
			</div>
		);
	}

	const firstPoint = points[0];
	const lastPoint = points[points.length - 1];
	const midIndex = Math.floor(points.length / 2);
	const midPoint = points[midIndex];

	if (!firstPoint || !lastPoint || !midPoint) {
		return null;
	}

	return (
		<MapContainer
			center={midPoint}
			zoom={10}
			style={{ height: '400px', width: '100%', borderRadius: '8px' }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<Polyline positions={points} pathOptions={{ color: '#007AFF', weight: 5, opacity: 0.7 }} />
			<Marker position={firstPoint} icon={startIcon} />
			<Marker position={lastPoint} icon={endIcon} />
		</MapContainer>
	);
}
