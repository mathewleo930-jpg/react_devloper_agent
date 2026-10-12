import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import { PriorityBadge, SlaBadge, StatusBadge } from '../components/Badges.jsx';
import Icon from '../components/Icon.jsx';
import { ACTIVE_STATUSES, CATEGORIES, PRIORITY_LEVELS, STATUSES } from '../data/constants.js';
import { timeAgo } from '../lib/format.js';
import { useTickets, useToast } from '../store/TicketStore.jsx';

export const VIEWS = [
  { key: 'open', label: 'Open', test: (t) => ACTIVE_STATUSES.includes(t.status) },
  { key: 'mine', label: 'My tickets', test: (t, me) => t.assigneeId === me && ACTIVE_STATUSES.includes(t.status) },
  { key: 'unassigned', label: 'Unassigned', test: (t) => !t.assigneeId && ACTIVE_STATUSES.includes(t.status) },
  { key: 'urgent', label: 'Urgent', test: (t) => t.priority === 'urgent' && ACTIVE_STATUSES.includes(t.status) },
  { key: 'pending', label: 'Pending', test: (t) => t.status === 'pending' },
  { key: 'solved', label: 'Solved', test: (t) => t.status === 'resolved' || t.status === 'closed' },
  { key: 'all', label: 'All', test: () => true },
];

const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 };
const SORTS = {
  updated: { label: 'Last updated', fn: (a, b) => b.updatedAt - a.updatedAt },
  created: { label: 'Newest first', fn: (a, b) => b.createdAt - a.createdAt },
  priority: { label: 'Priority', fn: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.updatedAt - a.updatedAt },
};

export default function Tickets() {
  const { tickets, agents, agentsById, customersById, currentAgentId, dispatch } = useTickets();
  const notify = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const view = VIEWS.find((v) => v.key === params.get('view')) ?? VIEWS[0];
  const query = params.get('q') ?? '';
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState(() => params.get('assignee') ?? '');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('updated');
  const [selected, setSelected] = useState(() => new Set());
  const now = Date.now();

  function setParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: key === 'q' });
    setSelected(new Set());
  }

  const counts = useMemo(
    () => Object.fromEntries(VIEWS.map((v) => [v.key, tickets.filter((t) => v.test(t, currentAgentId)).length])),
    [tickets, currentAgentId],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets
      .filter((t) => view.test(t, currentAgentId))
      .filter((t) => !priority || t.priority === priority)
      .filter((t) => !category || t.category === category)
      .filter((t) => !assignee || (assignee === 'none' ? !t.assigneeId : t.assigneeId === assignee))
      .filter((t) => {
        if (!q) return true;
        const c = customersById[t.customerId];
        return [t.id, t.subject, c?.name, c?.company, c?.email, ...t.tags].some((s) => s?.toLowerCase().includes(q));
      })
      .sort(SORTS[sort].fn);
  }, [tickets, view, currentAgentId, priority, category, assignee, query, sort, customersById]);

  const allSelected = rows.length > 0 && rows.every((t) => selected.has(t.id));
  const filtersActive = priority || assignee || category || query;

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulk(changes, message) {
    dispatch({ type: 'bulkUpdate', ids: [...selected], changes });
    notify(`${selected.size} ticket${selected.size === 1 ? '' : 's'} ${message}`);
    setSelected(new Set());
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Tickets</h1>
          <p className="page-sub">Triage, assign and resolve customer requests.</p>
        </div>
        <div className="page-actions">
          <Link to="/app/board" className="btn">
            <Icon name="board" size={16} /> Board view
          </Link>
          <Link to="/app/tickets/new" className="btn btn-primary">
            <Icon name="plus" size={16} /> New ticket
          </Link>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Ticket views">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            role="tab"
            aria-selected={v.key === view.key}
            className="tab"
            onClick={() => setParam('view', v.key === 'open' ? '' : v.key)}
          >
            {v.label}
            <span className="tab-count">{counts[v.key]}</span>
          </button>
        ))}
      </div>

      <div className="panel panel-flush" role="tabpanel" aria-label={`${view.label} tickets`}>
        <div className="toolbar">
          <div className="input-icon">
            <Icon name="search" size={16} />
            <label htmlFor="ticket-search" className="visually-hidden">Filter tickets</label>
            <input
              id="ticket-search"
              type="search"
              className="input"
              placeholder="Filter by subject, customer, tag…"
              value={query}
              onChange={(e) => setParam('q', e.target.value)}
            />
          </div>
          <label className="visually-hidden" htmlFor="f-priority">Priority</label>
          <select id="f-priority" className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All priorities</option>
            {PRIORITY_LEVELS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <label className="visually-hidden" htmlFor="f-assignee">Assignee</label>
          <select id="f-assignee" className="select" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">All assignees</option>
            <option value="none">Unassigned</option>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <label className="visually-hidden" htmlFor="f-category">Category</label>
          <select id="f-category" className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="visually-hidden" htmlFor="f-sort">Sort by</label>
          <select id="f-sort" className="select toolbar-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(SORTS).map(([key, s]) => <option key={key} value={key}>Sort: {s.label}</option>)}
          </select>
          {filtersActive && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setPriority('');
                setAssignee('');
                setCategory('');
                setParam('q', '');
              }}
            >
              Clear
            </button>
          )}
        </div>

        {selected.size > 0 && (
          <div className="bulkbar" role="region" aria-label="Bulk actions">
            <strong>{selected.size} selected</strong>
            <button type="button" className="btn btn-sm" onClick={() => bulk({ assigneeId: currentAgentId }, 'assigned to you')}>
              Assign to me
            </button>
            <label className="visually-hidden" htmlFor="bulk-status">Set status</label>
            <select
              id="bulk-status"
              className="select select-sm"
              value=""
              onChange={(e) => e.target.value && bulk({ status: e.target.value }, 'updated')}
            >
              <option value="">Set status…</option>
              {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setSelected(new Set())}>
              Cancel
            </button>
          </div>
        )}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="col-check">
                  <input
                    type="checkbox"
                    aria-label="Select all tickets"
                    checked={allSelected}
                    onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((t) => t.id)))}
                  />
                </th>
                <th>Ticket</th>
                <th>Status</th>
                <th className="hide-sm">Priority</th>
                <th className="hide-sm">Assignee</th>
                <th className="hide-md">SLA</th>
                <th className="hide-md">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const customer = customersById[t.customerId];
                const agent = agentsById[t.assigneeId];
                return (
                  <tr
                    key={t.id}
                    className={selected.has(t.id) ? 'row-selected' : ''}
                    onClick={(e) => {
                      if (!e.target.closest('input, a, button, label')) navigate(`/app/tickets/${t.id}`);
                    }}
                  >
                    <td className="col-check">
                      <input
                        type="checkbox"
                        aria-label={`Select ${t.id}`}
                        checked={selected.has(t.id)}
                        onChange={() => toggle(t.id)}
                      />
                    </td>
                    <td className="col-ticket">
                      <Link to={`/app/tickets/${t.id}`} className="row-subject">{t.subject}</Link>
                      <span className="row-meta">
                        <span className="ticket-id">{t.id}</span> · {customer?.name} · {customer?.company} · {t.category}
                      </span>
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td className="hide-sm"><PriorityBadge priority={t.priority} /></td>
                    <td className="hide-sm">
                      {agent ? (
                        <span className="assignee">
                          <Avatar name={agent.name} size="xs" />
                          <span>{agent.name.split(' ')[0]}</span>
                        </span>
                      ) : (
                        <span className="muted">Unassigned</span>
                      )}
                    </td>
                    <td className="hide-md"><SlaBadge ticket={t} now={now} /></td>
                    <td className="hide-md nowrap muted">{timeAgo(t.updatedAt, now)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="empty">
              <span className="empty-icon"><Icon name="inbox" size={28} /></span>
              <h3>No tickets here</h3>
              <p>{filtersActive ? 'Try clearing filters or searching for something else.' : 'This view is all caught up.'}</p>
            </div>
          )}
        </div>
        <div className="table-foot">
          Showing {rows.length} of {counts[view.key]} in “{view.label}”
        </div>
      </div>
    </div>
  );
}
