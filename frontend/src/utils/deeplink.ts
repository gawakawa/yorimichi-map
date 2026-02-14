import type { LatLng } from '../types/route';

/**
 * Google Maps Deep Link URLを生成
 * @param origin 出発地
 * @param destination 目的地
 * @param waypoints 経由地の配列
 * @returns Google Maps URL
 */
export function generateGoogleMapsUrl(
	origin: LatLng,
	destination: LatLng,
	waypoints: LatLng[],
): string {
	const params = new URLSearchParams({
		api: '1',
		origin: `${origin.lat},${origin.lng}`,
		destination: `${destination.lat},${destination.lng}`,
		travelmode: 'driving',
	});

	// 経由地がある場合は追加
	if (waypoints.length > 0) {
		const waypointsStr = waypoints.map((wp) => `${wp.lat},${wp.lng}`).join('|');
		params.append('waypoints', waypointsStr);
	}

	return `https://www.google.com/maps/dir/?${params.toString()}`;
}
