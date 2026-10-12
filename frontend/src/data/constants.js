// Product name in one place so it is easy to rebrand.
export const APP_NAME = 'Deskline';

export const STATUSES = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'pending', label: 'Pending' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

export const PRIORITY_LEVELS = [
  { key: 'urgent', label: 'Urgent', slaHours: 4 },
  { key: 'high', label: 'High', slaHours: 8 },
  { key: 'medium', label: 'Medium', slaHours: 24 },
  { key: 'low', label: 'Low', slaHours: 72 },
];

export const CATEGORIES = ['Technical', 'Billing', 'Account', 'Bug report', 'Feature request'];

export const CHANNELS = [
  { key: 'email', label: 'Email' },
  { key: 'chat', label: 'Live chat' },
  { key: 'phone', label: 'Phone' },
  { key: 'web', label: 'Web form' },
];

// Open work: anything not yet resolved or closed.
export const ACTIVE_STATUSES = ['open', 'in_progress', 'pending'];

export const statusLabel = (key) => STATUSES.find((s) => s.key === key)?.label ?? key;
export const priorityLabel = (key) => PRIORITY_LEVELS.find((p) => p.key === key)?.label ?? key;
export const channelLabel = (key) => CHANNELS.find((c) => c.key === key)?.label ?? key;
export const slaHoursFor = (priority) => PRIORITY_LEVELS.find((p) => p.key === priority)?.slaHours ?? 24;
