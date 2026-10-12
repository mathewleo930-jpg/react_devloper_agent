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

const { ticketsApi, toTicket, isRemote } = await import('./tickets.js');

const row = {
  number: 1100,
  subject: 'Help',
  status: 'open',
  priority: 'high',
  category: 'Billing',
  channel: 'email',
  customer_id: 'c1',
  assignee_id: null,
  tags: ['x'],
  created_at: '2026-10-12T10:00:00Z',
  updated_at: '2026-10-12T11:00:00Z',
  first_response_at: null,
  ticket_messages: [
    { id: 2, author: 'agent', author_id: 'a1', body: 'Hi', internal: false, created_at: '2026-10-12T11:00:00Z' },
    { id: 1, author: 'customer', author_id: 'c1', body: 'Help me', internal: false, created_at: '2026-10-12T10:00:00Z' },
  ],
  ticket_activity: [{ id: 1, text: 'Created', created_at: '2026-10-12T10:00:00Z' }],
};

describe('ticketsApi', () => {
  beforeEach(() => {
    calls.length = 0;
    result = { data: null, error: null };
  });

  it('is remote when a client exists', () => {
    expect(isRemote).toBe(true);
  });

  it('maps a database row to the client ticket shape with messages in time order', () => {
    const t = toTicket(row);
    expect(t).toMatchObject({ id: 'TCK-1100', customerId: 'c1', assigneeId: null, firstResponseAt: null });
    expect(t.createdAt).toBe(Date.parse('2026-10-12T10:00:00Z'));
    expect(t.messages.map((m) => m.body)).toEqual(['Help me', 'Hi']);
    expect(t.activity).toEqual([{ at: Date.parse('2026-10-12T10:00:00Z'), text: 'Created' }]);
  });

  it('saveTicketDiff updates the ticket and inserts only new messages and activity', async () => {
    const before = toTicket(row);
    const after = {
      ...before,
      status: 'pending',
      messages: [...before.messages, { id: 'n', author: 'agent', authorId: 'a1', body: 'More', at: 0, internal: true }],
    };
    await ticketsApi.saveTicketDiff(before, after);
    const tables = calls.filter(([op]) => op === 'from').map(([, table]) => table);
    expect(tables).toEqual(['tickets', 'ticket_messages']);
    expect(calls.find(([op]) => op === 'update')[1]).toMatchObject({ status: 'pending', assignee_id: null });
    expect(calls.find(([op]) => op === 'insert')[1]).toEqual([
      expect.objectContaining({ ticket_no: 1100, body: 'More', internal: true }),
    ]);
  });

  it('throws the Supabase error message', async () => {
    result = { data: null, error: { message: 'permission denied' } };
    await expect(ticketsApi.loadWorkspace()).rejects.toThrow('permission denied');
  });
});
