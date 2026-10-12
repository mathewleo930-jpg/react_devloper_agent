import { useState } from 'react';
import { APP_NAME, PRIORITY_LEVELS } from '../data/constants.js';
import { useTickets, useToast } from '../store/TicketStore.jsx';

const TABS = [
  { key: 'general', label: 'General' },
  { key: 'sla', label: 'SLA policies' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'data', label: 'Data' },
];

function Toggle({ id, label, hint, defaultChecked }) {
  const [on, setOn] = useState(Boolean(defaultChecked));
  return (
    <div className="setting-row">
      <div>
        <label htmlFor={id} className="setting-label">{label}</label>
        {hint && <p className="muted setting-hint">{hint}</p>}
      </div>
      <button id={id} type="button" role="switch" aria-checked={on} className="switch" onClick={() => setOn(!on)}>
        <span className="switch-thumb" />
      </button>
    </div>
  );
}

export default function Settings() {
  const { dispatch, remote: isRemote } = useTickets();
  const notify = useToast();
  const [tab, setTab] = useState('general');
  const save = (e) => {
    e.preventDefault();
    notify('Settings saved');
  };

  return (
    <div className="page page-narrow">
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p className="page-sub">Workspace preferences for your support team.</p>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Settings sections">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className="tab" onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <form className="panel" role="tabpanel" aria-label={TABS.find((t) => t.key === tab).label} onSubmit={save}>
        {tab === 'general' && (
          <div className="form-grid">
            <div className="field field-full">
              <label htmlFor="s-name">Workspace name</label>
              <input id="s-name" className="input" defaultValue={`${APP_NAME} Support`} />
            </div>
            <div className="field">
              <label htmlFor="s-email">Support email</label>
              <input id="s-email" className="input" type="email" defaultValue="support@deskline.dev" />
            </div>
            <div className="field">
              <label htmlFor="s-tz">Timezone</label>
              <select id="s-tz" className="select" defaultValue="Europe/London">
                <option>Europe/London</option>
                <option>America/New_York</option>
                <option>Asia/Kolkata</option>
                <option>Asia/Tokyo</option>
              </select>
            </div>
            <div className="field field-full">
              <label htmlFor="s-sig">Reply signature</label>
              <textarea id="s-sig" className="input" rows={3} defaultValue={'Best,\nThe Deskline Support Team'} />
            </div>
          </div>
        )}

        {tab === 'sla' && (
          <>
            <p className="muted">Resolution targets by priority. Tickets past their target are flagged as breached.</p>
            <div className="table-wrap">
              <table className="table table-plain">
                <thead>
                  <tr><th>Priority</th><th>First response</th><th>Resolution</th></tr>
                </thead>
                <tbody>
                  {PRIORITY_LEVELS.map((p) => (
                    <tr key={p.key}>
                      <td><strong>{p.label}</strong></td>
                      <td>{Math.max(1, Math.round(p.slaHours / 4))}h</td>
                      <td>{p.slaHours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'notifications' && (
          <div className="settings-list">
            <Toggle id="n-new" label="New ticket assigned to me" hint="Email and in-app alert." defaultChecked />
            <Toggle id="n-reply" label="Customer replies" hint="When a customer responds on my tickets." defaultChecked />
            <Toggle id="n-sla" label="SLA warnings" hint="25% of the resolution target left." defaultChecked />
            <Toggle id="n-digest" label="Daily digest" hint="A summary of open work at 9:00." />
          </div>
        )}

        {tab === 'data' && (
          <div className="settings-list">
            <div className="setting-row">
              <div>
                <span className="setting-label">Data source</span>
                <p className="muted setting-hint">
                  {isRemote
                    ? 'Connected to Supabase. Changes are saved to the database.'
                    : 'Demo mode. Changes are saved in this browser only.'}
                </p>
              </div>
              <span className={`presence-pill ${isRemote ? 'presence-pill-online' : 'presence-pill-away'}`}>
                {isRemote ? 'Supabase' : 'Local demo'}
              </span>
            </div>
            {!isRemote && (
              <div className="setting-row">
                <div>
                  <span className="setting-label">Reset demo data</span>
                  <p className="muted setting-hint">Restore the sample tickets, customers and team.</p>
                </div>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    dispatch({ type: 'reset' });
                    notify('Demo data restored');
                  }}
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        )}

        {(tab === 'general' || tab === 'notifications') && (
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save changes</button>
          </div>
        )}
      </form>
    </div>
  );
}
