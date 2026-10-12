import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CharCounter from '../components/CharCounter.jsx';
import Icon from '../components/Icon.jsx';
import { DESCRIPTION_MAX, TITLE_MAX } from '../charLimit.js';
import { CATEGORIES, CHANNELS, PRIORITY_LEVELS } from '../data/constants.js';
import { useTickets, useToast } from '../store/TicketStore.jsx';

export default function NewTicket() {
  const { customers, agents, createTicket } = useTickets();
  const notify = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerId: '',
    subject: '',
    description: '',
    priority: 'medium',
    category: CATEGORIES[0],
    channel: 'email',
    assigneeId: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!form.customerId) next.customerId = 'Choose a customer';
    if (!form.subject.trim()) next.subject = 'Subject is required';
    if (!form.description.trim()) next.description = 'Describe the issue';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setSaveError('');
    try {
      const id = await createTicket(form);
      notify(`${id} created`);
      navigate(`/app/tickets/${id}`);
    } catch {
      setSaveError('Couldn’t create the ticket. Check your connection and try again.');
      setSaving(false);
    }
  }

  const fieldClass = (name) => `input ${errors[name] ? 'input-invalid' : ''}`;

  return (
    <div className="page page-narrow">
      <Link to="/app/tickets" className="back-link">
        <Icon name="back" size={16} /> Tickets
      </Link>
      <div className="page-head">
        <div>
          <h1>New ticket</h1>
          <p className="page-sub">Log a request on behalf of a customer.</p>
        </div>
      </div>

      <form className="panel form-grid" onSubmit={onSubmit} noValidate>
        <div className="field field-full">
          <label htmlFor="nt-customer">Customer <span className="required">*</span></label>
          <select
            id="nt-customer"
            className={`select ${errors.customerId ? 'input-invalid' : ''}`}
            value={form.customerId}
            onChange={set('customerId')}
            aria-invalid={Boolean(errors.customerId)}
            aria-describedby={errors.customerId ? 'nt-customer-err' : undefined}
          >
            <option value="">Select a customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name} - {c.company}</option>
            ))}
          </select>
          {errors.customerId && <p id="nt-customer-err" className="field-error">{errors.customerId}</p>}
        </div>

        <div className="field field-full">
          <label htmlFor="nt-subject">Subject <span className="required">*</span></label>
          <input
            id="nt-subject"
            className={fieldClass('subject')}
            value={form.subject}
            maxLength={TITLE_MAX}
            onChange={set('subject')}
            placeholder="Short summary of the issue"
            aria-invalid={Boolean(errors.subject)}
            aria-describedby="nt-subject-count"
          />
          <div className="field-meta">
            {errors.subject && <p className="field-error">{errors.subject}</p>}
            <CharCounter id="nt-subject-count" length={form.subject.length} max={TITLE_MAX} />
          </div>
        </div>

        <div className="field field-full">
          <label htmlFor="nt-description">Description <span className="required">*</span></label>
          <textarea
            id="nt-description"
            className={fieldClass('description')}
            rows={6}
            value={form.description}
            maxLength={DESCRIPTION_MAX}
            onChange={set('description')}
            placeholder="What happened? Include steps, error messages and impact."
            aria-invalid={Boolean(errors.description)}
            aria-describedby="nt-description-count"
          />
          <div className="field-meta">
            {errors.description && <p className="field-error">{errors.description}</p>}
            <CharCounter id="nt-description-count" length={form.description.length} max={DESCRIPTION_MAX} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="nt-priority">Priority</label>
          <select id="nt-priority" className="select" value={form.priority} onChange={set('priority')}>
            {PRIORITY_LEVELS.map((p) => (
              <option key={p.key} value={p.key}>{p.label} - resolve within {p.slaHours}h</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="nt-category">Category</label>
          <select id="nt-category" className="select" value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="nt-channel">Channel</label>
          <select id="nt-channel" className="select" value={form.channel} onChange={set('channel')}>
            {CHANNELS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="nt-assignee">Assignee</label>
          <select id="nt-assignee" className="select" value={form.assigneeId} onChange={set('assigneeId')}>
            <option value="">Unassigned</option>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        {saveError && <p className="alert field-full" role="alert">{saveError}</p>}
        <div className="form-actions field-full">
          <Link to="/app/tickets" className="btn">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
