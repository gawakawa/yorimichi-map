import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '../src/components/Chat/MessageBubble';

describe('MessageBubble', () => {
	it('should render message text', () => {
		render(<MessageBubble text="Hello" role="user" />);

		expect(screen.getByText('Hello')).toBeInTheDocument();
	});

	it('should apply user styling', () => {
		const { container } = render(<MessageBubble text="Hello" role="user" />);

		const bubble = container.querySelector('[class*="from-blue-500"]');
		expect(bubble).toBeInTheDocument();
	});

	it('should apply assistant styling', () => {
		const { container } = render(<MessageBubble text="Hi there" role="assistant" />);

		const bubble = container.querySelector('[class*="from-blue-50"]');
		expect(bubble).toBeInTheDocument();
	});

	it('should handle multiline text', () => {
		render(<MessageBubble text="Line 1\nLine 2" role="user" />);

		expect(screen.getByText(/Line 1/)).toBeInTheDocument();
	});

	it('should render with correct alignment for user', () => {
		const { container } = render(<MessageBubble text="Hello" role="user" />);

		const wrapper = container.firstChild;
		expect(wrapper?.className).toContain('justify-end');
	});

	it('should render with correct alignment for assistant', () => {
		const { container } = render(<MessageBubble text="Hello" role="assistant" />);

		const wrapper = container.firstChild;
		expect(wrapper?.className).toContain('from-blue-50');
	});
});
