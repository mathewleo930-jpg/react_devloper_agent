import { describe, expect, it } from 'vitest';
import { createSeedState } from '../data/mockData.js';
import { nextTicketNumber, ticketReducer } from './ticketReducer.js';

const NOW = Date.UTC(2026, 9, 12, 12);
const seed = () => createSeedState(NOW);
const find = (state, id) => state.tickets.find((t) => t.id === id);

describe('ticketReducer', () => {
  it('creates an open ticket with the next number and the description as first message', () => {
    const state = seed();
    const number = nextTicketNumber(state.tickets);
    const next = ticketReducer(state, {
      type: 'createTicket',
      now: NOW,
      payload: { subject: '  Broken export ', description: 'It fails', priority: 'high', category: 'Bug report', channel: 'web', customerId: 'c1', assigneeId: '' },
    });
    const created = next.tickets[0];
    expect(created).toMatchObject({ id: `TCK-${number}`, subject: 'Broken export', status: 'open', assigneeId: null });
    expect(created.messages).toEqual([expect.objectContaining({ author: 'customer', authorId: 'c1', body: 'It fails' })]);
    expect(next.tickets).toHaveLength(state.tickets.length + 1);
  });

  it('uses a database-assigned number when one is given', () => {
    const next = ticketReducer(seed(), {
      type: 'createTicket',
      number: 1234,
      payload: { subject: 'x', description: 'y', priority: 'low', category: 'Billing', channel: 'email', customerId: 'c2' },
    });
    expect(next.tickets[0].id).toBe('TCK-1234');
  });

  it('records an activity entry per changed field and skips unchanged ones', () => {
    const state = seed();
    const before = find(state, 'TCK-1044');
    const next = ticketReducer(state, { type: 'updateTicket', id: 'TCK-1044', now: NOW + 1, changes: { status: 'in_progress', priority: before.priority } });
    const after = find(next, 'TCK-1044');
    expect(after.status).toBe('in_progress');
    expect(after.updatedAt).toBe(NOW + 1);
    expect(after.activity.slice(before.activity.length).map((a) => a.text)).toEqual(['Status changed to In progress by Priya Nair']);
  });

  it('leaves the ticket object untouched when nothing changes', () => {
    const state = seed();
    const next = ticketReducer(state, { type: 'updateTicket', id: 'TCK-1044', changes: { status: 'open' } });
    expect(find(next, 'TCK-1044')).toBe(find(state, 'TCK-1044'));
  });

  it('bulk-assigns only the selected tickets', () => {
    const next = ticketReducer(seed(), { type: 'bulkUpdate', ids: ['TCK-1044', 'TCK-1043'], changes: { assigneeId: 'a2' } });
    expect(find(next, 'TCK-1044').assigneeId).toBe('a2');
    expect(find(next, 'TCK-1043').assigneeId).toBe('a2');
    expect(find(next, 'TCK-1032').assigneeId).toBeNull();
  });

  it('a public reply sets first response time; an internal note does not', () => {
    const state = seed();
    const noted = ticketReducer(state, { type: 'addReply', id: 'TCK-1044', body: 'Looking', internal: true, now: NOW + 5 });
    expect(find(noted, 'TCK-1044').firstResponseAt).toBeNull();
    const replied = ticketReducer(noted, { type: 'addReply', id: 'TCK-1044', body: 'Hi!', status: 'pending', now: NOW + 9 });
    const t = find(replied, 'TCK-1044');
    expect(t.firstResponseAt).toBe(NOW + 9);
    expect(t.status).toBe('pending');
    expect(t.messages.at(-1)).toMatchObject({ author: 'agent', authorId: 'a1', body: 'Hi!', internal: false });
  });

  it('throws on unknown actions', () => {
    expect(() => ticketReducer(seed(), { type: 'nope' })).toThrow('Unknown action: nope');
  });
});
