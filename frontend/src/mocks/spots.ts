export interface MockSpot {
	id: string;
	name: string;
	description: string;
	distance: number;
	rating: number;
}

export const MOCK_SPOTS: MockSpot[] = [
	{
		id: '1',
		name: '銀座',
		description: 'ショッピングエリア',
		distance: 0.5,
		rating: 4.5,
	},
	{
		id: '2',
		name: '築地市場',
		description: '寿司と海鮮',
		distance: 1.2,
		rating: 4.8,
	},
	{
		id: '3',
		name: '浜離宮恩賜庭園',
		description: '日本庭園',
		distance: 1.8,
		rating: 4.6,
	},
];
