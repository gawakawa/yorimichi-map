import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';
import type { LatLng } from '../../types/route';

interface RoutePolylineProps {
	path: LatLng[];
}

export function RoutePolyline({ path }: RoutePolylineProps) {
	const map = useMap();
	const geometryLib = useMapsLibrary('geometry');
	const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

	useEffect(() => {
		if (!map || !geometryLib) return;

		// Polylineを作成
		const poly = new google.maps.Polyline({
			path: path,
			geodesic: true,
			strokeColor: '#4285F4',
			strokeOpacity: 1.0,
			strokeWeight: 4,
		});

		poly.setMap(map);
		setPolyline(poly);

		// ルート全体が見えるように地図の範囲を調整
		const bounds = new google.maps.LatLngBounds();
		path.forEach((point) => {
			bounds.extend(point);
		});
		map.fitBounds(bounds);

		// クリーンアップ
		return () => {
			poly.setMap(null);
		};
	}, [map, geometryLib, path]);

	return null;
}
