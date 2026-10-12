import { slaHoursFor } from '../data/constants.js';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function timeAgo(at, now = Date.now()) {
  const diff = Math.max(0, now - at);
  if (diff < MINUTE) return 'just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;
  return new Date(at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDateTime(at) {
  return new Date(at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(ms) {
  if (ms == null) return '-';
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / MINUTE))}m`;
  if (ms < DAY) return `${(ms / HOUR).toFixed(1).replace(/\.0$/, '')}h`;
  return `${(ms / DAY).toFixed(1).replace(/\.0$/, '')}d`;
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

// SLA = time to resolution target by priority. Resolved/closed tickets have no live SLA.
// state: 'met' | 'ok' | 'warning' (under 25% left) | 'breached'
export function slaInfo(ticket, now = Date.now()) {
  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    return { state: 'met', label: 'Done' };
  }
  const total = slaHoursFor(ticket.priority) * HOUR;
  const remaining = ticket.createdAt + total - now;
  if (remaining <= 0) return { state: 'breached', label: `Overdue ${formatDuration(-remaining)}` };
  return {
    state: remaining < total * 0.25 ? 'warning' : 'ok',
    label: `${formatDuration(remaining)} left`,
  };
}
