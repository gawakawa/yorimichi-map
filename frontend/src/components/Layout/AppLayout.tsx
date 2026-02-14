import { ReactNode } from 'react';
import './AppLayout.css';

interface AppLayoutProps {
	chatPanel: ReactNode;
	mapPanel: ReactNode;
}

export function AppLayout({ chatPanel, mapPanel }: AppLayoutProps) {
	return (
		<div className="app-layout">
			<div className="chat-column">{chatPanel}</div>
			<div className="map-column">{mapPanel}</div>
		</div>
	);
}
