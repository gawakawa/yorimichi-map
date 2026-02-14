import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../src/components/Chat/ChatInput';

describe('ChatInput', () => {
	it('should render input field and send button', () => {
		render(<ChatInput onSend={vi.fn()} />);

		expect(screen.getByRole('textbox')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
	});

	it('should disable send button when input is empty', () => {
		render(<ChatInput onSend={vi.fn()} />);

		const sendButton = screen.getByRole('button', { name: /send/i });
		expect(sendButton).toBeDisabled();
	});

	it('should disable send button when input contains only whitespace', async () => {
		const user = userEvent.setup();
		render(<ChatInput onSend={vi.fn()} />);

		const input = screen.getByRole('textbox');
		await user.type(input, '   ');

		const sendButton = screen.getByRole('button', { name: /send/i });
		expect(sendButton).toBeDisabled();
	});

	it('should enable send button when input has text', async () => {
		const user = userEvent.setup();
		render(<ChatInput onSend={vi.fn()} />);

		const input = screen.getByRole('textbox');
		await user.type(input, 'Hello');

		const sendButton = screen.getByRole('button', { name: /send/i });
		expect(sendButton).toBeEnabled();
	});

	it('should send message on Enter key', async () => {
		const onSend = vi.fn();
		const user = userEvent.setup();
		render(<ChatInput onSend={onSend} />);

		const input = screen.getByRole('textbox');
		await user.type(input, 'Hello{Enter}');

		expect(onSend).toHaveBeenCalledWith('Hello');
		expect(input).toHaveValue('');
	});

	it('should allow newline on Shift+Enter', async () => {
		const onSend = vi.fn();
		const user = userEvent.setup();
		render(<ChatInput onSend={onSend} />);

		const input = screen.getByRole('textbox');
		await user.type(input, 'Hello{Shift>}{Enter}{/Shift}World');

		expect(onSend).not.toHaveBeenCalled();
		expect(input).toHaveValue('Hello\nWorld');
	});

	it('should clear input after sending', async () => {
		const onSend = vi.fn();
		const user = userEvent.setup();
		render(<ChatInput onSend={onSend} />);

		const input = screen.getByRole('textbox') as HTMLTextAreaElement;
		await user.type(input, 'Test message{Enter}');

		expect(onSend).toHaveBeenCalledWith('Test message');
		expect(input.value).toBe('');
	});

	it('should trim whitespace before sending', async () => {
		const onSend = vi.fn();
		const user = userEvent.setup();
		render(<ChatInput onSend={onSend} />);

		const input = screen.getByRole('textbox');
		await user.type(input, '  Hello  {Enter}');

		expect(onSend).toHaveBeenCalledWith('Hello');
	});
});
