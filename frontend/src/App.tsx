import { useState } from 'react';
import './index.css';
import { AppLayout } from './components/Layout/AppLayout';
import { ChatPanel } from './components/Chat/ChatPanel';
import { MapPanel } from './components/Map/MapPanel';
import type { Route } from './api/navigation';

function App() {
	const [origin, setOrigin] = useState('');
	const [destination, setDestination] = useState('');
	const [route, setRoute] = useState<Route | null>(null);

	return (
		<AppLayout
			chatPanel={
				<ChatPanel
					origin={origin}
					destination={destination}
					onOriginChange={setOrigin}
					onDestinationChange={setDestination}
					onRouteReceived={setRoute}
				/>
			}
			mapPanel={<MapPanel route={route} />}
		/>
	);
}

export default App;
