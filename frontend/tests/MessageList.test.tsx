import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageList } from '../src/components/Chat/MessageList';

describe('MessageList', () => {
	it('should render empty state', () => {
		render(<MessageList messages={[]} />);

		expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
	});

	it('should render messages', () => {
		const messages = [
			{
				id: '1',
				text: 'Hello',
				role: 'user' as const,
				timestamp: new Date().toISOString(),
			},
			{
				id: '2',
				text: 'Hi there',
				role: 'assistant' as const,
				timestamp: new Date().toISOString(),
			},
		];

		render(<MessageList messages={messages} />);

		expect(screen.getByText('Hello')).toBeInTheDocument();
		expect(screen.getByText('Hi there')).toBeInTheDocument();
	});

	it('should render messages in order', () => {
		const messages = [
			{
				id: '1',
				text: 'First',
				role: 'user' as const,
				timestamp: new Date().toISOString(),
			},
			{
				id: '2',
				text: 'Second',
				role: 'assistant' as const,
				timestamp: new Date().toISOString(),
			},
		];

		const { container } = render(<MessageList messages={messages} />);
		const items = container.querySelectorAll('[class*="rounded-lg"]');

		expect(items[0]).toHaveTextContent('First');
		expect(items[1]).toHaveTextContent('Second');
	});

	it('should have scrollable container', () => {
		render(<MessageList messages={[]} />);

		const container = document.querySelector('[class*="overflow-y-auto"]');
		expect(container).toBeInTheDocument();
	});
});
