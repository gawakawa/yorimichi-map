import type { RouteData } from '../../types/route';
import './RouteSummary.css';

interface RouteSummaryProps {
	route: RouteData;
}

export function RouteSummary({ route }: RouteSummaryProps) {
	return (
		<div className="route-summary">
			<h3 className="summary-title">ルート情報</h3>
			<div className="summary-items">
				<div className="summary-item">
					<span className="summary-icon">⏱️</span>
					<span className="summary-label">所要時間:</span>
					<span className="summary-value">{route.duration}</span>
				</div>
				<div className="summary-item">
					<span className="summary-icon">📏</span>
					<span className="summary-label">距離:</span>
					<span className="summary-value">{route.distance}</span>
				</div>
				<div className="summary-item">
					<span className="summary-icon">💴</span>
					<span className="summary-label">通行料金:</span>
					<span className="summary-value">¥{route.toll.toLocaleString()}</span>
				</div>
			</div>
		</div>
	);
}
