import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useRouteData } from '../../hooks/useRouteData';
import { RoutePolyline } from './RoutePolyline';
import { RouteMarkers } from './RouteMarkers';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

// 東京駅周辺を初期中心座標に設定
const DEFAULT_CENTER = { lat: 35.6812, lng: 139.7671 };
const DEFAULT_ZOOM = 10;

export function MapView() {
	const { data, isLoading, error } = useRouteData();

	if (!API_KEY) {
		return (
			<div style={{ padding: '20px', color: 'red' }}>
				エラー: VITE_GOOGLE_MAPS_API_KEY が設定されていません。
				<br />
				frontend/.env.local ファイルを作成してAPIキーを設定してください。
			</div>
		);
	}

	if (isLoading) {
		return <div style={{ padding: '20px' }}>ルートデータを読み込み中...</div>;
	}

	if (error) {
		return <div style={{ padding: '20px', color: 'red' }}>エラー: {String(error)}</div>;
	}

	if (!data) {
		return <div style={{ padding: '20px' }}>ルートデータがありません</div>;
	}

	return (
		<APIProvider apiKey={API_KEY}>
			<Map
				style={{ width: '100%', height: '600px' }}
				defaultCenter={DEFAULT_CENTER}
				defaultZoom={DEFAULT_ZOOM}
				gestureHandling="greedy"
				disableDefaultUI={false}
				mapId="yorimichi-map"
			>
				<RoutePolyline path={data.route.path} />
				<RouteMarkers
					origin={data.route.origin}
					destination={data.route.destination}
					waypoints={data.route.waypoints}
				/>
			</Map>
		</APIProvider>
	);
}
