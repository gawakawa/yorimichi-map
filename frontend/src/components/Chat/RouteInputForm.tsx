interface RouteInputFormProps {
	origin: string;
	destination: string;
	onOriginChange: (value: string) => void;
	onDestinationChange: (value: string) => void;
}

export function RouteInputForm({
	origin,
	destination,
	onOriginChange,
	onDestinationChange,
}: RouteInputFormProps) {
	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<span className="w-12 text-sm text-gray-600">出発</span>
				<input
					type="text"
					value={origin}
					onChange={(e) => onOriginChange(e.target.value)}
					placeholder="出発地を入力"
					className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
				/>
			</div>
			<div className="flex items-center gap-2">
				<span className="w-12 text-sm text-gray-600">到着</span>
				<input
					type="text"
					value={destination}
					onChange={(e) => onDestinationChange(e.target.value)}
					placeholder="目的地を入力"
					className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
				/>
			</div>
		</div>
	);
}
