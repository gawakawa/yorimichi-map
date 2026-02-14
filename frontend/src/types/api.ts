export interface RouteStep {
	distance: number;
	duration: number;
	instructions: string;
	start_location: [number, number];
	end_location: [number, number];
}

export interface RouteAlternative {
	polyline: string;
	distance: number;
	duration: number;
	steps: RouteStep[];
	summary: string;
}

export interface NavigationResponse {
	routes: RouteAlternative[];
	status: string;
}
