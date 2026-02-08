import type { Route } from '../../types/navigation';
import { formatDistance, formatDuration, formatTolls } from '../../utils/format';

interface Props {
	route: Route;
}

export function RouteInfo({ route }: Props) {
	return (
		<div
			style={{
				padding: '12px 16px',
				backgroundColor: '#F8F9FA',
				borderRadius: '8px',
				marginTop: '12px',
			}}
		>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: '8px',
					fontSize: '14px',
				}}
			>
				<div>
					<span style={{ color: '#6C757D' }}>出発: </span>
					<strong>{route.origin}</strong>
				</div>
				<div>
					<span style={{ color: '#6C757D' }}>到着: </span>
					<strong>{route.destination}</strong>
				</div>
				<div>
					<span style={{ color: '#6C757D' }}>所要時間: </span>
					<strong>{formatDuration(route.duration_seconds)}</strong>
				</div>
				<div>
					<span style={{ color: '#6C757D' }}>距離: </span>
					<strong>{formatDistance(route.distance_meters)}</strong>
				</div>
				<div style={{ gridColumn: 'span 2' }}>
					<span style={{ color: '#6C757D' }}>料金(税込): </span>
					<strong>{formatTolls(route.tolls)}</strong>
				</div>
			</div>
		</div>
	);
}
