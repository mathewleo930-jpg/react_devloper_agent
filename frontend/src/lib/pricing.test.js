import { describe, expect, it } from 'vitest';
import { applyDiscount, formatPrice } from './pricing.js';

describe('pricing helpers', () => {
  it('applyDiscount takes 10% off 29 to give 26.10', () => {
    expect(applyDiscount(29, 10)).toBe(26.1);
  });

  it('applyDiscount leaves the amount unchanged at 0% and returns 0 at 100%', () => {
    expect(applyDiscount(29, 0)).toBe(29);
    expect(applyDiscount(29, 100)).toBe(0);
  });

  it('applyDiscount returns 0 for a zero amount', () => {
    expect(applyDiscount(0, 10)).toBe(0);
  });

  it('applyDiscount rounds to whole cents', () => {
    expect(applyDiscount(19.99, 10)).toBe(17.99);
  });

  it('applyDiscount rejects a negative amount, percent below 0 or above 100, and NaN, with RangeError/TypeError', () => {
    expect(() => applyDiscount(-1, 10)).toThrow(RangeError);
    expect(() => applyDiscount(-1, 10)).toThrow(/-1/);
    expect(() => applyDiscount(29, -5)).toThrow(RangeError);
    expect(() => applyDiscount(29, 101)).toThrow(/101/);
    expect(() => applyDiscount(Number.NaN, 10)).toThrow(TypeError);
    expect(() => applyDiscount(29, '10')).toThrow(TypeError);
    expect(() => applyDiscount(29, Infinity)).toThrow(/Infinity/);
  });

  it('formatPrice prints whole dollars without decimals and fractions with two', () => {
    expect(formatPrice(29)).toBe('$29');
    expect(formatPrice(0)).toBe('$0');
    expect(formatPrice(26.1)).toBe('$26.10');
    expect(formatPrice(17.99)).toBe('$17.99');
  });

  it('formatPrice rejects negative or non-numeric amounts', () => {
    expect(() => formatPrice(-3)).toThrow(RangeError);
    expect(() => formatPrice('29')).toThrow(TypeError);
    expect(() => formatPrice(Number.NaN)).toThrow(/NaN/);
  });
});
