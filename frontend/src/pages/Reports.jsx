import { useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import { BarList, ColumnChart, StatTile } from '../components/Charts.jsx';
import Icon from '../components/Icon.jsx';
import { ACTIVE_STATUSES, CATEGORIES, CHANNELS, PRIORITY_LEVELS } from '../data/constants.js';
import { formatDuration, slaInfo } from '../lib/format.js';
import { useTickets } from '../store/TicketStore.jsx';
import { lastSevenDays } from './Overview.jsx';

const DAY = 24 * 60 * 60 * 1000;
const RANGES = [
  { key: '7', label: 'Last 7 days', days: 7 },
  { key: '30', label: 'Last 30 days', days: 30 },
  { key: 'all', label: 'All time', days: Infinity },
];

const avg = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

export default function Reports() {
  const { tickets, agents } = useTickets();
  const [range, setRange] = useState('30');
  const now = Date.now();
  const days = RANGES.find((r) => r.key === range).days;
  const inRange = tickets.filter((t) => now - t.createdAt <= days * DAY);

  const solved = inRange.filter((t) => t.status === 'resolved' || t.status === 'closed');
  const firstResponse = avg(inRange.filter((t) => t.firstResponseAt).map((t) => t.firstResponseAt - t.createdAt));
  const resolution = avg(solved.map((t) => t.updatedAt - t.createdAt));
  const active = inRange.filter((t) => ACTIVE_STATUSES.includes(t.status));
  const withinSla = active.length
    ? Math.round((active.filter((t) => slaInfo(t, now).state !== 'breached').length / active.length) * 100)
    : 100;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Reports</h1>
          <p className="page-sub">Support performance across your workspace.</p>
        </div>
        <div className="segmented" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button key={r.key} type="button" aria-pressed={range === r.key} onClick={() => setRange(r.key)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <section className="stat-grid stat-grid-4" aria-label="Performance metrics">
        <StatTile label="Tickets created" value={inRange.length} icon={<Icon name="inbox" />} />
        <StatTile label="Avg. first response" value={formatDuration(firstResponse)} icon={<Icon name="zap" />} />
        <StatTile label="Avg. resolution time" value={formatDuration(resolution)} icon={<Icon name="clock" />} />
        <StatTile
          label="Open within SLA"
          value={`${withinSla}%`}
          icon={<Icon name="shield" />}
          tone={withinSla >= 90 ? 'good' : withinSla >= 75 ? 'warning' : 'critical'}
        />
      </section>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head"><h2>Ticket volume, last 7 days</h2></div>
          <ColumnChart items={lastSevenDays(tickets, now)} label="Ticket volume, last 7 days" />
        </section>
        <section className="panel">
          <div className="panel-head"><h2>By category</h2></div>
          <BarList
            label="Tickets by category"
            items={CATEGORIES.map((c) => ({ label: c, value: inRange.filter((t) => t.category === c).length })).sort((a, b) => b.value - a.value)}
          />
        </section>
        <section className="panel">
          <div className="panel-head"><h2>By channel</h2></div>
          <BarList
            label="Tickets by channel"
            items={CHANNELS.map((c) => ({ label: c.label, value: inRange.filter((t) => t.channel === c.key).length })).sort((a, b) => b.value - a.value)}
          />
        </section>
        <section className="panel">
          <div className="panel-head"><h2>By priority</h2></div>
          <BarList
            label="Tickets by priority"
            items={PRIORITY_LEVELS.map((p) => ({ label: p.label, value: inRange.filter((t) => t.priority === p.key).length }))}
          />
        </section>
      </div>

      <section className="panel panel-flush">
        <div className="panel-head panel-head-pad"><h2>Agent leaderboard</h2></div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Agent</th>
                <th className="num">Assigned</th>
                <th className="num">Solved</th>
                <th className="num hide-md">Avg. first response</th>
                <th className="num">CSAT</th>
              </tr>
            </thead>
            <tbody>
              {agents
                .map((a) => {
                  const mine = inRange.filter((t) => t.assigneeId === a.id);
                  return {
                    ...a,
                    assigned: mine.length,
                    solved: mine.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
                    frt: avg(mine.filter((t) => t.firstResponseAt).map((t) => t.firstResponseAt - t.createdAt)),
                  };
                })
                .sort((x, y) => y.solved - x.solved || y.csat - x.csat)
                .map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span className="person">
                        <Avatar name={a.name} size="sm" />
                        <span>
                          <strong>{a.name}</strong>
                          <span className="muted">{a.team}</span>
                        </span>
                      </span>
                    </td>
                    <td className="num">{a.assigned}</td>
                    <td className="num"><strong>{a.solved}</strong></td>
                    <td className="num hide-md">{formatDuration(a.frt)}</td>
                    <td className="num">{a.csat}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
