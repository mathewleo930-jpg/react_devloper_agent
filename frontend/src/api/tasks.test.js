import { beforeEach, describe, expect, it, vi } from 'vitest';

// Chainable fake of the supabase-js query builder; awaiting it yields `result`.
let result;
const calls = [];
const builder = new Proxy(
  {},
  {
    get(_, prop) {
      if (prop === 'then') return (resolve) => resolve(result);
      return (...args) => {
        calls.push([prop, ...args]);
        return builder;
      };
    },
  },
);

vi.mock('../lib/supabase.js', () => ({
  supabase: { from: (table) => (calls.push(['from', table]), builder) },
}));

const { tasksApi } = await import('./tasks.js');

describe('tasksApi', () => {
  beforeEach(() => {
    calls.length = 0;
    result = { data: null, error: null };
  });

  it('list queries newest first with the given limit', async () => {
    result = { data: [{ id: 1 }], error: null };
    expect(await tasksApi.list(20)).toEqual([{ id: 1 }]);
    expect(calls).toContainEqual(['from', 'tasks']);
    expect(calls).toContainEqual(['order', 'created_at', { ascending: false }]);
    expect(calls).toContainEqual(['limit', 20]);
  });

  it('create trims input and stores blank description as null', async () => {
    result = { data: { id: 2 }, error: null };
    await tasksApi.create({ title: '  Write docs ', description: '   ' });
    expect(calls).toContainEqual(['insert', { title: 'Write docs', description: null }]);
  });

  it('complete throws "not found" when no row matches', async () => {
    await expect(tasksApi.complete(99)).rejects.toThrow('Task 99 not found');
  });

  it('surfaces Supabase errors as thrown Errors', async () => {
    result = { data: null, error: { message: 'permission denied' } };
    await expect(tasksApi.stats()).rejects.toThrow('permission denied');
  });
});
