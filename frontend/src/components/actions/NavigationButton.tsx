import type { RouteData } from '../../types/route';
import { generateGoogleMapsUrl } from '../../utils/deeplink';
import './NavigationButton.css';

interface NavigationButtonProps {
	route: RouteData;
}

export function NavigationButton({ route }: NavigationButtonProps) {
	const handleClick = () => {
		const url = generateGoogleMapsUrl(route.origin, route.destination, route.waypoints);
		window.open(url, '_blank', 'noopener,noreferrer');
	};

	return (
		<button className="navigation-button" onClick={handleClick}>
			🚀 Googleマップでナビを開始
		</button>
	);
}
