import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import { PriorityBadge, SlaBadge } from '../components/Badges.jsx';
import { BarList, ColumnChart, StatTile } from '../components/Charts.jsx';
import Icon from '../components/Icon.jsx';
import { ACTIVE_STATUSES, STATUSES } from '../data/constants.js';
import { formatDuration, slaInfo, timeAgo } from '../lib/format.js';
import { useTickets } from '../store/TicketStore.jsx';

const DAY = 24 * 60 * 60 * 1000;

function greeting(now) {
  const h = new Date(now).getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export function lastSevenDays(tickets, now = Date.now()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const dayStart = start.getTime() - (6 - i) * DAY;
    const date = new Date(dayStart);
    return {
      label: date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
      short: date.toLocaleDateString(undefined, { weekday: 'short' }),
      value: tickets.filter((t) => t.createdAt >= dayStart && t.createdAt < dayStart + DAY).length,
    };
  });
}

export default function Overview() {
  const { tickets, agents, customersById, currentAgent, currentAgentId } = useTickets();
  const now = Date.now();

  const active = tickets.filter((t) => ACTIVE_STATUSES.includes(t.status));
  const unassigned = active.filter((t) => !t.assigneeId);
  const breached = active.filter((t) => slaInfo(t, now).state === 'breached');
  const responded = tickets.filter((t) => t.firstResponseAt);
  const avgFirstResponse = responded.length
    ? responded.reduce((sum, t) => sum + (t.firstResponseAt - t.createdAt), 0) / responded.length
    : null;
  const solvedWeek = tickets.filter((t) => ['resolved', 'closed'].includes(t.status) && t.updatedAt > now - 7 * DAY);

  const needsAttention = [...active]
    .sort((a, b) => {
      const order = { breached: 0, warning: 1, ok: 2, met: 3 };
      return order[slaInfo(a, now).state] - order[slaInfo(b, now).state] || b.updatedAt - a.updatedAt;
    })
    .slice(0, 6);

  const myQueue = active.filter((t) => t.assigneeId === currentAgentId).length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{greeting(now)}, {currentAgent?.name.split(' ')[0]}</h1>
          <p className="page-sub">
            You have <strong>{myQueue}</strong> open tickets in your queue and <strong>{unassigned.length}</strong> waiting
            for an owner.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/app/tickets?view=mine" className="btn">View my queue</Link>
          <Link to="/app/tickets/new" className="btn btn-primary">
            <Icon name="plus" size={16} /> New ticket
          </Link>
        </div>
      </div>

      <section className="stat-grid" aria-label="Key metrics">
        <StatTile label="Open tickets" value={active.length} hint={`${tickets.length} total in workspace`} icon={<Icon name="inbox" />} />
        <StatTile label="Unassigned" value={unassigned.length} hint="Need an owner" icon={<Icon name="users" />} tone={unassigned.length ? 'warning' : 'default'} />
        <StatTile label="SLA breached" value={breached.length} hint="Past resolution target" icon={<Icon name="alert" />} tone={breached.length ? 'critical' : 'good'} />
        <StatTile label="Avg. first response" value={formatDuration(avgFirstResponse)} hint="Across all replied tickets" icon={<Icon name="clock" />} />
        <StatTile label="Solved this week" value={solvedWeek.length} hint="Resolved or closed" icon={<Icon name="checkCircle" />} tone="good" />
      </section>

      <div className="grid-2-1">
        <section className="panel">
          <div className="panel-head">
            <h2>New tickets, last 7 days</h2>
          </div>
          <ColumnChart items={lastSevenDays(tickets, now)} label="New tickets per day, last 7 days" />
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2>Tickets by status</h2>
          </div>
          <BarList
            label="Tickets by status"
            items={STATUSES.map((s) => ({ label: s.label, value: tickets.filter((t) => t.status === s.key).length }))}
          />
        </section>
      </div>

      <div className="grid-2-1">
        <section className="panel panel-flush">
          <div className="panel-head">
            <h2>Needs attention</h2>
            <Link to="/app/tickets" className="link-more">
              All tickets <Icon name="arrowRight" size={14} />
            </Link>
          </div>
          <ul className="ticket-mini-list">
            {needsAttention.map((t) => (
              <li key={t.id}>
                <Link to={`/app/tickets/${t.id}`} className="ticket-mini">
                  <div className="ticket-mini-main">
                    <span className="ticket-id">{t.id}</span>
                    <span className="ticket-mini-subject">{t.subject}</span>
                    <span className="ticket-mini-meta">
                      {customersById[t.customerId]?.company} · updated {timeAgo(t.updatedAt, now)}
                    </span>
                  </div>
                  <div className="ticket-mini-side">
                    <PriorityBadge priority={t.priority} />
                    <SlaBadge ticket={t} now={now} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Team workload</h2>
            <Link to="/app/team" className="link-more">
              Team <Icon name="arrowRight" size={14} />
            </Link>
          </div>
          <ul className="workload">
            {agents.map((a) => {
              const load = active.filter((t) => t.assigneeId === a.id).length;
              return (
                <li key={a.id}>
                  <Avatar name={a.name} presence={a.presence} size="sm" />
                  <div className="workload-text">
                    <strong>{a.name}</strong>
                    <span>{a.team}</span>
                  </div>
                  <span className="workload-count" title={`${load} open tickets`}>{load}</span>
                </li>
              );
            })}
          </ul>
          <div className="activity-head">
            <h3>Latest activity</h3>
          </div>
          <ul className="activity-feed">
            {tickets
              .flatMap((t) => t.activity.map((a) => ({ ...a, ticket: t })))
              .sort((a, b) => b.at - a.at)
              .slice(0, 4)
              .map((a, i) => (
                <li key={i}>
                  <span className="activity-dot" aria-hidden="true" />
                  <div>
                    <Link to={`/app/tickets/${a.ticket.id}`}>{a.ticket.id}</Link> {a.text}
                    <span className="muted"> · {timeAgo(a.at, now)}</span>
                  </div>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
