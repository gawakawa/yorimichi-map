import { describe, it, expect } from 'vitest';
import { formatDistance, formatDuration } from '../src/utils/format';

describe('format', () => {
	describe('formatDistance', () => {
		it('should format distance in meters', () => {
			expect(formatDistance(500)).toBe('500m');
		});

		it('should format distance in kilometers', () => {
			expect(formatDistance(1500)).toBe('1.5km');
		});

		it('should round to one decimal place for km', () => {
			expect(formatDistance(1234)).toBe('1.2km');
			expect(formatDistance(5678)).toBe('5.7km');
		});

		it('should handle zero', () => {
			expect(formatDistance(0)).toBe('0m');
		});

		it('should handle large distances', () => {
			expect(formatDistance(10000)).toBe('10.0km');
		});
	});

	describe('formatDuration', () => {
		it('should format seconds', () => {
			expect(formatDuration(30)).toBe('30秒');
		});

		it('should format minutes', () => {
			expect(formatDuration(120)).toBe('2分');
		});

		it('should format hours and minutes', () => {
			expect(formatDuration(3600)).toBe('1時間');
			expect(formatDuration(3660)).toBe('1時間1分');
			expect(formatDuration(5400)).toBe('1時間30分');
		});

		it('should handle zero', () => {
			expect(formatDuration(0)).toBe('0秒');
		});

		it('should not show seconds when > 60 seconds', () => {
			expect(formatDuration(90)).toBe('1分');
			expect(formatDuration(150)).toBe('2分');
		});
	});
});
