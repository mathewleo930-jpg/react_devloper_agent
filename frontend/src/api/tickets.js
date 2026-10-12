import { supabase } from '../lib/supabase.js';

export const isRemote = Boolean(supabase);

const iso = (ms) => (ms == null ? null : new Date(ms).toISOString());
const ms = (value) => (value == null ? null : new Date(value).getTime());

// Supabase returns { data, error } instead of throwing; callers expect a throw.
async function unwrap(query) {
  const { data, error } = await query;
  if (error) throw new Error(error.message || 'Request failed');
  return data;
}

export function toTicket(row) {
  const byTime = (a, b) => ms(a.created_at) - ms(b.created_at) || a.id - b.id;
  return {
    id: `TCK-${row.number}`,
    number: row.number,
    subject: row.subject,
    status: row.status,
    priority: row.priority,
    category: row.category,
    channel: row.channel,
    customerId: row.customer_id,
    assigneeId: row.assignee_id,
    tags: row.tags ?? [],
    createdAt: ms(row.created_at),
    updatedAt: ms(row.updated_at),
    firstResponseAt: ms(row.first_response_at),
    messages: [...(row.ticket_messages ?? [])].sort(byTime).map((m) => ({
      id: String(m.id),
      author: m.author,
      authorId: m.author_id,
      body: m.body,
      at: ms(m.created_at),
      internal: m.internal,
    })),
    activity: [...(row.ticket_activity ?? [])].sort(byTime).map((a) => ({ at: ms(a.created_at), text: a.text })),
  };
}

const ticketColumns = (t) => ({
  subject: t.subject,
  status: t.status,
  priority: t.priority,
  category: t.category,
  channel: t.channel,
  customer_id: t.customerId,
  assignee_id: t.assigneeId,
  tags: t.tags,
  created_at: iso(t.createdAt),
  updated_at: iso(t.updatedAt),
  first_response_at: iso(t.firstResponseAt),
});

const messageRows = (number, messages) =>
  messages.map((m) => ({
    ticket_no: number,
    author: m.author,
    author_id: m.authorId,
    body: m.body,
    internal: m.internal,
    created_at: iso(m.at),
  }));

const activityRows = (number, activity) =>
  activity.map((a) => ({ ticket_no: number, text: a.text, created_at: iso(a.at) }));

export const ticketsApi = {
  async loadWorkspace() {
    const [agents, customers, tickets] = await Promise.all([
      unwrap(supabase.from('agents').select('*').order('name')),
      unwrap(supabase.from('customers').select('*').order('name')),
      unwrap(
        supabase
          .from('tickets')
          .select('*, ticket_messages(*), ticket_activity(*)')
          .order('updated_at', { ascending: false })
          .limit(1000),
      ),
    ]);
    return { agents, customers, tickets: tickets.map(toTicket) };
  },

  // Inserts a ticket built by the reducer; the database assigns its number.
  async createTicket(ticket) {
    const { number } = await unwrap(supabase.from('tickets').insert(ticketColumns(ticket)).select('number').single());
    await Promise.all([
      unwrap(supabase.from('ticket_messages').insert(messageRows(number, ticket.messages))),
      unwrap(supabase.from('ticket_activity').insert(activityRows(number, ticket.activity))),
    ]);
    return number;
  },

  // Writes what changed between two versions of the same ticket. Messages and
  // activity are append-only, so only new entries are inserted.
  async saveTicketDiff(before, after) {
    const newMessages = after.messages.slice(before.messages.length);
    const newActivity = after.activity.slice(before.activity.length);
    const writes = [
      unwrap(
        supabase
          .from('tickets')
          .update({
            status: after.status,
            priority: after.priority,
            category: after.category,
            assignee_id: after.assigneeId,
            updated_at: iso(after.updatedAt),
            first_response_at: iso(after.firstResponseAt),
          })
          .eq('number', after.number),
      ),
    ];
    if (newMessages.length) writes.push(unwrap(supabase.from('ticket_messages').insert(messageRows(after.number, newMessages))));
    if (newActivity.length) writes.push(unwrap(supabase.from('ticket_activity').insert(activityRows(after.number, newActivity))));
    await Promise.all(writes);
  },
};
