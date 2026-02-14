import type { RouteData, Waypoint } from '../types/route';

// 東京駅 → 箱根湯本駅（経由地：小田原城、芦ノ湖）
export const sampleRoute: RouteData = {
	origin: { lat: 35.6812, lng: 139.7671 }, // 東京駅
	destination: { lat: 35.2328, lng: 139.1067 }, // 箱根湯本駅
	waypoints: [
		{ lat: 35.2564, lng: 139.1549 }, // 小田原城
		{ lat: 35.2043, lng: 139.024 }, // 芦ノ湖
	],
	// 簡易的なルートパス（実際はDirections APIから取得）
	path: [
		{ lat: 35.6812, lng: 139.7671 }, // 東京駅
		{ lat: 35.6, lng: 139.6 },
		{ lat: 35.5, lng: 139.5 },
		{ lat: 35.4, lng: 139.4 },
		{ lat: 35.3, lng: 139.3 },
		{ lat: 35.2564, lng: 139.1549 }, // 小田原城
		{ lat: 35.23, lng: 139.13 },
		{ lat: 35.2043, lng: 139.024 }, // 芦ノ湖
		{ lat: 35.22, lng: 139.06 },
		{ lat: 35.2328, lng: 139.1067 }, // 箱根湯本駅
	],
	duration: '2時間30分',
	distance: '120km',
	toll: 2500,
};

export const sampleWaypoints: Waypoint[] = [
	{
		id: '1',
		name: '小田原城',
		location: { lat: 35.2564, lng: 139.1549 },
		address: '神奈川県小田原市城内6-1',
		rating: 4.3,
	},
	{
		id: '2',
		name: '芦ノ湖',
		location: { lat: 35.2043, lng: 139.024 },
		address: '神奈川県足柄下郡箱根町元箱根',
		rating: 4.5,
	},
];
