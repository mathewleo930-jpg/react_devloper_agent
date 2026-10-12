import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { APP_NAME } from '../data/constants.js';

const FEATURES = [
  { icon: 'inbox', title: 'One shared inbox', text: 'Email, chat, phone and web requests land in a single queue with views for every team.' },
  { icon: 'clock', title: 'SLA tracking', text: 'Resolution targets per priority, with countdowns and breach alerts before customers notice.' },
  { icon: 'board', title: 'Kanban board', text: 'Drag tickets across stages to see bottlenecks at a glance and keep work moving.' },
  { icon: 'lock', title: 'Internal notes', text: 'Collaborate privately on a ticket without leaving the conversation thread.' },
  { icon: 'chart', title: 'Reports that matter', text: 'First response, resolution time, channel mix and agent performance in one place.' },
  { icon: 'zap', title: 'Canned replies', text: 'Answer common questions in one click and set the next status as you send.' },
];

const STEPS = [
  { title: 'Capture', text: 'Requests from every channel become tickets with customer context attached.' },
  { title: 'Triage', text: 'Prioritise, categorise and assign, singly or in bulk, from smart views.' },
  { title: 'Resolve', text: 'Reply, add notes and close the loop while SLAs keep everyone on time.' },
];

const PLANS = [
  { name: 'Starter', price: '$0', period: 'forever', text: 'For small teams getting started.', features: ['3 agents', 'Email & web form', 'Basic reports'] },
  { name: 'Business', price: '$29', period: 'per agent / mo', text: 'For growing support teams.', features: ['Unlimited agents', 'All channels', 'SLA policies', 'Kanban board'], featured: true },
  { name: 'Enterprise', price: 'Custom', period: 'annual', text: 'For regulated and large teams.', features: ['SSO & audit logs', 'EU data residency', 'Dedicated success manager'] },
];

const FAQ = [
  ['Is this connected to a real backend?', 'It runs on demo data stored in your browser by default. Add Supabase credentials and the same UI reads and writes your database.'],
  ['Can I try it without signing up?', 'Yes. Open the demo and every screen works: create tickets, reply, drag cards and watch the reports update.'],
  ['Does it work on mobile?', 'The whole app is responsive, from the ticket list to the board and the conversation view.'],
];

function ProductPreview() {
  const rows = [
    ['TCK-1048', 'Cannot log in after enabling SSO', 'Urgent', 'open', '2h left'],
    ['TCK-1047', 'Invoice shows double charge', 'High', 'in_progress', '3h left'],
    ['TCK-1044', 'Webhook deliveries failing with 401', 'High', 'open', '5h left'],
    ['TCK-1045', 'How do I add a teammate as admin?', 'Low', 'pending', '2d left'],
  ];
  return (
    <div className="preview" aria-hidden="true">
      <div className="preview-bar">
        <span /><span /><span />
      </div>
      <div className="preview-body">
        <div className="preview-side">
          <div className="preview-logo" />
          {['Overview', 'Tickets', 'Board', 'Customers', 'Reports'].map((l, i) => (
            <div key={l} className={`preview-nav ${i === 1 ? 'on' : ''}`}>{l}</div>
          ))}
        </div>
        <div className="preview-main">
          <div className="preview-stats">
            {[['Open', '14'], ['Unassigned', '3'], ['First response', '42m']].map(([l, v]) => (
              <div key={l} className="preview-stat">
                <span>{l}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
          <div className="preview-table">
            {rows.map(([id, subject, prio, status, sla]) => (
              <div key={id} className="preview-row">
                <span className="preview-id">{id}</span>
                <span className="preview-subject">{subject}</span>
                <span className={`status-badge status-${status}`}><span className="status-dot" />{status.replace('_', ' ')}</span>
                <span className="preview-prio">{prio}</span>
                <span className="preview-sla">{sla}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing({ theme, onToggleTheme }) {
  return (
    <div className="landing">
      <header className="l-nav">
        <div className="l-wrap l-nav-inner">
          <Link to="/" className="brand">
            <img className="brand-logo" src={`${import.meta.env.BASE_URL}logo.svg`} alt="" width="28" height="28" />
            {APP_NAME}
          </Link>
          <nav aria-label="Landing" className="l-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="l-nav-actions">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <Link to="/app" className="btn btn-primary">Open app</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="l-wrap hero-inner">
            <span className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" /> Helpdesk for modern support teams
            </span>
            <h1>Every customer request, <span className="accent">resolved on time.</span></h1>
            <p className="hero-sub">
              {APP_NAME} brings tickets, conversations, SLAs and reporting into one fast workspace, so your team spends
              less time sorting and more time solving.
            </p>
            <div className="hero-cta">
              <Link to="/app" className="btn btn-primary btn-lg">
                Explore the live demo <Icon name="arrowRight" size={16} />
              </Link>
              <Link to="/app/tickets/new" className="btn btn-lg">Create a ticket</Link>
            </div>
            <p className="hero-note muted">No sign-up. Sample data included.</p>
          </div>
          <div className="l-wrap">
            <ProductPreview />
          </div>
        </section>

        <section className="l-section" id="features">
          <div className="l-wrap">
            <div className="l-head">
              <span className="eyebrow-plain">Features</span>
              <h2>Everything your support desk needs</h2>
              <p className="muted">Built around how support teams actually work, from first contact to resolution.</p>
            </div>
            <div className="feature-grid">
              {FEATURES.map((f) => (
                <article key={f.title} className="feature">
                  <span className="feature-icon"><Icon name={f.icon} size={20} /></span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="l-section l-alt" id="how">
          <div className="l-wrap">
            <div className="l-head">
              <span className="eyebrow-plain">How it works</span>
              <h2>From inbox to resolved in three steps</h2>
            </div>
            <ol className="steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className="step">
                  <span className="step-num">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="l-section" id="pricing">
          <div className="l-wrap">
            <div className="l-head">
              <span className="eyebrow-plain">Pricing</span>
              <h2>Simple plans that scale with you</h2>
            </div>
            <div className="pricing">
              {PLANS.map((p) => (
                <article key={p.name} className={`plan-card ${p.featured ? 'plan-featured' : ''}`}>
                  {p.featured && <span className="plan-flag">Most popular</span>}
                  <h3>{p.name}</h3>
                  <p className="muted">{p.text}</p>
                  <p className="plan-price">
                    <strong>{p.price}</strong> <span className="muted">{p.period}</span>
                  </p>
                  <ul>
                    {p.features.map((f) => (
                      <li key={f}><Icon name="check" size={16} /> {f}</li>
                    ))}
                  </ul>
                  <Link to="/app" className={`btn btn-block ${p.featured ? 'btn-primary' : ''}`}>Try the demo</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="l-section l-alt" id="faq">
          <div className="l-wrap l-narrow">
            <div className="l-head">
              <span className="eyebrow-plain">FAQ</span>
              <h2>Questions, answered</h2>
            </div>
            <div className="faq">
              {FAQ.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="l-cta">
          <div className="l-wrap l-cta-inner">
            <h2>Ready to see it in action?</h2>
            <p>Jump into a fully working helpdesk with sample tickets, customers and a team.</p>
            <Link to="/app" className="btn btn-lg btn-light">
              Open the demo <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="l-footer">
        <div className="l-wrap l-footer-inner">
          <span className="brand brand-sm">
            <img className="brand-logo" src={`${import.meta.env.BASE_URL}logo.svg`} alt="" width="22" height="22" />
            {APP_NAME}
          </span>
          <span className="muted">© {new Date().getFullYear()} {APP_NAME}. Demo project.</span>
        </div>
      </footer>
    </div>
  );
}
