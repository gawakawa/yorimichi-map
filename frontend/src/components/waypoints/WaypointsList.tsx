import type { Place } from '../../types/navigation';

interface Props {
	places: Place[];
}

export function WaypointsList({ places }: Props) {
	if (places.length === 0) return null;

	return (
		<div style={{ marginTop: '12px' }}>
			<h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>経由地スポット</h3>
			<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
				{places.map((place, i) => (
					<li
						key={i}
						style={{
							padding: '10px 12px',
							backgroundColor: '#F8F9FA',
							borderRadius: '8px',
							marginBottom: '6px',
							fontSize: '14px',
						}}
					>
						<div style={{ fontWeight: 'bold' }}>
							{String(i + 1)}. {place.name}
						</div>
						<div style={{ color: '#6C757D', fontSize: '13px' }}>{place.address}</div>
						<div style={{ fontSize: '13px', marginTop: '4px' }}>
							<span style={{ color: '#FFC107' }}>{'*'.repeat(Math.round(place.rating))}</span>{' '}
							{String(place.rating)} / {place.price_level}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
