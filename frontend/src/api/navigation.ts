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
  waypoint_coords: Coords[];
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

export interface WaypointCandidate {
  name: string;
  description: string;
  address?: string;
  coords?: Coords | null;
}

export interface WaypointSuggestRequest {
  origin: string;
  destination: string;
  prompt: string;
}

export interface WaypointSuggestResponse {
  candidates: WaypointCandidate[];
  ai_comment?: string;
}

export interface CalculateRouteRequest {
  origin: string;
  destination: string;
  waypoints?: string[];
}

export interface CalculateRouteResponse {
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
      const body = await response.json().catch(() => ({}));
      throw new APIError(response.status, response.statusText, body.detail);
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
      const body = await response.json().catch(() => ({}));
      throw new APIError(response.status, response.statusText, body.detail);
    }

    return response.json();
  },

  async suggestWaypoints(req: WaypointSuggestRequest): Promise<WaypointSuggestResponse> {
    const url = `${config.apiBaseUrl}/api/navigation/suggest-waypoints/`;

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

  async calculateRoute(req: CalculateRouteRequest): Promise<CalculateRouteResponse> {
    const url = `${config.apiBaseUrl}/api/navigation/calculate-route/`;

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
