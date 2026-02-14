import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpotsList } from '../src/components/Chat/SpotsList';

interface Spot {
	id: string;
	name: string;
	description: string;
	distance: number;
	rating: number;
}

describe('SpotsList', () => {
	const mockSpots: Spot[] = [
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
	];

	it('should render spots list', () => {
		render(<SpotsList spots={mockSpots} />);

		expect(screen.getByText('銀座')).toBeInTheDocument();
		expect(screen.getByText('築地市場')).toBeInTheDocument();
	});

	it('should render spot details', () => {
		render(<SpotsList spots={mockSpots} />);

		expect(screen.getByText('ショッピングエリア')).toBeInTheDocument();
		expect(screen.getByText('寿司と海鮮')).toBeInTheDocument();
	});

	it('should render empty state when no spots', () => {
		render(<SpotsList spots={[]} />);

		expect(screen.getByText(/スポットはありません/i)).toBeInTheDocument();
	});

	it('should call onSelect when spot is clicked', async () => {
		const onSelect = vi.fn();
		const user = userEvent.setup();

		render(<SpotsList spots={mockSpots} onSelect={onSelect} />);

		await user.click(screen.getByText('銀座'));

		expect(onSelect).toHaveBeenCalledWith(mockSpots[0]);
	});

	it('should display spot rating', () => {
		render(<SpotsList spots={mockSpots} />);

		const ratings = screen.getAllByText(/★/);
		expect(ratings.length).toBeGreaterThan(0);
	});
});
