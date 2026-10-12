import { priorityLabel, statusLabel } from '../data/constants.js';
import { createSeedState } from '../data/mockData.js';

const FIELD_LABELS = { status: 'status', priority: 'priority', assigneeId: 'assignee', category: 'category' };

function describeChange(field, value, state) {
  if (field === 'status') return `Status changed to ${statusLabel(value)}`;
  if (field === 'priority') return `Priority changed to ${priorityLabel(value)}`;
  if (field === 'assigneeId') {
    const agent = state.agents.find((a) => a.id === value);
    return agent ? `Assigned to ${agent.name}` : 'Unassigned';
  }
  return `${FIELD_LABELS[field] ?? field} changed to ${value}`;
}

function mapTicket(state, id, fn) {
  return { ...state, tickets: state.tickets.map((t) => (t.id === id ? fn(t) : t)) };
}

function applyChanges(state, ticket, changes, now) {
  const entries = Object.entries(changes).filter(([field, value]) => ticket[field] !== value);
  if (entries.length === 0) return ticket;
  const actor = state.agents.find((a) => a.id === state.currentAgentId)?.name ?? 'Someone';
  return {
    ...ticket,
    ...Object.fromEntries(entries),
    updatedAt: now,
    activity: [
      ...ticket.activity,
      ...entries.map(([field, value]) => ({ at: now, text: `${describeChange(field, value, state)} by ${actor}` })),
    ],
  };
}

export function nextTicketNumber(tickets) {
  return tickets.reduce((max, t) => Math.max(max, t.number), 1000) + 1;
}

export function ticketReducer(state, action) {
  const now = action.now ?? Date.now();
  switch (action.type) {
    case 'createTicket': {
      const { subject, description, priority, category, channel, customerId, assigneeId, tags = [] } = action.payload;
      const number = action.number ?? nextTicketNumber(state.tickets);
      const ticket = {
        id: `TCK-${number}`,
        number,
        subject: subject.trim(),
        status: 'open',
        priority,
        category,
        channel,
        customerId,
        assigneeId: assigneeId || null,
        tags,
        createdAt: now,
        updatedAt: now,
        firstResponseAt: null,
        messages: [
          { id: `${number}-0`, author: 'customer', authorId: customerId, body: description.trim(), at: now, internal: false },
        ],
        activity: [{ at: now, text: 'Ticket created by agent' }],
      };
      return { ...state, tickets: [ticket, ...state.tickets] };
    }
    case 'updateTicket':
      return mapTicket(state, action.id, (t) => applyChanges(state, t, action.changes, now));
    case 'bulkUpdate': {
      const ids = new Set(action.ids);
      return {
        ...state,
        tickets: state.tickets.map((t) => (ids.has(t.id) ? applyChanges(state, t, action.changes, now) : t)),
      };
    }
    case 'addReply':
      return mapTicket(state, action.id, (t) => {
        const internal = Boolean(action.internal);
        const message = {
          id: `${t.number}-${t.messages.length}-${now}`,
          author: 'agent',
          authorId: state.currentAgentId,
          body: action.body.trim(),
          at: now,
          internal,
        };
        const withReply = {
          ...t,
          messages: [...t.messages, message],
          updatedAt: now,
          firstResponseAt: t.firstResponseAt ?? (internal ? null : now),
        };
        return action.status ? applyChanges(state, withReply, { status: action.status }, now) : withReply;
      });
    case 'reset':
      return createSeedState(now);
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}
