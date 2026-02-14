import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import type { LatLng } from '../../types/route';

interface RouteMarkersProps {
	origin: LatLng;
	destination: LatLng;
	waypoints: LatLng[];
}

export function RouteMarkers({ origin, destination, waypoints }: RouteMarkersProps) {
	return (
		<>
			{/* 出発地マーカー（緑） */}
			<AdvancedMarker position={origin}>
				<Pin background="#34A853" borderColor="#1E8E3E" glyphColor="#fff" />
			</AdvancedMarker>

			{/* 経由地マーカー（番号付き） */}
			{waypoints.map((waypoint, index) => (
				<AdvancedMarker key={`waypoint-${index}`} position={waypoint}>
					<Pin background="#FBBC04" borderColor="#F9AB00" glyphColor="#fff">
						<span style={{ fontSize: '14px', fontWeight: 'bold' }}>{index + 1}</span>
					</Pin>
				</AdvancedMarker>
			))}

			{/* 目的地マーカー（赤） */}
			<AdvancedMarker position={destination}>
				<Pin background="#EA4335" borderColor="#C5221F" glyphColor="#fff" />
			</AdvancedMarker>
		</>
	);
}
