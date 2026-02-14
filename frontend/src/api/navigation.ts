import { config } from '../config';

export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
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
	tolls?: Toll[];
	google_maps_url: string;
}

export interface ChatResponse {
	reply: string;
	route?: Route | null;
	places?: Place[] | null;
}

export interface ReturnRouteRequest {
	origin: string;
	destination: string;
	waypoints: string[];
}

export interface ReturnRouteResponse {
	route: Route;
}

export const chatNavigationAPI = {
	async sendMessage(message: string, history: ChatMessage[]): Promise<ChatResponse> {
		const url = `${config.apiBaseUrl}/api/navigation/chat/`;

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message,
				history,
			}),
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status} ${response.statusText}`);
		}

		return response.json();
	},

	async getReturnRoute(req: ReturnRouteRequest): Promise<ReturnRouteResponse> {
		const url = `${config.apiBaseUrl}/api/navigation/return-route/`;

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(req),
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status} ${response.statusText}`);
		}

		return response.json();
	},
};
