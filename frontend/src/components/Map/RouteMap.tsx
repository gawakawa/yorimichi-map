import { MapContainer, TileLayer } from 'react-leaflet';

const TOKYO_CENTER: [number, number] = [35.6762, 139.6503];
const DEFAULT_ZOOM = 13;

export function RouteMap() {
	return (
		<MapContainer
			center={TOKYO_CENTER}
			zoom={DEFAULT_ZOOM}
			className="h-full w-full"
			style={{ height: '100%', width: '100%' }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
		</MapContainer>
	);
}
