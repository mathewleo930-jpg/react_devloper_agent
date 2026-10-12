import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import Icon from '../components/Icon.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { ACTIVE_STATUSES, APP_NAME } from '../data/constants.js';
import { useTickets } from '../store/TicketStore.jsx';

const NAV = [
  { to: '/app', label: 'Overview', icon: 'grid', end: true },
  { to: '/app/tickets', label: 'Tickets', icon: 'inbox', count: 'open' },
  { to: '/app/board', label: 'Board', icon: 'board' },
  { to: '/app/customers', label: 'Customers', icon: 'users' },
  { to: '/app/team', label: 'Team', icon: 'team' },
  { to: '/app/reports', label: 'Reports', icon: 'chart' },
];

export default function AppLayout({ theme, onToggleTheme }) {
  const { tickets, currentAgent, currentAgentId, status, reload, remote } = useTickets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const openCount = tickets.filter((t) => ACTIVE_STATUSES.includes(t.status)).length;
  const mine = tickets.filter((t) => t.assigneeId === currentAgentId && ACTIVE_STATUSES.includes(t.status)).length;
  const unassigned = tickets.filter((t) => !t.assigneeId && ACTIVE_STATUSES.includes(t.status)).length;

  function onSearch(e) {
    e.preventDefault();
    navigate(`/app/tickets?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className={`shell ${menuOpen ? 'shell-menu-open' : ''}`}>
      <aside className="sidebar" aria-label="Sidebar">
        <div className="sidebar-head">
          <Link to="/" className="brand">
            <img className="brand-logo" src={`${import.meta.env.BASE_URL}logo.svg`} alt="" width="28" height="28" />
            {APP_NAME}
          </Link>
          <button type="button" className="icon-btn sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <Icon name="x" />
          </button>
        </div>

        <Link to="/app/tickets/new" className="btn btn-primary btn-block">
          <Icon name="plus" size={16} /> New ticket
        </Link>

        <nav aria-label="Main" className="side-nav">
          <p className="side-nav-title">Workspace</p>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="side-link">
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.count === 'open' && <span className="side-count">{openCount}</span>}
            </NavLink>
          ))}
          <p className="side-nav-title">Views</p>
          <Link to="/app/tickets?view=mine" className="side-link side-link-sub">
            <span className="view-dot view-dot-mine" aria-hidden="true" />
            <span>My open tickets</span>
            <span className="side-count">{mine}</span>
          </Link>
          <Link to="/app/tickets?view=unassigned" className="side-link side-link-sub">
            <span className="view-dot view-dot-unassigned" aria-hidden="true" />
            <span>Unassigned</span>
            <span className="side-count">{unassigned}</span>
          </Link>
          <Link to="/app/tickets?view=urgent" className="side-link side-link-sub">
            <span className="view-dot view-dot-urgent" aria-hidden="true" />
            <span>Urgent</span>
            <span className="side-count">
              {tickets.filter((t) => t.priority === 'urgent' && ACTIVE_STATUSES.includes(t.status)).length}
            </span>
          </Link>
        </nav>

        <div className="sidebar-foot">
          <NavLink to="/app/settings" className="side-link">
            <Icon name="settings" />
            <span>Settings</span>
          </NavLink>
          {currentAgent && (
            <div className="me">
              <Avatar name={currentAgent.name} presence={currentAgent.presence} />
              <div className="me-text">
                <strong>{currentAgent.name}</strong>
                <span>{currentAgent.role}</span>
              </div>
            </div>
          )}
        </div>
      </aside>
      <div className="sidebar-scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />

      <div className="main">
        <header className="appbar">
          <button type="button" className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Icon name="menu" />
          </button>
          <form className="global-search" role="search" onSubmit={onSearch}>
            <Icon name="search" size={16} />
            <label htmlFor="global-search" className="visually-hidden">Search tickets</label>
            <input
              id="global-search"
              type="search"
              placeholder="Search tickets, customers, IDs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          <div className="appbar-actions">
            <span className={`source-pill ${remote ? 'source-live' : ''}`} title={remote ? 'Saving to Supabase' : 'Changes are saved in this browser'}>
              <span className="source-dot" aria-hidden="true" />
              {remote ? 'Live' : 'Demo data'}
            </span>
            <button type="button" className="icon-btn has-dot" aria-label="Notifications">
              <Icon name="bell" />
            </button>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </header>
        <main className="content" id="main">
          {status === 'ready' && <Outlet />}
          {status === 'loading' && (
            <div className="page-state" role="status">
              <span className="spinner" aria-hidden="true" />
              Loading workspace…
            </div>
          )}
          {status === 'error' && (
            <div className="page-state">
              <div className="panel empty">
                <span className="empty-icon"><Icon name="alert" size={28} /></span>
                <h1 className="h3">Couldn’t reach the database</h1>
                <p>Check your Supabase settings and network connection.</p>
                <button type="button" className="btn btn-primary" onClick={reload}>Try again</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
