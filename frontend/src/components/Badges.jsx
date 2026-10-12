import { priorityLabel, statusLabel } from '../data/constants.js';
import { slaInfo } from '../lib/format.js';
import Icon from './Icon.jsx';

export function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      <span className="status-dot" aria-hidden="true" />
      {statusLabel(status)}
    </span>
  );
}

// Priority is shown with a bar glyph plus text, so it never relies on colour alone.
export function PriorityBadge({ priority }) {
  const level = { low: 1, medium: 2, high: 3, urgent: 4 }[priority] ?? 0;
  return (
    <span className={`priority priority-${priority}`}>
      <span className="priority-bars" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={n <= level ? 'on' : ''} />
        ))}
      </span>
      {priorityLabel(priority)}
    </span>
  );
}

export function SlaBadge({ ticket, now }) {
  const { state, label } = slaInfo(ticket, now);
  const icon = state === 'breached' ? 'alert' : state === 'met' ? 'check' : 'clock';
  return (
    <span className={`sla sla-${state}`}>
      <Icon name={icon} size={14} />
      {label}
    </span>
  );
}
