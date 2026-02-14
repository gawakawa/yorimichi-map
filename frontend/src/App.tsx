import { MapView } from './components/map/MapView';
import { RouteSummary } from './components/route/RouteSummary';
import { WaypointList } from './components/route/WaypointList';
import { NavigationButton } from './components/actions/NavigationButton';
import { ReturnRouteButton } from './components/actions/ReturnRouteButton';
import { useRouteData } from './hooks/useRouteData';
import './App.css';

function App() {
	const { data, isLoading, error } = useRouteData();

	return (
		<div className="app-container">
			<div className="left-panel">
				<div className="placeholder">
					<h2>チャット機能</h2>
					<p>実装予定</p>
				</div>
			</div>
			<div className="right-panel">
				<MapView />
				{!isLoading && !error && data && (
					<>
						<RouteSummary route={data.route} />
						<WaypointList waypoints={data.waypoints} />
						<div className="action-buttons">
							<NavigationButton route={data.route} />
							<ReturnRouteButton />
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default App;
