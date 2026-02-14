import { useQuery } from '@tanstack/react-query';
import { sampleRoute, sampleWaypoints } from '../mocks/sampleRoute';
import type { RouteData, Waypoint } from '../types/route';

interface RouteDataResponse {
	route: RouteData;
	waypoints: Waypoint[];
}

export function useRouteData() {
	return useQuery<RouteDataResponse>({
		queryKey: ['route'],
		queryFn: async () => {
			// モックデータを返す（将来的にはAPIから取得）
			await new Promise((resolve) => setTimeout(resolve, 300)); // ローディングシミュレーション
			return {
				route: sampleRoute,
				waypoints: sampleWaypoints,
			};
		},
	});
}
