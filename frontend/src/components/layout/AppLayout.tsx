import type { ReactNode } from 'react';

interface Props {
	left: ReactNode;
	right: ReactNode;
}

export function AppLayout({ left, right }: Props) {
	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: '1fr 1fr',
				height: '100vh',
				width: '100%',
			}}
		>
			<div style={{ height: '100%', overflow: 'hidden' }}>{left}</div>
			<div style={{ height: '100%', overflow: 'hidden' }}>{right}</div>
		</div>
	);
}
