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

  it('list excludes soft-deleted tasks', async () => {
    result = { data: [], error: null };
    await tasksApi.list(20);
    expect(calls).toContainEqual(['is', 'deleted_at', null]);
  });

  it('stats selects the deleted count', async () => {
    result = { data: { total: 3, pending: 1, completed: 2, deleted: 4 }, error: null };
    expect(await tasksApi.stats()).toEqual({ total: 3, pending: 1, completed: 2, deleted: 4 });
    expect(calls).toContainEqual(['from', 'task_stats']);
    expect(calls).toContainEqual(['select', 'total, pending, completed, deleted']);
  });

  it('remove soft-deletes by setting deleted_at instead of deleting', async () => {
    result = { data: { id: 7 }, error: null };
    expect(await tasksApi.remove(7)).toBeNull();
    const names = calls.map(([name]) => name);
    expect(names).not.toContain('delete');
    const update = calls.find(([name]) => name === 'update');
    expect(Object.keys(update[1])).toEqual(['deleted_at']);
    expect(Number.isNaN(Date.parse(update[1].deleted_at))).toBe(false);
    expect(calls).toContainEqual(['eq', 'id', 7]);
    expect(calls).toContainEqual(['is', 'deleted_at', null]);
  });

  it('remove throws "not found" when the task is missing or already deleted', async () => {
    await expect(tasksApi.remove(42)).rejects.toThrow('Task 42 not found');
  });

  it('complete ignores soft-deleted tasks', async () => {
    result = { data: { id: 5, status: 'completed' }, error: null };
    await tasksApi.complete(5);
    expect(calls).toContainEqual(['update', { status: 'completed' }]);
    expect(calls).toContainEqual(['is', 'deleted_at', null]);
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
