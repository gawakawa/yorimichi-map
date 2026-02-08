import polylineCodec from '@mapbox/polyline';
import type { LatLngTuple } from 'leaflet';

export function decodePolyline(encoded: string): LatLngTuple[] {
	return polylineCodec.decode(encoded) as LatLngTuple[];
}
