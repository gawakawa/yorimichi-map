import { decode } from '@googlemaps/polyline-codec';

export type LatLng = [number, number];

export function decodePolyline(encoded: string): LatLng[] {
  if (!encoded) return [];
  const decoded = decode(encoded);
  return decoded as LatLng[];
}
