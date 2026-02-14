export function formatDistance(meters: number): string {
	if (meters < 1000) {
		return `${meters}m`;
	}
	const km = meters / 1000;
	return `${km.toFixed(1)}km`;
}

export function formatDuration(seconds: number): string {
	if (seconds < 60) {
		return `${seconds}秒`;
	}

	const minutes = Math.floor(seconds / 60);

	if (minutes < 60) {
		return `${minutes}分`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (remainingMinutes === 0) {
		return `${hours}時間`;
	}

	return `${hours}時間${remainingMinutes}分`;
}
