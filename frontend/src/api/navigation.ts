import { config } from '../config';
import { APIError } from './errors';

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

// Mock data for development/testing
const MOCK_ROUTE: Route = {
	origin: '東京駅',
	destination: '箱根湯本駅',
	waypoints: ['小田原城', '芦ノ湖'],
	duration_seconds: '5400',
	distance_meters: 95000,
	encoded_polyline: 'wyueFhvspV~@mAhA}A|@uApAsArAxAlAxAlA|@uApAsArAxAlAlAxAxAxAxAxAxA',
	google_maps_url: 'https://www.google.com/maps/dir/?api=1&origin=Tokyo+Station&destination=Hakone',
};

const MOCK_PLACES: Place[] = [
	{
		name: '小田原城',
		address: '神奈川県小田原市城内1',
		rating: 4.2,
		coords: { latitude: 35.2474, longitude: 139.1549 },
		price_level: '¥¥',
	},
	{
		name: '箱根彫刻の森美術館',
		address: '神奈川県箱根町二ノ平1121',
		rating: 4.5,
		coords: { latitude: 35.2287, longitude: 139.1123 },
		price_level: '¥¥¥',
	},
	{
		name: '芦ノ湖',
		address: '神奈川県箱根町元箱根',
		rating: 4.6,
		coords: { latitude: 35.2074, longitude: 139.1028 },
		price_level: '無料',
	},
];

function useMockAPI(): boolean {
	// Check if VITE_USE_MOCK_API is explicitly set to 'false'
	const mockAPIEnv = import.meta.env.VITE_USE_MOCK_API;
	if (mockAPIEnv === 'false') {
		return false;
	}
	// Use mock API if env is set to 'true' or if no API base URL is configured
	return mockAPIEnv === 'true' || !config.apiBaseUrl || config.apiBaseUrl.includes('undefined');
}

async function getMockResponse(message: string): Promise<ChatResponse> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 800));

	// Check if message contains location keywords
	const hasRoute = /(?:駅|から|まで|行き|箱根|東京|小田原)/.test(message);

	return {
		reply: `了解しました。「${message}」というご要望ですね。\n\n推奨ルートを計算しました。以下のルートをご提案します：\n\n📍 出発地: 東京駅\n📍 目的地: 箱根湯本駅\n⏱️ 所要時間: 約1.5時間\n📏 距離: 約95km\n\n経由地として小田原城と芦ノ湖を提案します。ぜひご検討ください！`,
		route: hasRoute ? MOCK_ROUTE : null,
		places: hasRoute ? MOCK_PLACES : null,
	};
}

export const chatNavigationAPI = {
	async sendMessage(message: string, history: ChatMessage[]): Promise<ChatResponse> {
		// Use mock API in development or if real API is unavailable
		if (useMockAPI()) {
			console.log('[Mock API] sendMessage:', message);
			return getMockResponse(message);
		}

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
			const body = await response.json().catch(() => ({}));
			throw new APIError(response.status, response.statusText, body.detail);
		}

		return response.json();
	},

	async getReturnRoute(req: ReturnRouteRequest): Promise<ReturnRouteResponse> {
		// Use mock API in development
		if (useMockAPI()) {
			console.log('[Mock API] getReturnRoute:', req);
			// Return reverse route
			return {
				route: {
					...MOCK_ROUTE,
					origin: req.destination,
					destination: req.origin,
					waypoints: [...req.waypoints].reverse(),
				},
			};
		}

		const url = `${config.apiBaseUrl}/api/navigation/return-route/`;

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(req),
		});

		if (!response.ok) {
			const body = await response.json().catch(() => ({}));
			throw new APIError(response.status, response.statusText, body.detail);
		}

		return response.json();
	},
};
