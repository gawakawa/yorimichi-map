import type { Waypoint } from '../../types/route';
import './WaypointList.css';

interface WaypointListProps {
	waypoints: Waypoint[];
}

export function WaypointList({ waypoints }: WaypointListProps) {
	if (waypoints.length === 0) {
		return null;
	}

	return (
		<div className="waypoint-list">
			<h3 className="waypoint-title">経由地</h3>
			<div className="waypoint-items">
				{waypoints.map((waypoint, index) => (
					<div key={waypoint.id} className="waypoint-item">
						<div className="waypoint-number">{index + 1}</div>
						<div className="waypoint-info">
							<div className="waypoint-name">{waypoint.name}</div>
							{waypoint.address && <div className="waypoint-address">{waypoint.address}</div>}
							{waypoint.rating && (
								<div className="waypoint-rating">
									⭐ {waypoint.rating.toFixed(1)}
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
