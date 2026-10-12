import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import { ACTIVE_STATUSES } from '../data/constants.js';
import { useTickets } from '../store/TicketStore.jsx';

const PRESENCE = { online: 'Online', away: 'Away', offline: 'Offline' };

export default function Team() {
  const { agents, tickets } = useTickets();
  const maxLoad = Math.max(1, ...agents.map((a) => tickets.filter((t) => t.assigneeId === a.id && ACTIVE_STATUSES.includes(t.status)).length));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Team</h1>
          <p className="page-sub">
            {agents.filter((a) => a.presence === 'online').length} of {agents.length} agents online right now.
          </p>
        </div>
      </div>

      <div className="team-grid">
        {agents.map((a) => {
          const mine = tickets.filter((t) => t.assigneeId === a.id);
          const open = mine.filter((t) => ACTIVE_STATUSES.includes(t.status)).length;
          const solved = mine.length - open;
          return (
            <article key={a.id} className="panel agent-card">
              <div className="agent-head">
                <Avatar name={a.name} size="lg" presence={a.presence} />
                <div>
                  <h2>{a.name}</h2>
                  <p className="muted">{a.role} · {a.team}</p>
                </div>
                <span className={`presence-pill presence-pill-${a.presence}`}>{PRESENCE[a.presence]}</span>
              </div>
              <dl className="agent-stats">
                <div><dt>Open</dt><dd>{open}</dd></div>
                <div><dt>Solved</dt><dd>{solved}</dd></div>
                <div><dt>CSAT</dt><dd>{a.csat}%</dd></div>
              </dl>
              <div className="load">
                <div className="load-label">
                  <span>Workload</span>
                  <span className="muted">{open} open</span>
                </div>
                <span className="load-track">
                  <span className="load-fill" style={{ width: `${(open / maxLoad) * 100}%` }} />
                </span>
              </div>
              <div className="agent-foot">
                <a href={`mailto:${a.email}`} className="muted agent-email">{a.email}</a>
                <Link to={`/app/tickets?view=all&assignee=${a.id}`} className="link-more">
                  View tickets
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
