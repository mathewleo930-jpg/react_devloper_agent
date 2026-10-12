import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import { PriorityBadge, SlaBadge } from '../components/Badges.jsx';
import Icon from '../components/Icon.jsx';
import { STATUSES, statusLabel } from '../data/constants.js';
import { useTickets, useToast } from '../store/TicketStore.jsx';

export default function Board() {
  const { tickets, agentsById, customersById, dispatch } = useTickets();
  const notify = useToast();
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const now = Date.now();

  function move(id, status) {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket || ticket.status === status) return;
    dispatch({ type: 'updateTicket', id, changes: { status } });
    notify(`${id} moved to ${statusLabel(status)}`);
  }

  return (
    <div className="page page-wide">
      <div className="page-head">
        <div>
          <h1>Board</h1>
          <p className="page-sub">Drag cards between columns to change status, or use the menu on each card.</p>
        </div>
        <div className="page-actions">
          <Link to="/app/tickets" className="btn">
            <Icon name="inbox" size={16} /> List view
          </Link>
        </div>
      </div>

      <div className="board">
        {STATUSES.map((col) => {
          const items = tickets.filter((t) => t.status === col.key).sort((a, b) => b.updatedAt - a.updatedAt);
          return (
            <section
              key={col.key}
              className={`board-col ${overCol === col.key ? 'board-col-over' : ''}`}
              aria-label={`${col.label}, ${items.length} tickets`}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col.key);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOverCol(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                move(e.dataTransfer.getData('text/plain') || dragId, col.key);
                setOverCol(null);
                setDragId(null);
              }}
            >
              <header className="board-col-head">
                <span className={`status-dot-lg status-${col.key}`} aria-hidden="true" />
                <h2>{col.label}</h2>
                <span className="tab-count">{items.length}</span>
              </header>
              <div className="board-cards">
                {items.map((t) => {
                  const agent = agentsById[t.assigneeId];
                  return (
                    <article
                      key={t.id}
                      className={`card-ticket ${dragId === t.id ? 'card-dragging' : ''}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', t.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDragId(t.id);
                      }}
                      onDragEnd={() => setDragId(null)}
                    >
                      <div className="card-ticket-top">
                        <span className="ticket-id">{t.id}</span>
                        <PriorityBadge priority={t.priority} />
                      </div>
                      <Link to={`/app/tickets/${t.id}`} className="card-ticket-title">{t.subject}</Link>
                      <p className="card-ticket-customer">{customersById[t.customerId]?.company} · {t.category}</p>
                      <div className="card-ticket-foot">
                        <SlaBadge ticket={t} now={now} />
                        <div className="card-ticket-right">
                          <label className="visually-hidden" htmlFor={`mv-${t.id}`}>Move {t.id}</label>
                          <select
                            id={`mv-${t.id}`}
                            className="mini-select"
                            value={t.status}
                            onChange={(e) => move(t.id, e.target.value)}
                          >
                            {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                          </select>
                          {agent ? <Avatar name={agent.name} size="xs" /> : <span className="avatar avatar-xs avatar-empty" title="Unassigned" />}
                        </div>
                      </div>
                    </article>
                  );
                })}
                {items.length === 0 && <p className="board-empty">Drop tickets here</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
