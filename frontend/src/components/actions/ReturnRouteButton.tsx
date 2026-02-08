import type { Route } from '../../types/navigation';

interface Props {
	route: Route;
	onReturnRoute: (origin: string, destination: string, waypoints: string[]) => void;
	isLoading: boolean;
}

export function ReturnRouteButton({ route, onReturnRoute, isLoading }: Props) {
	const handleClick = () => {
		onReturnRoute(route.origin, route.destination, route.waypoints);
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={isLoading}
			style={{
				padding: '10px 20px',
				backgroundColor: '#6C757D',
				color: '#fff',
				borderRadius: '8px',
				border: 'none',
				fontSize: '14px',
				fontWeight: 'bold',
				cursor: isLoading ? 'not-allowed' : 'pointer',
				opacity: isLoading ? 0.6 : 1,
				marginTop: '8px',
				marginLeft: '8px',
			}}
		>
			{isLoading ? '計算中...' : '帰り道を生成'}
		</button>
	);
}
