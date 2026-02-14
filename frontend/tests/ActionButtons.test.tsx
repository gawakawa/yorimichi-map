import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionButtons } from '../src/components/Map/ActionButtons';

describe('ActionButtons', () => {
	it('should render search button', () => {
		const onSearch = vi.fn();

		render(<ActionButtons onSearch={onSearch} />);

		expect(screen.getByRole('button', { name: /検索/i })).toBeInTheDocument();
	});

	it('should call onSearch when search button clicked', async () => {
		const onSearch = vi.fn();
		const user = userEvent.setup();

		render(<ActionButtons onSearch={onSearch} />);

		await user.click(screen.getByRole('button', { name: /検索/i }));

		expect(onSearch).toHaveBeenCalledOnce();
	});

	it('should not call handler when no button is clicked', () => {
		const onSearch = vi.fn();

		render(<ActionButtons onSearch={onSearch} />);

		expect(onSearch).not.toHaveBeenCalled();
	});
});
