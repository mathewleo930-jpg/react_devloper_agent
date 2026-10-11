import { describe, expect, it } from 'vitest';
import { DESCRIPTION_MAX, TITLE_MAX, isNearLimit } from './charLimit.js';

describe('isNearLimit', () => {
  it('isNearLimit is false below 90% of the limit', () => {
    expect(isNearLimit(179, 200)).toBe(false);
    expect(isNearLimit(0, 200)).toBe(false);
    expect(isNearLimit(1799, 2000)).toBe(false);
  });

  it('isNearLimit is true at exactly 90% and at the limit', () => {
    expect(isNearLimit(180, 200)).toBe(true);
    expect(isNearLimit(200, 200)).toBe(true);
    expect(isNearLimit(1800, 2000)).toBe(true);
  });

  it('isNearLimit throws a TypeError naming a negative or non-integer length', () => {
    expect(() => isNearLimit(-1, 200)).toThrow(
      new TypeError('isNearLimit: length must be a non-negative integer, got -1'),
    );
    expect(() => isNearLimit(1.5, 200)).toThrow('got 1.5');
    expect(() => isNearLimit('12', 200)).toThrow(TypeError);
  });

  it('isNearLimit throws a TypeError naming a zero or non-integer max', () => {
    expect(() => isNearLimit(0, 0)).toThrow(new TypeError('isNearLimit: max must be a positive integer, got 0'));
    expect(() => isNearLimit(0, 2.5)).toThrow('got 2.5');
    expect(() => isNearLimit(0, undefined)).toThrow(TypeError);
  });

  it('exports title and description limits of 200 and 2000', () => {
    expect(TITLE_MAX).toBe(200);
    expect(DESCRIPTION_MAX).toBe(2000);
  });
});
