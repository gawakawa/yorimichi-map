import { useState } from 'react';
import './index.css';
import { AppLayout } from './components/Layout/AppLayout';
import { ChatPanel } from './components/Chat/ChatPanel';
import { MapPanel } from './components/Map/MapPanel';
import type { Route } from './api/navigation';

function App() {
	const [route, setRoute] = useState<Route | null>(null);

	return (
		<AppLayout
			chatPanel={<ChatPanel onRouteReceived={setRoute} />}
			mapPanel={<MapPanel route={route} />}
		/>
	);
}

export default App;
