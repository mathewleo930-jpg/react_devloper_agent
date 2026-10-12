import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import { PriorityBadge, SlaBadge, StatusBadge } from '../components/Badges.jsx';
import Icon from '../components/Icon.jsx';
import { CATEGORIES, PRIORITY_LEVELS, STATUSES, channelLabel } from '../data/constants.js';
import { formatDateTime, timeAgo } from '../lib/format.js';
import { useTickets, useToast } from '../store/TicketStore.jsx';

const CANNED = [
  { label: 'Acknowledge', text: 'Thanks for reaching out! I’m looking into this now and will update you shortly.' },
  { label: 'Need more info', text: 'Could you share a few more details (steps to reproduce, screenshots, and the time it happened)? That will help us resolve this faster.' },
  { label: 'Resolved', text: 'This should now be fixed. I’ll mark the ticket as resolved - just reply if anything still looks off.' },
];

export default function TicketDetail() {
  const { id } = useParams();
  const { tickets, agents, agentsById, customersById, currentAgent, dispatch } = useTickets();
  const notify = useToast();
  const [tab, setTab] = useState('conversation');
  const [mode, setMode] = useState('reply');
  const [body, setBody] = useState('');
  const ticket = tickets.find((t) => t.id === id);

  if (!ticket) {
    return (
      <div className="page">
        <div className="panel empty">
          <span className="empty-icon"><Icon name="inbox" size={28} /></span>
          <h1 className="h3">Ticket not found</h1>
          <p>{id} doesn’t exist or was removed.</p>
          <Link to="/app/tickets" className="btn btn-primary">Back to tickets</Link>
        </div>
      </div>
    );
  }

  const customer = customersById[ticket.customerId];
  const otherTickets = tickets.filter((t) => t.customerId === ticket.customerId && t.id !== ticket.id);
  const internal = mode === 'note';

  function update(changes, message) {
    dispatch({ type: 'updateTicket', id: ticket.id, changes });
    notify(message);
  }

  function send(status) {
    if (!body.trim()) return;
    dispatch({ type: 'addReply', id: ticket.id, body, internal, status });
    setBody('');
    notify(internal ? 'Internal note added' : status ? 'Reply sent and status updated' : 'Reply sent');
  }

  return (
    <div className="page page-detail">
      <div className="detail-head">
        <Link to="/app/tickets" className="back-link">
          <Icon name="back" size={16} /> Tickets
        </Link>
        <div className="detail-title">
          <h1>{ticket.subject}</h1>
          <div className="detail-badges">
            <span className="ticket-id">{ticket.id}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <SlaBadge ticket={ticket} />
          </div>
        </div>
        <div className="page-actions">
          {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
            <button type="button" className="btn btn-success" onClick={() => update({ status: 'resolved' }, 'Ticket resolved')}>
              <Icon name="check" size={16} /> Resolve
            </button>
          ) : (
            <button type="button" className="btn" onClick={() => update({ status: 'open' }, 'Ticket reopened')}>
              <Icon name="refresh" size={16} /> Reopen
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel panel-flush detail-main">
          <div className="tabs tabs-inset" role="tablist" aria-label="Ticket sections">
            {[
              ['conversation', 'Conversation', ticket.messages.length],
              ['activity', 'Activity', ticket.activity.length],
            ].map(([key, label, count]) => (
              <button key={key} type="button" role="tab" aria-selected={tab === key} className="tab" onClick={() => setTab(key)}>
                {label}
                <span className="tab-count">{count}</span>
              </button>
            ))}
          </div>

          {tab === 'conversation' ? (
            <div role="tabpanel" aria-label="Conversation">
              <ol className="thread">
                {ticket.messages.map((m) => {
                  const who = m.author === 'customer' ? customersById[m.authorId] : agentsById[m.authorId];
                  return (
                    <li key={m.id} className={`msg msg-${m.author} ${m.internal ? 'msg-internal' : ''}`}>
                      <Avatar name={who?.name} />
                      <div className="msg-body">
                        <div className="msg-head">
                          <strong>{who?.name}</strong>
                          {m.author === 'agent' && !m.internal && <span className="chip">Agent</span>}
                          {m.internal && (
                            <span className="chip chip-note">
                              <Icon name="lock" size={12} /> Internal note
                            </span>
                          )}
                          <time className="muted" dateTime={new Date(m.at).toISOString()} title={formatDateTime(m.at)}>
                            {timeAgo(m.at)}
                          </time>
                        </div>
                        <p>{m.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className={`composer ${internal ? 'composer-note' : ''}`}>
                <div className="composer-modes" role="group" aria-label="Message type">
                  <button type="button" aria-pressed={!internal} onClick={() => setMode('reply')}>
                    <Icon name="mail" size={14} /> Public reply
                  </button>
                  <button type="button" aria-pressed={internal} onClick={() => setMode('note')}>
                    <Icon name="lock" size={14} /> Internal note
                  </button>
                </div>
                <label htmlFor="composer-body" className="visually-hidden">
                  {internal ? 'Internal note' : `Reply to ${customer?.name}`}
                </label>
                <textarea
                  id="composer-body"
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={internal ? 'Add a note only your team can see…' : `Reply to ${customer?.name}…`}
                />
                <div className="composer-foot">
                  <div className="canned">
                    {CANNED.map((c) => (
                      <button key={c.label} type="button" className="chip chip-btn" onClick={() => setBody(c.text)}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <div className="composer-send">
                    {!internal && (
                      <button type="button" className="btn" disabled={!body.trim()} onClick={() => send('pending')}>
                        Send &amp; set pending
                      </button>
                    )}
                    <button type="button" className="btn btn-primary" disabled={!body.trim()} onClick={() => send()}>
                      <Icon name="send" size={15} /> {internal ? 'Add note' : 'Send'}
                    </button>
                  </div>
                </div>
                <p className="composer-hint muted">
                  Replying as {currentAgent?.name}
                </p>
              </div>
            </div>
          ) : (
            <div role="tabpanel" aria-label="Activity">
              <ol className="timeline">
                {[...ticket.activity].reverse().map((a, i) => (
                  <li key={i}>
                    <span className="timeline-dot" aria-hidden="true" />
                    <div>
                      <p>{a.text}</p>
                      <span className="muted">{formatDateTime(a.at)}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        <aside className="detail-side">
          <section className="panel">
            <h2 className="panel-title">Properties</h2>
            <div className="props">
              <label htmlFor="p-status">Status</label>
              <select id="p-status" className="select" value={ticket.status} onChange={(e) => update({ status: e.target.value }, 'Status updated')}>
                {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <label htmlFor="p-priority">Priority</label>
              <select id="p-priority" className="select" value={ticket.priority} onChange={(e) => update({ priority: e.target.value }, 'Priority updated')}>
                {PRIORITY_LEVELS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
              <label htmlFor="p-assignee">Assignee</label>
              <select
                id="p-assignee"
                className="select"
                value={ticket.assigneeId ?? ''}
                onChange={(e) => update({ assigneeId: e.target.value || null }, 'Assignee updated')}
              >
                <option value="">Unassigned</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <label htmlFor="p-category">Category</label>
              <select id="p-category" className="select" value={ticket.category} onChange={(e) => update({ category: e.target.value }, 'Category updated')}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <dl className="meta-list">
              <div><dt>Channel</dt><dd>{channelLabel(ticket.channel)}</dd></div>
              <div><dt>Created</dt><dd>{formatDateTime(ticket.createdAt)}</dd></div>
              <div><dt>Last update</dt><dd>{timeAgo(ticket.updatedAt)}</dd></div>
            </dl>
            {ticket.tags.length > 0 && (
              <div className="tags">
                {ticket.tags.map((tag) => (
                  <span key={tag} className="tag"><Icon name="tag" size={12} /> {tag}</span>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <h2 className="panel-title">Customer</h2>
            <div className="customer-card">
              <Avatar name={customer?.name} size="lg" />
              <div>
                <strong>{customer?.name}</strong>
                <a href={`mailto:${customer?.email}`} className="muted">{customer?.email}</a>
              </div>
            </div>
            <dl className="meta-list">
              <div><dt>Company</dt><dd>{customer?.company}</dd></div>
              <div><dt>Plan</dt><dd><span className={`plan plan-${customer?.plan.toLowerCase()}`}>{customer?.plan}</span></dd></div>
              <div><dt>Location</dt><dd>{customer?.location}</dd></div>
            </dl>
            {otherTickets.length > 0 && (
              <>
                <h3 className="side-subtitle">Other tickets ({otherTickets.length})</h3>
                <ul className="related">
                  {otherTickets.slice(0, 4).map((t) => (
                    <li key={t.id}>
                      <Link to={`/app/tickets/${t.id}`}>
                        <span className="related-subject">{t.subject}</span>
                        <StatusBadge status={t.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
