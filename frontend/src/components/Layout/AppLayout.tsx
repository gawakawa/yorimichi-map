import { ReactNode } from 'react';

interface AppLayoutProps {
	chatPanel: ReactNode;
	mapPanel: ReactNode;
}

export function AppLayout({ chatPanel, mapPanel }: AppLayoutProps) {
	return (
		<div className="grid h-screen grid-cols-1 md:grid-cols-[1fr_1.2fr]">
			<div className="flex flex-col border-b border-gray-200 bg-gray-50 md:border-r md:border-b-0">
				{chatPanel}
			</div>
			<div className="flex flex-col">{mapPanel}</div>
		</div>
	);
}
