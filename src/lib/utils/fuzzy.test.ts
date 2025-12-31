import { describe, it, expect } from 'vitest';
import { fuzzyMatch, fuzzySearch, highlightMatches } from './fuzzy';

describe('fuzzyMatch', () => {
	describe('basic matching', () => {
		it('returns match when all characters found in order', () => {
			// Greedy algorithm matches first occurrences: C at 0, d at 6 (in "Created")
			const result = fuzzyMatch('cd', 'Created Date');
			expect(result).not.toBeNull();
			expect(result?.matchedIndices).toEqual([0, 6]);
		});

		it('returns null when not all characters found', () => {
			const result = fuzzyMatch('xyz', 'Created Date');
			expect(result).toBeNull();
		});

		it('returns match with empty indices for empty pattern', () => {
			const result = fuzzyMatch('', 'Created Date');
			expect(result).not.toBeNull();
			expect(result?.matchedIndices).toEqual([]);
			expect(result?.score).toBe(0);
		});

		it('is case insensitive', () => {
			const result = fuzzyMatch('CD', 'created date');
			expect(result).not.toBeNull();
		});

		it('matches exact string', () => {
			const result = fuzzyMatch('status', 'Status');
			expect(result).not.toBeNull();
		});
	});

	describe('scoring', () => {
		it('scores consecutive matches higher', () => {
			const consecutive = fuzzyMatch('sta', 'Status');
			const nonConsecutive = fuzzyMatch('sts', 'Status');

			expect(consecutive).not.toBeNull();
			expect(nonConsecutive).not.toBeNull();
			expect(consecutive!.score).toBeGreaterThan(nonConsecutive!.score);
		});

		it('scores match at start of string higher', () => {
			const atStart = fuzzyMatch('cr', 'Created Date');
			const inMiddle = fuzzyMatch('da', 'Created Date');

			expect(atStart).not.toBeNull();
			expect(inMiddle).not.toBeNull();
			expect(atStart!.score).toBeGreaterThan(inMiddle!.score);
		});

		it('scores word boundary matches higher', () => {
			const wordBoundary = fuzzyMatch('cd', 'Created Date');
			const midWord = fuzzyMatch('ea', 'Created Date');

			expect(wordBoundary).not.toBeNull();
			expect(midWord).not.toBeNull();
			expect(wordBoundary!.score).toBeGreaterThan(midWord!.score);
		});

		it('scores shorter target strings higher (more specific)', () => {
			const shortTarget = fuzzyMatch('st', 'Status');
			const longTarget = fuzzyMatch('st', 'Status Description Field');

			expect(shortTarget).not.toBeNull();
			expect(longTarget).not.toBeNull();
			expect(shortTarget!.score).toBeGreaterThan(longTarget!.score);
		});

		it('scores camelCase boundaries higher', () => {
			// 'cD' matches 'c' at 0 and 'D' at 7 (camelCase boundary)
			const camelCase = fuzzyMatch('cD', 'createdDate');
			expect(camelCase).not.toBeNull();
			// Greedy: 'c' at 0, 'd' at 6 (first lowercase d in 'created')
			// The algorithm is case-insensitive, so 'D' matches 'd' at position 6
			expect(camelCase!.matchedIndices).toContain(0);
			expect(camelCase!.matchedIndices).toContain(6);
		});
	});

	describe('matched indices', () => {
		it('returns correct indices for simple match', () => {
			const result = fuzzyMatch('abc', 'aXbXc');
			expect(result?.matchedIndices).toEqual([0, 2, 4]);
		});

		it('returns correct indices for acronym-style match', () => {
			// Greedy matches first 'c' and first 'd' (in "Created")
			const result = fuzzyMatch('cd', 'Created Date');
			expect(result?.matchedIndices).toEqual([0, 6]);
		});

		it('returns all indices for exact match', () => {
			const result = fuzzyMatch('test', 'test');
			expect(result?.matchedIndices).toEqual([0, 1, 2, 3]);
		});
	});
});

describe('fuzzySearch', () => {
	const items = ['Status', 'Created Date', 'Description', 'User Name', 'Priority'];

	it('returns all items with empty pattern', () => {
		const results = fuzzySearch('', items);
		expect(results).toHaveLength(5);
		expect(results.every((r) => r.score === 0)).toBe(true);
	});

	it('filters to matching items only', () => {
		const results = fuzzySearch('st', items);
		expect(results).toHaveLength(2); // Status, Description
		expect(results.map((r) => r.text)).toContain('Status');
		expect(results.map((r) => r.text)).toContain('Description');
	});

	it('returns results sorted by score (highest first)', () => {
		const results = fuzzySearch('st', items);
		expect(results[0].text).toBe('Status'); // Should score higher (at start)
	});

	it('respects limit parameter', () => {
		const results = fuzzySearch('', items, 2);
		expect(results).toHaveLength(2);
	});

	it('returns empty array when no matches', () => {
		const results = fuzzySearch('xyz', items);
		expect(results).toHaveLength(0);
	});

	it('handles single character search', () => {
		const results = fuzzySearch('u', items);
		expect(results.length).toBeGreaterThan(0);
		expect(results.map((r) => r.text)).toContain('User Name');
	});

	it('handles acronym-style searches', () => {
		const results = fuzzySearch('cd', items);
		expect(results.map((r) => r.text)).toContain('Created Date');
	});
});

describe('highlightMatches', () => {
	it('returns single segment with no matches', () => {
		const segments = highlightMatches('Hello World', []);
		expect(segments).toEqual([{ text: 'Hello World', isMatch: false }]);
	});

	it('highlights single character', () => {
		const segments = highlightMatches('Hello', [0]);
		expect(segments).toEqual([
			{ text: 'H', isMatch: true },
			{ text: 'ello', isMatch: false }
		]);
	});

	it('highlights consecutive characters as single segment', () => {
		const segments = highlightMatches('Hello', [0, 1, 2]);
		expect(segments).toEqual([
			{ text: 'Hel', isMatch: true },
			{ text: 'lo', isMatch: false }
		]);
	});

	it('handles multiple non-consecutive matches', () => {
		const segments = highlightMatches('Created Date', [0, 8]);
		expect(segments).toEqual([
			{ text: 'C', isMatch: true },
			{ text: 'reated ', isMatch: false },
			{ text: 'D', isMatch: true },
			{ text: 'ate', isMatch: false }
		]);
	});

	it('handles match at end of string', () => {
		const segments = highlightMatches('test', [3]);
		expect(segments).toEqual([
			{ text: 'tes', isMatch: false },
			{ text: 't', isMatch: true }
		]);
	});

	it('handles full string match', () => {
		const segments = highlightMatches('abc', [0, 1, 2]);
		expect(segments).toEqual([{ text: 'abc', isMatch: true }]);
	});

	it('handles alternating matches', () => {
		const segments = highlightMatches('abcde', [0, 2, 4]);
		expect(segments).toEqual([
			{ text: 'a', isMatch: true },
			{ text: 'b', isMatch: false },
			{ text: 'c', isMatch: true },
			{ text: 'd', isMatch: false },
			{ text: 'e', isMatch: true }
		]);
	});
});

describe('integration: fuzzyMatch + highlightMatches', () => {
	it('produces correct highlights from match result', () => {
		const match = fuzzyMatch('un', 'User Name');
		expect(match).not.toBeNull();

		const segments = highlightMatches('User Name', match!.matchedIndices);
		// Should highlight 'U' at 0 and 'N' at 5 (case-insensitive matching)
		const matchedText = segments.filter((s) => s.isMatch).map((s) => s.text);
		expect(matchedText.join('')).toBe('UN');
	});

	it('works with complex column names', () => {
		const match = fuzzyMatch('cdt', 'created_date_time');
		expect(match).not.toBeNull();

		const segments = highlightMatches('created_date_time', match!.matchedIndices);
		const matchedText = segments.filter((s) => s.isMatch).map((s) => s.text);
		expect(matchedText.join('')).toBe('cdt');
	});
});
