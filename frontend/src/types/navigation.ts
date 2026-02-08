export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export interface ChatRequest {
	message: string;
	history: ChatMessage[];
}

export interface Coords {
	latitude: number;
	longitude: number;
}

export interface Place {
	name: string;
	address: string;
	rating: number;
	coords: Coords;
	price_level: string;
}

export interface Toll {
	currencyCode: string;
	units: string;
}

export interface Route {
	origin: string;
	destination: string;
	waypoints: string[];
	duration_seconds: string;
	distance_meters: number;
	encoded_polyline: string;
	tolls: Toll[];
	google_maps_url: string;
}

export interface ChatResponse {
	reply: string;
	route: Route | null;
	places: Place[] | null;
}

export interface ReturnRouteRequest {
	origin: string;
	destination: string;
	waypoints: string[];
}

export interface ReturnRouteResponse {
	route: Route;
}
