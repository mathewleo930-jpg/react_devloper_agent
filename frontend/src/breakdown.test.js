import { describe, expect, it } from 'vitest';
import { toBreakdown } from './breakdown.js';

describe('toBreakdown', () => {
  it('returns completed, pending, deleted in fixed order with counts', () => {
    const items = toBreakdown({ pending: 5, deleted: 2, completed: 3 });
    expect(items.map(({ key, label, value }) => [key, label, value])).toEqual([
      ['completed', 'Completed', 3],
      ['pending', 'Pending', 5],
      ['deleted', 'Deleted', 2],
    ]);
  });

  it('computes rounded percentages of the combined total', () => {
    const items = toBreakdown({ completed: 1, pending: 1, deleted: 1 });
    expect(items.map((item) => item.percent)).toEqual([33, 33, 33]);
    const tenths = toBreakdown({ completed: 3, pending: 5, deleted: 2 });
    expect(tenths.map((item) => item.percent)).toEqual([30, 50, 20]);
  });

  it('returns 0 percent for every state when there are no tasks', () => {
    const items = toBreakdown({ completed: 0, pending: 0, deleted: 0 });
    expect(items.map((item) => [item.value, item.percent])).toEqual([
      [0, 0],
      [0, 0],
      [0, 0],
    ]);
  });

  it('throws naming the field for a negative count', () => {
    expect(() => toBreakdown({ completed: 1, pending: -2, deleted: 0 })).toThrow(
      new TypeError('Invalid task count for pending: -2'),
    );
  });

  it('throws for a non-integer or missing count', () => {
    expect(() => toBreakdown({ completed: 1.5, pending: 0, deleted: 0 })).toThrow(
      'Invalid task count for completed: 1.5',
    );
    expect(() => toBreakdown({ completed: 1, pending: 0 })).toThrow('Invalid task count for deleted: undefined');
    expect(() => toBreakdown({ completed: '1', pending: 0, deleted: 0 })).toThrow(TypeError);
    expect(() => toBreakdown(null)).toThrow(TypeError);
  });
});
