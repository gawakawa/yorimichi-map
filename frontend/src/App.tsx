import './index.css';
import { AppLayout } from './components/Layout/AppLayout';
import { ChatPanel } from './components/Chat/ChatPanel';
import { MapPanel } from './components/Map/MapPanel';

function App() {
	return <AppLayout chatPanel={<ChatPanel />} mapPanel={<MapPanel />} />;
}

export default App;
