export interface LatLng {
	lat: number;
	lng: number;
}

export interface RouteData {
	origin: LatLng;
	destination: LatLng;
	waypoints: LatLng[];
	path: LatLng[];
	duration: string;
	distance: string;
	toll: number;
}

export interface Waypoint {
	id: string;
	name: string;
	location: LatLng;
	address?: string | undefined;
	rating?: number | undefined;
}
