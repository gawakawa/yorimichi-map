import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionButtons } from '../src/components/Map/ActionButtons';

describe('ActionButtons', () => {
	it('should render action buttons', () => {
		const onSearch = vi.fn();
		const onDetails = vi.fn();
		const onShare = vi.fn();

		render(<ActionButtons onSearch={onSearch} onDetails={onDetails} onShare={onShare} />);

		expect(screen.getByRole('button', { name: /検索/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /詳細/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /共有/i })).toBeInTheDocument();
	});

	it('should call onSearch when search button clicked', async () => {
		const onSearch = vi.fn();
		const onDetails = vi.fn();
		const onShare = vi.fn();
		const user = userEvent.setup();

		render(<ActionButtons onSearch={onSearch} onDetails={onDetails} onShare={onShare} />);

		await user.click(screen.getByRole('button', { name: /検索/i }));

		expect(onSearch).toHaveBeenCalledOnce();
	});

	it('should call onDetails when details button clicked', async () => {
		const onSearch = vi.fn();
		const onDetails = vi.fn();
		const onShare = vi.fn();
		const user = userEvent.setup();

		render(<ActionButtons onSearch={onSearch} onDetails={onDetails} onShare={onShare} />);

		await user.click(screen.getByRole('button', { name: /詳細/i }));

		expect(onDetails).toHaveBeenCalledOnce();
	});

	it('should call onShare when share button clicked', async () => {
		const onSearch = vi.fn();
		const onDetails = vi.fn();
		const onShare = vi.fn();
		const user = userEvent.setup();

		render(<ActionButtons onSearch={onSearch} onDetails={onDetails} onShare={onShare} />);

		await user.click(screen.getByRole('button', { name: /共有/i }));

		expect(onShare).toHaveBeenCalledOnce();
	});

	it('should not call any handler when no button is clicked', () => {
		const onSearch = vi.fn();
		const onDetails = vi.fn();
		const onShare = vi.fn();

		render(<ActionButtons onSearch={onSearch} onDetails={onDetails} onShare={onShare} />);

		expect(onSearch).not.toHaveBeenCalled();
		expect(onDetails).not.toHaveBeenCalled();
		expect(onShare).not.toHaveBeenCalled();
	});
});
