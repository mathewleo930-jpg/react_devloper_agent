import { beforeEach, describe, expect, it } from 'vitest';
import { createFakeStorage } from '../test-utils.js';
import { FEEDBACK_STORAGE_KEY, LOCAL_LIMIT, submitFeedback } from './feedback.js';

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
const client = { from: (table) => (calls.push(['from', table]), builder) };

const entry = { rating: 5, topic: 'General', message: 'Board view saves us hours.', email: null };
const stored = (storage) => JSON.parse(storage.getItem(FEEDBACK_STORAGE_KEY));

describe('submitFeedback', () => {
  beforeEach(() => {
    calls.length = 0;
    result = { data: null, error: null };
  });

  it('inserts into the feedback table without selecting rows back', async () => {
    await submitFeedback({ ...entry, email: ' sam@example.com ' }, { client });
    expect(calls).toEqual([
      ['from', 'feedback'],
      ['insert', { ...entry, email: 'sam@example.com' }],
    ]);
  });

  it('throws the Supabase error message when the insert fails', async () => {
    result = { data: null, error: { message: 'new row violates row-level security policy' } };
    await expect(submitFeedback(entry, { client })).rejects.toThrow('new row violates row-level security policy');
  });

  it('in demo mode appends to localStorage with a timestamp', async () => {
    const storage = createFakeStorage({ [FEEDBACK_STORAGE_KEY]: JSON.stringify([{ ...entry, createdAt: 1 }]) });
    await submitFeedback(entry, { client: null, storage, now: () => 42 });
    expect(stored(storage)).toEqual([
      { ...entry, createdAt: 1 },
      { ...entry, createdAt: 42 },
    ]);
  });

  it('in demo mode keeps only the newest 50 entries', async () => {
    const old = Array.from({ length: LOCAL_LIMIT }, (_, i) => ({ ...entry, createdAt: i }));
    const storage = createFakeStorage({ [FEEDBACK_STORAGE_KEY]: JSON.stringify(old) });
    await submitFeedback(entry, { client: null, storage, now: () => 999 });
    const saved = stored(storage);
    expect(saved).toHaveLength(LOCAL_LIMIT);
    expect(saved[0].createdAt).toBe(1);
    expect(saved.at(-1).createdAt).toBe(999);
  });

  it('in demo mode recovers from corrupt stored JSON', async () => {
    const storage = createFakeStorage({ [FEEDBACK_STORAGE_KEY]: '{not json' });
    await submitFeedback(entry, { client: null, storage, now: () => 7 });
    expect(stored(storage)).toEqual([{ ...entry, createdAt: 7 }]);
  });

  it('in demo mode lets a storage write failure reject', async () => {
    const storage = {
      ...createFakeStorage(),
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    await expect(submitFeedback(entry, { client: null, storage })).rejects.toThrow('QuotaExceededError');
  });

  it('throws a TypeError for an invalid value before sending anything', async () => {
    await expect(submitFeedback({ ...entry, rating: 9, message: 'short' }, { client })).rejects.toThrow(
      'submitFeedback: invalid rating=9, message="short"',
    );
    await expect(submitFeedback({ ...entry, rating: 9 }, { client })).rejects.toBeInstanceOf(TypeError);
    expect(calls).toEqual([]);
  });
});
