export function formatDuration(durationStr: string): string {
	const match = /(\d+)s/.exec(durationStr);
	if (!match?.[1]) return durationStr;

	const totalSeconds = parseInt(match[1], 10);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);

	if (hours > 0) {
		return `${String(hours)}時間${String(minutes)}分`;
	}
	return `${String(minutes)}分`;
}

export function formatDistance(meters: number): string {
	if (meters >= 1000) {
		return `${(meters / 1000).toFixed(1)}km`;
	}
	return `${String(meters)}m`;
}

export function formatTolls(tolls: { currencyCode: string; units: string }[]): string {
	if (tolls.length === 0) return 'なし';

	return tolls
		.map((t) => {
			if (t.currencyCode === 'JPY') {
				return `¥${t.units}`;
			}
			return `${t.units} ${t.currencyCode}`;
		})
		.join(', ');
}
