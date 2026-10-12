import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import Icon from '../components/Icon.jsx';
import { ACTIVE_STATUSES } from '../data/constants.js';
import { timeAgo } from '../lib/format.js';
import { useTickets } from '../store/TicketStore.jsx';

const PLANS = ['All', 'Enterprise', 'Business', 'Starter'];

export default function Customers() {
  const { customers, tickets } = useTickets();
  const [plan, setPlan] = useState('All');
  const [query, setQuery] = useState('');

  const rows = customers
    .filter((c) => plan === 'All' || c.plan === plan)
    .filter((c) => [c.name, c.email, c.company].some((s) => s.toLowerCase().includes(query.trim().toLowerCase())))
    .map((c) => {
      const theirs = tickets.filter((t) => t.customerId === c.id);
      return {
        ...c,
        total: theirs.length,
        open: theirs.filter((t) => ACTIVE_STATUSES.includes(t.status)).length,
        last: theirs.reduce((max, t) => Math.max(max, t.updatedAt), 0),
        latest: [...theirs].sort((a, b) => b.updatedAt - a.updatedAt)[0],
      };
    });

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Customers</h1>
          <p className="page-sub">{customers.length} organisations with active support contracts.</p>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Plans">
        {PLANS.map((p) => (
          <button key={p} type="button" role="tab" aria-selected={plan === p} className="tab" onClick={() => setPlan(p)}>
            {p}
            <span className="tab-count">{p === 'All' ? customers.length : customers.filter((c) => c.plan === p).length}</span>
          </button>
        ))}
      </div>

      <div className="panel panel-flush" role="tabpanel" aria-label={`${plan} customers`}>
        <div className="toolbar">
          <div className="input-icon">
            <Icon name="search" size={16} />
            <label htmlFor="cust-search" className="visually-hidden">Search customers</label>
            <input
              id="cust-search"
              type="search"
              className="input"
              placeholder="Search name, email or company…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Company</th>
                <th>Plan</th>
                <th className="num">Open</th>
                <th className="num hide-md">Total</th>
                <th className="hide-md">Latest ticket</th>
                <th className="hide-md">Last contact</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="person">
                      <Avatar name={c.name} size="sm" />
                      <span>
                        <strong>{c.name}</strong>
                        <span className="muted">{c.email}</span>
                      </span>
                    </span>
                  </td>
                  <td>
                    {c.company}
                    <span className="muted block">{c.location}</span>
                  </td>
                  <td><span className={`plan plan-${c.plan.toLowerCase()}`}>{c.plan}</span></td>
                  <td className="num"><strong>{c.open}</strong></td>
                  <td className="num hide-md">{c.total}</td>
                  <td className="hide-md">
                    {c.latest ? <Link to={`/app/tickets/${c.latest.id}`} className="truncate">{c.latest.subject}</Link> : '-'}
                  </td>
                  <td className="hide-md muted nowrap">{c.last ? timeAgo(c.last) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="empty">
              <span className="empty-icon"><Icon name="users" size={28} /></span>
              <h3>No customers match</h3>
              <p>Try a different search or plan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
