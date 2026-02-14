import { describe, it, expect } from 'vitest';
import { decodePolyline } from '../src/utils/polyline';

describe('polyline', () => {
	it('should decode a polyline string', () => {
		// Sample polyline from Google Maps (small segment)
		const encoded = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';

		const result = decodePolyline(encoded);

		expect(result).toHaveLength(3);
		expect(result[0]).toEqual([38.5, -120.2]);
		expect(result[1]).toEqual([40.7, -120.95]);
		expect(result[2]).toEqual([43.252, -126.453]);
	});

	it('should return empty array for empty string', () => {
		const result = decodePolyline('');

		expect(result).toEqual([]);
	});

	it('should handle single point', () => {
		const encoded = '??';

		const result = decodePolyline(encoded);

		expect(result).toHaveLength(1);
	});

	it('should return array of [lat, lng] tuples', () => {
		const encoded = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';

		const result = decodePolyline(encoded);

		result.forEach((point) => {
			expect(Array.isArray(point)).toBe(true);
			expect(point).toHaveLength(2);
			expect(typeof point[0]).toBe('number');
			expect(typeof point[1]).toBe('number');
		});
	});
});
